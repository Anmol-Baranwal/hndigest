import { neon } from "@neondatabase/serverless";
import { ScheduleRecord } from "./types";

function sql() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set");
  return neon(url);
}

async function ensureTables() {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS newsletters (
      id TEXT PRIMARY KEY,
      owner_email TEXT UNIQUE NOT NULL,
      encrypted_resend_key TEXT,
      encrypted_llm_key TEXT,
      llm_provider TEXT,
      title TEXT,
      sections JSONB,
      styles JSONB,
      hn_config JSONB,
      schedule JSONB,
      recipients JSONB,
      send_history JSONB,
      qstash_schedule_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Migrate existing tables
  await db`ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS qstash_schedule_id TEXT`;
}

function toRecord(row: Record<string, unknown>): ScheduleRecord {
  return {
    id: row.id as string,
    ownerEmail: row.owner_email as string,
    encryptedResendKey: (row.encrypted_resend_key as string) ?? "",
    encryptedLlmKey: row.encrypted_llm_key as string | undefined,
    llmProvider: row.llm_provider as ScheduleRecord["llmProvider"],
    title: (row.title as string) ?? "",
    sections: (row.sections as ScheduleRecord["sections"]) ?? [],
    styles: row.styles as ScheduleRecord["styles"],
    hnConfig: row.hn_config as ScheduleRecord["hnConfig"],
    schedule: row.schedule as ScheduleRecord["schedule"],
    recipients: (row.recipients as string[]) ?? [],
    sendHistory: (row.send_history as ScheduleRecord["sendHistory"]) ?? [],
    qstashScheduleId: row.qstash_schedule_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createSchedule(record: ScheduleRecord): Promise<ScheduleRecord> {
  await ensureTables();
  const db = sql();
  await db`
    INSERT INTO newsletters (
      id, owner_email, encrypted_resend_key, encrypted_llm_key, llm_provider,
      title, sections, styles, hn_config, schedule, recipients, send_history,
      qstash_schedule_id, created_at, updated_at
    ) VALUES (
      ${record.id}, ${record.ownerEmail}, ${record.encryptedResendKey},
      ${record.encryptedLlmKey ?? null}, ${record.llmProvider ?? null},
      ${record.title}, ${JSON.stringify(record.sections)}, ${JSON.stringify(record.styles)},
      ${JSON.stringify(record.hnConfig)}, ${JSON.stringify(record.schedule)},
      ${JSON.stringify(record.recipients)}, ${JSON.stringify(record.sendHistory ?? [])},
      ${record.qstashScheduleId ?? null}, ${record.createdAt}, ${record.updatedAt}
    )
    ON CONFLICT (owner_email) DO UPDATE SET
      encrypted_resend_key = EXCLUDED.encrypted_resend_key,
      encrypted_llm_key = EXCLUDED.encrypted_llm_key,
      llm_provider = EXCLUDED.llm_provider,
      title = EXCLUDED.title,
      sections = EXCLUDED.sections,
      styles = EXCLUDED.styles,
      hn_config = EXCLUDED.hn_config,
      schedule = EXCLUDED.schedule,
      recipients = EXCLUDED.recipients,
      send_history = EXCLUDED.send_history,
      qstash_schedule_id = EXCLUDED.qstash_schedule_id,
      updated_at = EXCLUDED.updated_at
  `;
  return record;
}

export async function getScheduleByEmail(email: string): Promise<ScheduleRecord | null> {
  await ensureTables();
  const db = sql();
  const rows = await db`SELECT * FROM newsletters WHERE owner_email = ${email} LIMIT 1`;
  return rows.length ? toRecord(rows[0]) : null;
}

export async function getScheduleById(id: string): Promise<ScheduleRecord | null> {
  await ensureTables();
  const db = sql();
  const rows = await db`SELECT * FROM newsletters WHERE id = ${id} LIMIT 1`;
  return rows.length ? toRecord(rows[0]) : null;
}

export async function updateSchedule(
  id: string,
  updates: Partial<ScheduleRecord>
): Promise<ScheduleRecord | null> {
  await ensureTables();
  const db = sql();
  const now = new Date().toISOString();
  const rows = await db`
    UPDATE newsletters SET
      encrypted_resend_key = COALESCE(${updates.encryptedResendKey ?? null}, encrypted_resend_key),
      encrypted_llm_key = COALESCE(${updates.encryptedLlmKey ?? null}, encrypted_llm_key),
      llm_provider = COALESCE(${updates.llmProvider ?? null}, llm_provider),
      title = COALESCE(${updates.title ?? null}, title),
      sections = COALESCE(${updates.sections ? JSON.stringify(updates.sections) : null}::jsonb, sections),
      styles = COALESCE(${updates.styles ? JSON.stringify(updates.styles) : null}::jsonb, styles),
      hn_config = COALESCE(${updates.hnConfig ? JSON.stringify(updates.hnConfig) : null}::jsonb, hn_config),
      schedule = COALESCE(${updates.schedule ? JSON.stringify(updates.schedule) : null}::jsonb, schedule),
      recipients = COALESCE(${updates.recipients ? JSON.stringify(updates.recipients) : null}::jsonb, recipients),
      send_history = COALESCE(${updates.sendHistory ? JSON.stringify(updates.sendHistory) : null}::jsonb, send_history),
      qstash_schedule_id = COALESCE(${updates.qstashScheduleId ?? null}, qstash_schedule_id),
      updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length ? toRecord(rows[0]) : null;
}

export async function deleteSchedule(id: string): Promise<boolean> {
  await ensureTables();
  const db = sql();
  const rows = await db`DELETE FROM newsletters WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function setQstashScheduleId(id: string, qstashScheduleId: string | null): Promise<void> {
  await ensureTables();
  const db = sql();
  await db`UPDATE newsletters SET qstash_schedule_id = ${qstashScheduleId}, updated_at = NOW() WHERE id = ${id}`;
}

export async function getAllActiveSchedules(): Promise<ScheduleRecord[]> {
  await ensureTables();
  const db = sql();
  const rows = await db`SELECT * FROM newsletters WHERE (schedule->>'active')::boolean = true`;
  return rows.map(toRecord);
}
