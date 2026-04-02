import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateMagicToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email }: { email: string } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const token = await generateMagicToken(email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      // Dev mode: just return the link
      console.log("Magic link (dev):", magicLink);
      return NextResponse.json({ success: true, devLink: magicLink });
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "HN Digest <onboarding@resend.dev>",
      to: [email],
      subject: "Your login link for HN Digest",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 24px; margin-bottom: 8px;">Sign in to HN Digest</h2>
          <p style="color: #666; margin-bottom: 24px;">Click the link below to sign in. This link expires in 15 minutes.</p>
          <a href="${magicLink}" style="display: inline-block; background: #FF6600; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Sign in to HN Digest
          </a>
          <p style="color: #aaa; font-size: 13px; margin-top: 24px;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Magic link error:", err);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }
}
