import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getJwtSecret } from "./secrets";

const getSecret = () => new TextEncoder().encode(getJwtSecret());

export async function generateMagicToken(email: string): Promise<string> {
  return new SignJWT({ email, type: "magic-link" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyMagicToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "magic-link") return null;
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export async function generateSessionToken(email: string): Promise<string> {
  return new SignJWT({ email, type: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "session") return null;
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<{ email: string } | null> {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
