import { createHash, randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { forgotSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/utils";

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`forgot:${ip}`, 3, 15 * 60_000)) throw new ApiError(429, "Too many requests. Try again later.");

  const { email } = forgotSchema.parse(await readJson(req));
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.status === "ACTIVE") {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"), // only the hash is stored
        expiresAt: new Date(Date.now() + 60 * 60_000),
      },
    });
    const link = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Reset your Celestia Estates password",
      `<p>Click the link below to choose a new password. It expires in 1 hour.</p><p><a href="${link}">${link}</a></p>`
    );
  }
  // Same response whether or not the account exists.
  return json({ ok: true, message: "If that email is registered, a reset link has been sent." });
});
