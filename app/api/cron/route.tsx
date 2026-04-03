import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { getAllActiveSchedules, updateSchedule } from "../../../lib/db";
import { decrypt } from "../../../lib/encrypt";
import { generateUnsubscribeToken } from "../../../lib/auth";
import { fetchNewsletterData } from "../../../lib/hn/index";
import NewsletterEmail from "../../../emails/newsletter";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await getAllActiveSchedules();
  const now = new Date();
  const results: { email: string; status: string }[] = [];

  for (const record of schedules) {
    try {
      if (!shouldSendNow(record.schedule.frequency, record.schedule.time, now, record.schedule.day)) {
        results.push({ email: record.ownerEmail, status: "skipped" });
        continue;
      }

      const data = await fetchNewsletterData(record);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hndigest.vercel.app";
      const unsubscribeToken = await generateUnsubscribeToken(record.ownerEmail);
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;
      const html = await render(<NewsletterEmail config={record} data={data} unsubscribeUrl={unsubscribeUrl} />);

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

      results.push({ email: record.ownerEmail, status: "sent" });
    } catch (err) {
      console.error(`Failed to send for ${record.ownerEmail}:`, err);
      const history = record.sendHistory ?? [];
      await updateSchedule(record.id, {
        sendHistory: [
          { sentAt: now.toISOString(), recipientCount: record.recipients.length, success: false, error: String(err) },
          ...history,
        ].slice(0, 50),
      });
      results.push({ email: record.ownerEmail, status: "failed" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

function shouldSendNow(
  frequency: "daily" | "weekly" | "monthly",
  sendTime: string,
  now: Date,
  day?: number
): boolean {
  const [hours, minutes] = sendTime.split(":").map(Number);
  const scheduledMinutes = hours * 60 + minutes;
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  if (Math.abs(currentMinutes - scheduledMinutes) > 30) return false;

  if (frequency === "daily") return true;
  if (frequency === "weekly") return now.getUTCDay() === (day ?? 1);
  if (frequency === "monthly") return now.getUTCDate() === (day ?? 1);
  return false;
}
