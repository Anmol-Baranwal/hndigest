import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { activateDraftSchedule, createSchedule, getScheduleById, setQstashScheduleId } from "../../../lib/db";
import { encrypt, decrypt } from "../../../lib/encrypt";
import { generateMagicToken } from "../../../lib/auth";
import { scheduleDigest } from "../../../lib/qstash";
import { NewsletterConfig } from "../../../lib/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      config,
      resendApiKey,
      scheduleId: draftId,
    }: { email: string; config: NewsletterConfig; resendApiKey?: string; scheduleId?: string } =
      await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    let scheduleId: string;
    let userResendKey: string;

    if (draftId) {
      // Promote the draft: set real owner_email + mark active
      const draft = await getScheduleById(draftId);
      if (!draft) {
        return NextResponse.json({ error: "Draft schedule not found" }, { status: 404 });
      }
      await activateDraftSchedule(draftId, email);
      scheduleId = draftId;
      userResendKey = decrypt(draft.encryptedResendKey);
    } else {
      if (!resendApiKey) {
        return NextResponse.json({ error: "Resend API key required" }, { status: 400 });
      }
      scheduleId = randomUUID();
      userResendKey = resendApiKey;
      const recipients = config.recipients.length > 0 ? config.recipients : [email];
      await createSchedule({
        id: scheduleId,
        ownerEmail: email,
        encryptedResendKey: encrypt(resendApiKey),
        createdAt: now,
        updatedAt: now,
        ...config,
        recipients,
        schedule: { ...config.schedule, active: true },
      });
    }

    // Create QStash schedule (non-blocking on failure)
    if (process.env.QSTASH_TOKEN) {
      try {
        const qstashId = await scheduleDigest(
          scheduleId,
          config.schedule.frequency,
          config.schedule.time,
          config.schedule.day
        );
        await setQstashScheduleId(scheduleId, qstashId);
      } catch (err) {
        console.error("QStash schedule creation failed:", err);
      }
    }

    const token = await generateMagicToken(email);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `https://${req.headers.get("host")}`;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    // Use the user's own Resend key to send the magic link
    try {
      const resend = new Resend(userResendKey);
      await resend.emails.send({
        from: "HN Digest <onboarding@resend.dev>",
        to: email,
        subject: "Your HN Digest dashboard link",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="font-size: 24px; margin-bottom: 8px;">You're all set!</h2>
            <p style="color: #666; margin-bottom: 24px;">Click below to access your HN Digest dashboard. This link expires in 30 minutes.</p>
            <a href="${magicLink}" style="display: inline-block; background: #FF6600; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Open Dashboard
            </a>
            <p style="color: #aaa; font-size: 13px; margin-top: 24px;">If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
      return NextResponse.json({ success: true });
    } catch {
      // Key worked for test but failed here — fall back to dev link
      return NextResponse.json({ success: true, devLink: magicLink });
    }
  } catch (err) {
    console.error("Activate error:", err);
    return NextResponse.json({ error: "Failed to activate" }, { status: 500 });
  }
}
