import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "descarta_session";
const ANON_COOKIE = "dc_anon";
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return new TextEncoder().encode(secret);
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

function ensureAnonCookie(req: NextRequest, res: NextResponse) {
  if (req.cookies.get(ANON_COOKIE)) return;
  const id = crypto.randomUUID();
  res.cookies.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ANON_COOKIE_MAX_AGE,
  });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const authenticated = await hasValidSession(req);

    if (isLoginPage && authenticated) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (!isLoginPage && !authenticated) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  const res = NextResponse.next();
  ensureAnonCookie(req, res);
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
