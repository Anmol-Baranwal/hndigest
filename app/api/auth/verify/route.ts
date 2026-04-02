import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, generateSessionToken, setSessionCookie } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid-link", req.url));
  }

  const payload = await verifyMagicToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/?error=expired-link", req.url));
  }

  const sessionToken = await generateSessionToken(payload.email);
  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  setSessionCookie(response, sessionToken);

  return response;
}
