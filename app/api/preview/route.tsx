import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import NewsletterEmail from "../../../emails/newsletter";
import { fetchNewsletterData } from "../../../lib/hn/index";
import { NewsletterConfig } from "../../../lib/types";

export async function POST(req: NextRequest) {
  try {
    const { config }: { config: NewsletterConfig } = await req.json();
    const data = await fetchNewsletterData(config);
    const html = await render(<NewsletterEmail config={config} data={data} />);
    return NextResponse.json({ html });
  } catch (err) {
    console.error("Preview error:", err);
    return NextResponse.json({ error: "Failed to render preview" }, { status: 500 });
  }
}
