import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { paystackInitSchema } from "@/lib/validation";
import { absoluteUrl } from "@/lib/seo";

export const POST = handle(async (req) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new ApiError(500, "Online payments are not configured");

  const user = await requireUser();
  const data = paystackInitSchema.parse(await readJson(req));
  const t = await prisma.transaction.findUnique({ where: { id: data.transactionId }, include: { payments: { where: { status: "SUCCESSFUL" } } } });
  if (!t) throw new ApiError(404, "Transaction not found");

  const isStaff = ["SUPER_ADMIN", "MANAGER"].includes(user.role.name);
  if (!isStaff && t.customerId !== user.id) throw new ApiError(403, "This transaction does not belong to you");
  if (t.status === "COMPLETED" || t.status === "CANCELLED") throw new ApiError(409, `Transaction is ${t.status.toLowerCase()}`);

  const remaining = Number(t.amount) - t.payments.reduce((s, p) => s + Number(p.amount), 0);
  const amount = data.amount ?? remaining;
  if (amount <= 0 || amount > remaining + 0.005) throw new ApiError(422, `Amount must be between 1 and the remaining balance (${remaining.toLocaleString()})`);

  const reference = `CE-${t.id}-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const payment = await prisma.payment.create({ data: { transactionId: t.id, amount, method: "paystack", reference, status: "PENDING" } });
  await prisma.paymentTransaction.create({ data: { paymentId: payment.id, reference, amount, currency: t.currency } });

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: t.buyerEmail ?? user.email, amount: Math.round(amount * 100), currency: t.currency, reference,
      callback_url: absoluteUrl("/customer/dashboard"),
    }),
  });
  const body = (await res.json().catch(() => null)) as { data?: { authorization_url: string } } | null;
  if (!res.ok || !body?.data) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    throw new ApiError(502, "Could not start the payment. Please try again.");
  }
  return json({ authorizationUrl: body.data.authorization_url, reference });
});
