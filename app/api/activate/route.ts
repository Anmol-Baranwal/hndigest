import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSchedule } from "../../../lib/db";
import { encrypt } from "../../../lib/encrypt";
import { generateMagicToken } from "../../../lib/auth";
import { NewsletterConfig } from "../../../lib/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      config,
      resendApiKey,
    }: { email: string; config: NewsletterConfig; resendApiKey: string } =
      await req.json();

    if (!email || !resendApiKey) {
      return NextResponse.json({ error: "Email and Resend API key required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const recipients = config.recipients.length > 0 ? config.recipients : [email];

    await createSchedule({
      id: randomUUID(),
      ownerEmail: email,
      encryptedResendKey: resendApiKey ? encrypt(resendApiKey) : "",
      createdAt: now,
      updatedAt: now,
      ...config,
      recipients,
      schedule: { ...config.schedule, active: true },
    });

    const token = await generateMagicToken(email);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `https://${req.headers.get("host")}`;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "HN Digest <onboarding@resend.dev>",
        to: email,
        subject: "Your HN Digest dashboard link",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="font-size: 24px; margin-bottom: 8px;">You're all set!</h2>
            <p style="color: #666; margin-bottom: 24px;">Click below to access your HN Digest dashboard. This link expires in 15 minutes.</p>
            <a href="${magicLink}" style="display: inline-block; background: #FF6600; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Open Dashboard
            </a>
            <p style="color: #aaa; font-size: 13px; margin-top: 24px;">If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, devLink: magicLink });
  } catch (err) {
    console.error("Activate error:", err);
    return NextResponse.json({ error: "Failed to activate" }, { status: 500 });
  }
}
