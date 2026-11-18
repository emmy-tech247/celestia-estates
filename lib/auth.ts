import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { RoleName } from "@prisma/client";
import prisma from "./prisma";
import { ApiError } from "./api";

export const SESSION_COOKIE = "celestia_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (32+ characters).");
  return new TextEncoder().encode(s);
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export async function createSession(userId: bigint, role: RoleName) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId.toString())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Loads the user fresh from the DB, so suspended users lose access immediately. */
export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.sub as string) },
      include: { role: true },
    });
    return user && user.status === "ACTIVE" ? user : null;
  } catch {
    return null;
  }
}

/** Server-side RBAC guard: throws 401/403 so handlers never run for the wrong role. */
export async function requireUser(...allowed: RoleName[]) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Authentication required");
  if (allowed.length && !allowed.includes(user.role.name)) {
    throw new ApiError(403, "You do not have permission to do this");
  }
  return user;
}

/** For server-rendered dashboard pages/layouts: redirects instead of throwing. */
export async function requirePageRole(allowed: RoleName[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowed.includes(user.role.name)) redirect("/");
  return user;
}
