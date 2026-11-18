import { createHash } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Share links look like  /ref/EMMANU25  or  /ref/EMMANU25?to=/properties/some-slug
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const to = req.nextUrl.searchParams.get("to");
  const path = to && to.startsWith("/") && !to.startsWith("//") ? to : "/";
  const base = process.env.APP_URL ?? req.nextUrl.origin;
  const res = NextResponse.redirect(new URL(path, base));

  const rc = await prisma.referralCode.findFirst({
    where: { code: code.toUpperCase(), isActive: true, partner: { status: "APPROVED" } },
    select: { id: true, code: true },
  });
  if (!rc) return res;

  // First touch wins: keep an existing valid referral cookie instead of overwriting it.
  const existing = req.cookies.get("celestia_ref")?.value;
  if (!existing) {
    res.cookies.set("celestia_ref", rc.code, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await prisma.referralClick
    .create({
      data: {
        codeId: rc.id,
        ipHash: createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET}`).digest("hex"),
        userAgent: (req.headers.get("user-agent") ?? "").slice(0, 255),
        landingPath: path.slice(0, 255),
      },
    })
    .catch(() => null);
  return res;
}
