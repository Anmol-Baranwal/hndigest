import fs from "fs";
import path from "path";
import { ScheduleRecord } from "./types";

const DB_PATH = path.join(process.cwd(), ".newsletter-db.json");

interface DB {
  schedules: ScheduleRecord[];
  magicTokens: { token: string; email: string; expiresAt: number }[];
}

function readDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    return { schedules: [], magicTokens: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { schedules: [], magicTokens: [] };
  }
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function createSchedule(record: ScheduleRecord): ScheduleRecord {
  const db = readDB();
  // one newsletter per user — upsert by email
  const existing = db.schedules.findIndex((s) => s.ownerEmail === record.ownerEmail);
  if (existing >= 0) {
    db.schedules[existing] = record;
  } else {
    db.schedules.push(record);
  }
  writeDB(db);
  return record;
}

export function getScheduleByEmail(email: string): ScheduleRecord | null {
  const db = readDB();
  return db.schedules.find((s) => s.ownerEmail === email) ?? null;
}

export function getScheduleById(id: string): ScheduleRecord | null {
  const db = readDB();
  return db.schedules.find((s) => s.id === id) ?? null;
}

export function updateSchedule(
  id: string,
  updates: Partial<ScheduleRecord>
): ScheduleRecord | null {
  const db = readDB();
  const idx = db.schedules.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  db.schedules[idx] = { ...db.schedules[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.schedules[idx];
}

export function deleteSchedule(id: string): boolean {
  const db = readDB();
  const before = db.schedules.length;
  db.schedules = db.schedules.filter((s) => s.id !== id);
  writeDB(db);
  return db.schedules.length < before;
}

export function getAllActiveSchedules(): ScheduleRecord[] {
  const db = readDB();
  return db.schedules.filter((s) => s.schedule.active);
}
