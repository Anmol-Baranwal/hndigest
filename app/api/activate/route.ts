import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSchedule } from "../../../lib/db";
import { encrypt } from "../../../lib/encrypt";
import { generateMagicToken } from "../../../lib/auth";
import { NewsletterConfig } from "../../../lib/types";
import { randomUUID } from "crypto";

// Saves schedule + sends magic link in one unauthenticated call.
// The user proves email ownership by clicking the magic link.
export async function POST(req: NextRequest) {
  try {
    const {
      email,
      config,
      resendApiKey,
    }: { email: string; config: NewsletterConfig; resendApiKey: string } =
      await req.json();

    if (!email || !resendApiKey) {
      return NextResponse.json(
        { error: "Email and Resend API key required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    createSchedule({
      id: randomUUID(),
      ownerEmail: email,
      encryptedResendKey: encrypt(resendApiKey),
      createdAt: now,
      updatedAt: now,
      ...config,
      schedule: { ...config.schedule, active: true },
    });

    const token = await generateMagicToken(email);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "HN Digest <onboarding@resend.dev>",
        to: email,
        subject: "Your HN Digest dashboard link",
        html: `<p>Click to access your dashboard and manage your newsletter:</p>
               <p><a href="${magicLink}">${magicLink}</a></p>
               <p>This link expires in 15 minutes.</p>`,
      });
      return NextResponse.json({ success: true });
    }

    // Dev mode — return link directly
    return NextResponse.json({ success: true, devLink: magicLink });
  } catch (err) {
    console.error("Activate error:", err);
    return NextResponse.json(
      { error: "Failed to activate" },
      { status: 500 }
    );
  }
}
