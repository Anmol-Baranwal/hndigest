import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import {
  createSchedule,
  getScheduleByEmail,
  updateSchedule,
  deleteSchedule,
} from "../../../lib/db";
import { encrypt } from "../../../lib/encrypt";
import { NewsletterConfig } from "../../../lib/types";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await getScheduleByEmail(session.email);
  if (!record) return NextResponse.json({ schedule: null });

  const { encryptedResendKey: _, ...safe } = record;
  return NextResponse.json({ schedule: safe });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    config,
    resendApiKey,
  }: { config: NewsletterConfig; resendApiKey: string } = await req.json();

  if (!resendApiKey) {
    return NextResponse.json({ error: "Resend API key required" }, { status: 400 });
  }

  const existing = await getScheduleByEmail(session.email);
  const now = new Date().toISOString();

  const record = await createSchedule({
    id: existing?.id ?? randomUUID(),
    ownerEmail: session.email,
    encryptedResendKey: encrypt(resendApiKey),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...config,
  });

  const { encryptedResendKey: _, ...safe } = record;
  return NextResponse.json({ schedule: safe });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getScheduleByEmail(session.email);
  if (!existing) return NextResponse.json({ error: "No schedule found" }, { status: 404 });

  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = { ...body };

  if (body.resendApiKey) {
    updates.encryptedResendKey = encrypt(body.resendApiKey);
    delete updates.resendApiKey;
  }
  if (body.llmApiKey) {
    updates.encryptedLlmKey = encrypt(body.llmApiKey);
    delete updates.llmApiKey;
  }

  const updated = await updateSchedule(existing.id, updates);
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  const { encryptedResendKey: _r, encryptedLlmKey: _l, ...safe } = updated;
  return NextResponse.json({ schedule: safe });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getScheduleByEmail(session.email);
  if (!existing) return NextResponse.json({ error: "No schedule found" }, { status: 404 });

  await deleteSchedule(existing.id);
  return NextResponse.json({ success: true });
}
