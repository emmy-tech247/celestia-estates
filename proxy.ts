import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Next.js 16 renamed middleware.ts to proxy.ts.
// This only gates PAGES for a better UX. Real enforcement lives in the API routes (requireUser).
const ACCESS: Record<string, string[]> = {
  "/admin": ["SUPER_ADMIN", "MANAGER"],
  "/agent": ["AGENT", "SUPER_ADMIN", "MANAGER"],
  "/customer": ["CUSTOMER"],
  "/partner": ["REFERRAL_PARTNER"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const section = Object.keys(ACCESS).find((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!section) return NextResponse.next();

  const login = new URL("/login", req.url);
  login.searchParams.set("next", pathname);

  const token = req.cookies.get("celestia_session")?.value;
  if (!token) return NextResponse.redirect(login);

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
    if (!ACCESS[section].includes(payload.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(login);
  }
}

export const config = { matcher: ["/admin/:path*", "/agent/:path*", "/customer/:path*", "/partner/:path*"] };
