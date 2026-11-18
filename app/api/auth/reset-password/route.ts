import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { handle, json, readJson, ApiError } from "@/lib/api";
import { resetSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

export const POST = handle(async (req) => {
  const { token, password } = resetSchema.parse(await readJson(req));
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    throw new ApiError(400, "This reset link is invalid or has expired");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.passwordReset.deleteMany({ where: { userId: reset.userId } }),
  ]);
  return json({ ok: true, message: "Password updated. You can now sign in." });
});
