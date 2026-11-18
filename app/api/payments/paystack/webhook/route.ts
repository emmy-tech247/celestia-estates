import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";

// Paystack calls this after a charge. We trust the HMAC signature, not the browser redirect.
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new Response("not configured", { status: 500 });

  const raw = await req.text();
  const given = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(given, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("invalid signature", { status: 401 });

  const event = JSON.parse(raw) as { event: string; data: { reference: string; amount: number; status: string } };
  if (event.event !== "charge.success") return new Response("ok");

  const pt = await prisma.paymentTransaction.findUnique({ where: { reference: event.data.reference } });
  if (!pt || pt.status === "SUCCESSFUL") return new Response("ok"); // unknown or already processed (idempotent)

  const paidNaira = event.data.amount / 100;
  if (event.data.status !== "success" || Math.abs(paidNaira - Number(pt.amount)) > 0.01) {
    await prisma.paymentTransaction.update({ where: { id: pt.id }, data: { status: "FAILED", rawPayload: event as object } });
    await prisma.payment.update({ where: { id: pt.paymentId }, data: { status: "FAILED" } });
    return new Response("ok");
  }

  await prisma.$transaction([
    prisma.paymentTransaction.update({ where: { id: pt.id }, data: { status: "SUCCESSFUL", rawPayload: event as object } }),
    prisma.payment.update({ where: { id: pt.paymentId }, data: { status: "SUCCESSFUL", paidAt: new Date() } }),
  ]);
  return new Response("ok");
}
