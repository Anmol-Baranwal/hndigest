import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { createDraftSchedule, logTestSend } from "../../../lib/db";
import { encrypt } from "../../../lib/encrypt";
import { fetchNewsletterData } from "../../../lib/hn/index";
import NewsletterEmail from "../../../emails/newsletter";
import { NewsletterConfig } from "../../../lib/types";
import { randomUUID } from "crypto";

// Called by activate modal: creates a draft schedule record, then sends test email
export async function POST(req: NextRequest) {
  try {
    const {
      config,
      resendApiKey,
      recipients,
    }: { config: NewsletterConfig; resendApiKey: string; recipients: string[] } =
      await req.json();

    if (!resendApiKey) {
      return NextResponse.json({ error: "Resend API key required" }, { status: 400 });
    }
    if (!recipients?.length) {
      return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const scheduleId = randomUUID();

    // Create draft record (placeholder owner_email, inactive — will be claimed on activation)
    await createDraftSchedule({
      id: scheduleId,
      ownerEmail: `draft-${scheduleId}`,
      encryptedResendKey: encrypt(resendApiKey),
      createdAt: now,
      updatedAt: now,
      ...config,
      recipients,
      schedule: { ...config.schedule, active: false },
    });

    // Send test email
    const data = await fetchNewsletterData(config);
    const html = await render(
      <NewsletterEmail config={config} data={data} unsubscribeUrl="#" />
    );
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "HN Digest <onboarding@resend.dev>",
      to: recipients,
      subject: `${config.title} — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
      html,
    });

    // Log for launch analytics (fire-and-forget)
    const testId = randomUUID();
    logTestSend(testId, scheduleId, config.title, recipients).catch(console.error);

    return NextResponse.json({ success: true, scheduleId });
  } catch (err) {
    console.error("Test send error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 }
    );
  }
}
