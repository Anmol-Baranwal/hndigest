import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "../../../lib/auth";
import { getScheduleByEmail, updateSchedule, setQstashScheduleId } from "../../../lib/db";
import { cancelDigest } from "../../../lib/qstash";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  }

  const payload = await verifyUnsubscribeToken(token);
  if (!payload) {
    return new NextResponse("This unsubscribe link is invalid or expired.", { status: 400 });
  }

  const schedule = await getScheduleByEmail(payload.ownerEmail);
  if (schedule) {
    if (schedule.qstashScheduleId && process.env.QSTASH_TOKEN) {
      await cancelDigest(schedule.qstashScheduleId);
      await setQstashScheduleId(schedule.id, null);
    }
    await updateSchedule(schedule.id, {
      schedule: { ...schedule.schedule, active: false },
    });
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;text-align:center">
      <h2 style="font-size:24px;margin-bottom:8px">Unsubscribed</h2>
      <p style="color:#666">You've been unsubscribed from this newsletter.</p>
      <p style="margin-top:24px"><a href="https://hndigest.vercel.app" style="color:#FF6600">HN Digest</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
