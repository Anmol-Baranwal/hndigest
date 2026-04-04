import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { getScheduleById, updateSchedule } from "../../../lib/db";
import { decrypt } from "../../../lib/encrypt";
import { generateUnsubscribeToken } from "../../../lib/auth";
import { fetchNewsletterData } from "../../../lib/hn/index";
import NewsletterEmail from "../../../emails/newsletter";

// Called by QStash on schedule: POST /api/send?id=<scheduleId>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing schedule id" }, { status: 400 });
  }

  const record = await getScheduleById(id);
  if (!record) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }
  if (!record.schedule.active) {
    return NextResponse.json({ status: "inactive" });
  }

  const now = new Date();
  try {
    const data = await fetchNewsletterData(record);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hndigest.vercel.app";
    const unsubscribeToken = await generateUnsubscribeToken(record.ownerEmail);
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;
    const html = await render(
      <NewsletterEmail config={record} data={data} unsubscribeUrl={unsubscribeUrl} />
    );

    const resendKey = decrypt(record.encryptedResendKey);
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "HN Digest <onboarding@resend.dev>",
      to: record.recipients,
      subject: `${record.title} — ${now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}`,
      html,
    });

    const history = record.sendHistory ?? [];
    await updateSchedule(record.id, {
      sendHistory: [
        { sentAt: now.toISOString(), recipientCount: record.recipients.length, success: true },
        ...history,
      ].slice(0, 50),
    });

    return NextResponse.json({ status: "sent" });
  } catch (err) {
    console.error(`Failed to send for ${record.ownerEmail}:`, err);
    const history = record.sendHistory ?? [];
    await updateSchedule(record.id, {
      sendHistory: [
        {
          sentAt: now.toISOString(),
          recipientCount: record.recipients.length,
          success: false,
          error: String(err),
        },
        ...history,
      ].slice(0, 50),
    });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
