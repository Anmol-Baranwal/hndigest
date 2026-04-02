import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import NewsletterEmail from "../../../emails/newsletter";
import { fetchNewsletterData } from "../../../lib/hn";
import { NewsletterConfig } from "../../../lib/types";

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

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
    }

    const data = await fetchNewsletterData(config);
    const html = await render(<NewsletterEmail config={config} data={data} />);

    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      from: "HN Digest <onboarding@resend.dev>",
      to: recipients,
      subject: `${config.title} — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
      html,
    });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error("Send error:", err);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
