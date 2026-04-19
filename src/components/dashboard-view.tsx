"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScheduleRecord } from "../lib/types";
import { SECTION_META } from "../lib/section-meta";
import { TIMEZONES, localTimeToUtc, utcTimeToLocal, getTzAbbr } from "../lib/timezones";
import { Icons } from "./icons";

interface Props {
  email: string;
  schedule: ScheduleRecord | null;
}

function normalizeTime(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "08:00";
  if (digits.length <= 2) return `${String(Math.min(23, +digits)).padStart(2, "0")}:00`;
  const h = Math.min(23, +digits.slice(0, 2));
  const m = Math.min(59, +digits.slice(2, 4));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const chevron = (
  <Icons.chevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-placeholder" />
);

const controlBase =
  "border border-[color:var(--hairline-strong)] bg-[color:var(--surface-elevated)] rounded-xl text-[13px] text-ink ease-editorial transition-colors focus:outline-none focus:border-accent focus:bg-white";
const selectCls = `${controlBase} appearance-none pl-3.5 pr-9 py-2.5`;
const inputCls = `${controlBase} px-3.5 py-2.5`;

function nextSendLabel(frequency: string, time: string, active: boolean, day?: number): string {
  if (!active) return "Paused";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "Invalid time";
  const now = new Date();
  const next = new Date(now);

  if (frequency === "daily") {
    next.setUTCHours(h, m, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  } else if (frequency === "weekly") {
    const target = day ?? 1;
    const current = now.getUTCDay();
    let daysUntil = (target - current + 7) % 7;
    if (daysUntil === 0) {
      next.setUTCHours(h, m, 0, 0);
      if (next <= now) daysUntil = 7;
    }
    next.setUTCDate(now.getUTCDate() + daysUntil);
    next.setUTCHours(h, m, 0, 0);
  } else {
    const target = day ?? 1;
    next.setUTCDate(target);
    next.setUTCHours(h, m, 0, 0);
    if (next <= now) next.setUTCMonth(next.getUTCMonth() + 1);
  }

  const diff = next.getTime() - now.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `in ${hours}h`;
  return `in ${Math.floor(hours / 24)}d`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function Bezel({
  children,
  className = "",
  inner = "",
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  inner?: string;
  tone?: "light" | "ink";
}) {
  const outer =
    tone === "ink"
      ? "bg-[color:var(--card)] ring-[color:var(--hairline-strong)]"
      : "bg-[color:var(--card)] ring-[color:var(--hairline-strong)]";
  const innerBg =
    tone === "ink"
      ? "grain-ink bg-ink text-[color:var(--surface-elevated)]"
      : "bg-[color:var(--surface-elevated)]";
  return (
    <div className={`rad-outer relative ring-1 p-1.5 ${outer} ${className}`}>
      <div className={`rad-inner relative ${innerBg} ${inner}`}>{children}</div>
    </div>
  );
}

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`eyebrow text-muted ${className}`}>{children}</span>;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Bezel>
      <div className="flex h-full flex-col justify-between p-5 md:p-6">
        <Eyebrow>{label}</Eyebrow>
        <div className="mt-6">
          <p className={`font-serif text-[40px] leading-none tracking-tight ${accent ? "text-accent" : "text-ink"}`}>
            {value}
          </p>
          {sub && <p className="mt-2 text-[11.5px] text-subtle">{sub}</p>}
        </div>
      </div>
    </Bezel>
  );
}

function KeyField({
  label, hint, onSave, placeholder, type = "password",
}: {
  label: string; hint: string; onSave: (v: string) => Promise<void>; placeholder?: string; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
    setEditing(false);
    setValue("");
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[color:var(--hairline)] last:border-0">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[12px] text-subtle">{hint}</p>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={placeholder}
            className={`${inputCls} w-56`}
          />
          <button
            onClick={save}
            disabled={saving}
            className="btn-magnet rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-[color:var(--surface-elevated)] ease-spring transition-all disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="text-[12px] text-subtle hover:text-ink ease-editorial transition-colors">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-4 py-2 text-[12px] text-body ease-editorial transition-colors hover:border-accent hover:text-ink"
        >
          Update
        </button>
      )}
    </div>
  );
}

export function DashboardView({ email, schedule: initialSchedule }: Props) {
  const router = useRouter();
  const [schedule, setSchedule] = useState(initialSchedule);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [addingRecipient, setAddingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [editFreq, setEditFreq] = useState<"daily" | "weekly" | "monthly">(initialSchedule?.schedule.frequency ?? "daily");
  const [editTimezone, setEditTimezone] = useState(initialSchedule?.schedule.timezone ?? "UTC");
  const [editTime, setEditTime] = useState(
    utcTimeToLocal(initialSchedule?.schedule.time ?? "08:00", initialSchedule?.schedule.timezone ?? "UTC")
  );
  const [editDay, setEditDay] = useState<number>(initialSchedule?.schedule.day ?? 1);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [nextSendText, setNextSendText] = useState("…");

  useEffect(() => {
    if (!schedule) return;
    setNextSendText(nextSendLabel(schedule.schedule.frequency, schedule.schedule.time, schedule.schedule.active, schedule.schedule.day));
  }, [schedule]);

  const patch = async (body: object) => {
    const res = await fetch("/api/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Update failed");
    const data = await res.json();
    setSchedule(data.schedule);
    return data.schedule;
  };

  const toggleActive = async () => {
    if (!schedule) return;
    setToggling(true);
    try {
      await patch({ schedule: { ...schedule.schedule, active: !schedule.schedule.active } });
    } finally {
      setToggling(false);
    }
  };

  const deleteSchedule = async () => {
    setDeleting(true);
    await fetch("/api/schedule", { method: "DELETE" });
    router.push("/");
  };

  const addRecipient = async () => {
    if (!schedule || !newRecipient.includes("@")) return;
    if (schedule.recipients.includes(newRecipient.trim())) {
      setRecipientError("This email is already added.");
      return;
    }
    setRecipientError("");
    setAddingRecipient(true);
    try {
      await patch({ recipients: [...schedule.recipients, newRecipient.trim()] });
      setNewRecipient("");
    } finally {
      setAddingRecipient(false);
    }
  };

  const removeRecipient = async (email: string) => {
    if (!schedule) return;
    await patch({ recipients: schedule.recipients.filter((r) => r !== email) });
  };

  void addRecipient;
  void removeRecipient;
  void addingRecipient;
  void recipientError;
  void setNewRecipient;
  void newRecipient;

  if (!schedule) {
    return (
      <div className="relative min-h-screen bg-background text-ink">
        <div className="grain-overlay" aria-hidden />
        <Nav email={email} />
        <div className="mx-auto max-w-3xl px-6 pt-24 pb-32 text-center md:pt-32">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-elevated)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
          <h2 className="font-serif text-[56px] leading-[0.98] tracking-tight text-ink md:text-[72px]">
            No newsletter <em className="italic text-accent">yet.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-body">
            Build your first newsletter in the AI editor and activate a schedule to see your dashboard come alive.
          </p>
          <Link
            href="/editor"
            className="group btn-magnet mt-10 inline-flex items-center gap-3 rounded-full bg-ink py-3 pl-7 pr-2 text-[14px] font-medium text-[color:var(--surface-elevated)] ease-spring transition-all"
          >
            Open AI editor
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white ease-spring transition-transform duration-500 group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-[1.06]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11L11 3" />
                <path d="M5 3h6v6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const { schedule: sched, sections, recipients, sendHistory = [], styles, hnConfig } = schedule;
  const sentCount = sendHistory.filter((s) => s.success).length;
  const scheduleDirty =
    editFreq !== sched.frequency ||
    localTimeToUtc(editTime, editTimezone) !== sched.time ||
    editDay !== (sched.day ?? 1) ||
    editTimezone !== (sched.timezone ?? "UTC");

  return (
    <div className="relative min-h-screen bg-background text-ink">
      <div className="grain-overlay" aria-hidden />
      <Nav email={email} />

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 md:px-8 md:py-12">

        <Bezel>
          <div className="relative overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-50 glow-warm" aria-hidden />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <Eyebrow>newsletter</Eyebrow>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ease-editorial transition-colors ${
                      sched.active
                        ? "bg-[#e8f2d9] text-[color:var(--moss)] ring-1 ring-[color:var(--moss)]/20"
                        : "bg-[color:var(--card)] text-subtle ring-1 ring-[color:var(--hairline-strong)]"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${sched.active ? "bg-[color:var(--moss)]" : "bg-subtle"}`} />
                    {sched.active ? "Active" : "Paused"}
                  </span>
                </div>
                <h1 className="mt-3 font-serif text-[44px] leading-[1.02] tracking-tight text-ink md:text-[60px]">
                  {schedule.title}
                </h1>
                <p className="mt-2 text-[13px] text-subtle">Created {formatDate(schedule.createdAt)}</p>
              </div>
              <button
                onClick={toggleActive}
                disabled={toggling}
                className="group btn-magnet flex items-center gap-3 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] py-2.5 pl-5 pr-2 text-[13px] text-ink ease-spring transition-all hover:border-accent disabled:opacity-40"
              >
                {toggling ? "…" : sched.active ? "Pause schedule" : "Resume schedule"}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[color:var(--surface-elevated)] ease-spring transition-transform duration-500 group-hover:scale-[1.05]">
                  {sched.active ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                      <rect x="2.5" y="2" width="2.5" height="8" rx="0.6" />
                      <rect x="7" y="2" width="2.5" height="8" rx="0.6" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                      <path d="M3 2v8l7-4z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </Bezel>

        {/* ─── Stats row ─── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard
            label="Sections"
            value={String(sections.filter((s) => !SECTION_META[s.type]?.structural).length)}
            sub="content blocks"
          />
          <StatCard
            label="Recipients"
            value={String(recipients.length)}
            sub={recipients.length === 0 ? "add below" : recipients.length === 1 ? "email address" : "email addresses"}
          />
          <StatCard
            label="Schedule"
            value={sched.frequency.charAt(0).toUpperCase() + sched.frequency.slice(1)}
            sub={`${utcTimeToLocal(sched.time, sched.timezone ?? "UTC")} ${getTzAbbr(sched.timezone ?? "UTC")}`}
          />
          <StatCard
            label="Next send"
            value={nextSendText}
            sub={sentCount > 0 ? `${sentCount} sent total` : "no sends yet"}
            accent
          />
        </div>

        {/* ─── Schedule editor ─── */}
        <Bezel>
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <Eyebrow>control</Eyebrow>
                <h2 className="mt-1.5 font-serif text-[28px] leading-tight text-ink">Schedule</h2>
                <p className="mt-1 text-[12.5px] text-subtle">When your newsletter goes out.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <select
                    value={editFreq}
                    onChange={(e) => { const f = e.target.value as "daily" | "weekly" | "monthly"; setEditFreq(f); setEditDay(1); }}
                    className={selectCls}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {chevron}
                </div>

                {editFreq === "weekly" && (
                  <div className="relative">
                    <select value={editDay} onChange={(e) => setEditDay(Number(e.target.value))} className={selectCls}>
                      {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => (
                        <option key={d} value={i}>{d}</option>
                      ))}
                    </select>
                    {chevron}
                  </div>
                )}

                {editFreq === "monthly" && (
                  <div className="relative">
                    <select value={editDay} onChange={(e) => setEditDay(Number(e.target.value))} className={selectCls}>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d === 1 ? "1st" : d === 2 ? "2nd" : d === 3 ? "3rd" : `${d}th`}
                        </option>
                      ))}
                    </select>
                    {chevron}
                  </div>
                )}

                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  onBlur={(e) => setEditTime(normalizeTime(e.target.value))}
                  placeholder="HH:MM"
                  className={`${inputCls} w-[92px] tabular-nums`}
                />

                <div className="relative">
                  <select
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value)}
                    className={`${selectCls} w-36`}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                  {chevron}
                </div>

                <button
                  disabled={savingSchedule || !scheduleDirty}
                  onClick={async () => {
                    setSavingSchedule(true);
                    await patch({ schedule: { ...sched, frequency: editFreq, time: localTimeToUtc(editTime, editTimezone), timezone: editTimezone, day: editDay } });
                    setSavingSchedule(false);
                  }}
                  className="btn-magnet rounded-xl bg-ink px-4 py-2.5 text-[13px] font-medium text-[color:var(--surface-elevated)] ease-spring transition-all hover:bg-[color:var(--foreground-dark)] disabled:opacity-40"
                >
                  {savingSchedule ? "Saving…" : "Update"}
                </button>
              </div>
            </div>
          </div>
        </Bezel>

        {/* ─── Sections + Send History split ─── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
          <div className="md:col-span-3">
            <Bezel>
              <div className="flex h-full flex-col gap-6 p-6 md:p-8">
                <div>
                  <div className="flex items-end justify-between">
                    <div>
                      <Eyebrow>content</Eyebrow>
                      <h2 className="mt-1.5 font-serif text-[28px] leading-tight text-ink">Sections</h2>
                    </div>
                    <Link
                      href="/editor"
                      className="eyebrow rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-3 py-1.5 text-muted ease-editorial transition-colors hover:border-accent hover:text-ink"
                    >
                      edit in editor
                    </Link>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--surface)]">
                    {sections.filter((s) => !SECTION_META[s.type]?.structural).length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-[13px] text-subtle">No content sections yet. Open the editor to add some.</p>
                      </div>
                    ) : (
                      sections.filter((s) => !SECTION_META[s.type]?.structural).map((section, i, arr) => {
                        const meta = SECTION_META[section.type];
                        const effectiveCount = section.props.count
                          ?? (section.type === "hn-stories" ? hnConfig.count : section.type === "hiring" ? 4 : 5);
                        return (
                          <div
                            key={section.id}
                            className={`group flex items-center gap-4 px-4 py-3.5 ease-editorial transition-colors hover:bg-[color:var(--surface-elevated)] ${
                              i < arr.length - 1 ? "border-b border-[color:var(--hairline)]" : ""
                            }`}
                          >
                            <span className="font-mono text-[10px] tracking-[0.2em] text-placeholder w-5 text-right">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold"
                              style={{ color: meta.color, background: `${meta.color}14` }}
                            >
                              {meta.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13.5px] font-medium text-ink">{meta.label}</div>
                              <div className="text-[11.5px] text-subtle">
                                {effectiveCount} {effectiveCount === 1 ? "item" : "items"}
                              </div>
                            </div>
                            <span className="h-1.5 w-1.5 rounded-full opacity-60" style={{ background: meta.color }} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-[color:var(--hairline)] pt-6">
                  <Eyebrow>appearance</Eyebrow>
                  <h3 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">Style &amp; config</h3>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ConfigTile label="Font" value={styles.fontFamily} />
                    <ConfigTile label="Header style" value={styles.headerStyle} />
                    <ConfigTile label="HN category" value={hnConfig.category.replace("stories", " stories")} />
                    <ConfigTile
                      label="Accent color"
                      value={styles.primaryColor}
                      valueClassName="font-mono text-[12px]"
                      leading={
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-full border border-[color:var(--hairline-strong)]"
                          style={{ background: styles.primaryColor }}
                        />
                      }
                    />
                  </div>
                </div>
              </div>
            </Bezel>
          </div>

          <div className="md:col-span-2">
            <Bezel className="h-full">
              <div className="flex h-full flex-col p-6 md:p-7">
                <div className="flex items-end justify-between">
                  <div>
                    <Eyebrow>delivery</Eyebrow>
                    <h2 className="mt-1.5 font-serif text-[28px] leading-tight text-ink">Send history</h2>
                  </div>
                  {sendHistory.length > 0 && (
                    <span className="eyebrow rounded-full bg-[color:var(--surface)] px-2.5 py-1 text-muted">
                      {sentCount} sent
                    </span>
                  )}
                </div>

                {sendHistory.length === 0 ? (
                  <div className="mt-8 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-6 py-10 text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--surface-elevated)] ring-1 ring-[color:var(--hairline-strong)]">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="14" height="12" rx="2" />
                        <path d="M3 6l7 5 7-5" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-ink">No sends yet.</p>
                    <p className="mt-1 text-[11.5px] text-subtle">Your first email will appear here after it lands.</p>
                  </div>
                ) : (
                  <>
                    {/* Sparkline of last 12 sends — bar height = recipients reached */}
                    {(() => {
                      const bars = sendHistory.slice(0, 12).slice().reverse();
                      const maxRecipients = Math.max(
                        1,
                        ...bars.map((s) => s.recipientCount || 0)
                      );
                      return (
                        <div className="mt-5 rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--surface)] p-4">
                          <div className="flex h-16 items-end gap-[4px]">
                            {bars.map((s, i) => {
                              const count = s.recipientCount || 0;
                              const ratio = count / maxRecipients;
                              const height = Math.max(10, Math.round(ratio * 60));
                              return (
                                <div
                                  key={i}
                                  className={`flex-1 rounded-sm transition-colors ${
                                    s.success ? "bg-accent/80" : "bg-[color:var(--terracotta)]/60"
                                  }`}
                                  style={{ height: `${height}px` }}
                                  title={`${formatDateTime(s.sentAt)} · ${count} ${count === 1 ? "recipient" : "recipients"}`}
                                />
                              );
                            })}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-placeholder">
                            <span>older</span>
                            <span className="font-mono tracking-[0.14em] uppercase">height · recipients</span>
                            <span>recent</span>
                          </div>
                        </div>
                      );
                    })()}

                    <ul className="mt-4 flex-1 space-y-0">
                      {sendHistory.slice(0, 8).map((send, i, arr) => (
                        <li
                          key={i}
                          className={`flex items-center gap-3 py-3 ${
                            i < arr.length - 1 ? "border-b border-[color:var(--hairline)]" : ""
                          }`}
                        >
                          <span
                            className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ring-2 ${
                              send.success
                                ? "bg-[color:var(--moss)] ring-[color:var(--moss)]/20"
                                : "bg-[color:var(--terracotta)] ring-[color:var(--terracotta)]/20"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] text-ink">{formatDateTime(send.sentAt)}</p>
                            <p className="text-[11px] text-subtle truncate">
                              {send.success
                                ? `${send.recipientCount} recipient${send.recipientCount !== 1 ? "s" : ""}`
                                : `Failed · ${send.error?.slice(0, 40) ?? "unknown error"}`}
                            </p>
                          </div>
                          <span
                            className={`eyebrow ${
                              send.success ? "text-[color:var(--moss)]" : "text-[color:var(--terracotta)]"
                            }`}
                          >
                            {send.success ? "sent" : "failed"}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {sendHistory.length > 8 && (
                      <p className="mt-3 text-center text-[11px] text-subtle">
                        +{sendHistory.length - 8} older sends
                      </p>
                    )}
                  </>
                )}
              </div>
            </Bezel>
          </div>
        </div>

        {/* ─── Delivery email ─── */}
        <Bezel>
          <div className="flex flex-col items-start justify-between gap-3 p-6 md:flex-row md:items-center md:p-8">
            <div>
              <Eyebrow>inbox</Eyebrow>
              <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">Delivery email</h2>
              <p className="mt-1 text-[12px] text-subtle">Where your digest lands.</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-4 py-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/12 text-accent">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1.5" y="2.5" width="9" height="7" rx="1" />
                  <path d="M1.5 3.5l4.5 3 4.5-3" />
                </svg>
              </span>
              <span className="text-[13px] text-ink">{recipients[0]}</span>
            </div>
          </div>
        </Bezel>

        {/* ─── API Keys ─── */}
        <Bezel>
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/25">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="13" r="3" />
                  <path d="M9.2 10.8L16 4" />
                  <path d="M14 6l1.5 1.5" />
                  <path d="M12.5 7.5l1 1" />
                </svg>
              </span>
              <div>
                <Eyebrow>security</Eyebrow>
                <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">API keys</h2>
                <p className="mt-1 text-[12px] text-subtle">Encrypted at rest, never exposed.</p>
              </div>
            </div>

            <div className="mt-6">
              <KeyField
                label="Resend API key"
                hint="Used to send your newsletter emails"
                placeholder="re_…"
                onSave={(v) => patch({ resendApiKey: v }).then(() => {})}
              />
            </div>
          </div>
        </Bezel>

        {/* ─── Danger zone ─── */}
        <div className="rad-outer relative p-1.5 ring-1 ring-[color:var(--terracotta)]/25 bg-[color:var(--terracotta)]/6">
          <div className="rad-inner bg-[color:var(--surface-elevated)] p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--terracotta)]/12 text-[color:var(--terracotta)] ring-1 ring-[color:var(--terracotta)]/25">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3l8 14H2z" />
                    <path d="M10 8v4" />
                    <circle cx="10" cy="15" r="0.4" fill="currentColor" />
                  </svg>
                </span>
                <div>
                  <Eyebrow className="text-[color:var(--terracotta)]">danger zone</Eyebrow>
                  <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">Delete newsletter</h2>
                  <p className="mt-1 max-w-md text-[12.5px] text-body">
                    Removes all saved data including your encrypted API key. This cannot be undone.
                  </p>
                </div>
              </div>

              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={deleteSchedule}
                    disabled={deleting}
                    className="btn-magnet rounded-full bg-[color:var(--terracotta)] px-4 py-2.5 text-[13px] font-medium text-white ease-spring transition-all disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-4 py-2.5 text-[13px] text-body ease-editorial transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="btn-magnet rounded-full border border-[color:var(--terracotta)]/40 bg-[color:var(--terracotta)]/8 px-5 py-2.5 text-[13px] font-medium text-[color:var(--terracotta)] ease-spring transition-all hover:bg-[color:var(--terracotta)]/14"
                >
                  Delete newsletter
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ConfigTile({
  label,
  value,
  valueClassName = "",
  leading,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  leading?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-3.5">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1.5 flex items-center gap-2">
        {leading}
        <span className={`text-[14px] font-medium text-ink capitalize ${valueClassName}`}>{value}</span>
      </div>
    </div>
  );
}

function Nav({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 pointer-events-none">
      <nav className="pointer-events-auto mx-auto mt-5 flex w-max max-w-[94vw] items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-elevated)]/75 px-2 py-2 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_24px_60px_-20px_rgba(21,18,13,0.16)]">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full px-3 py-1.5 ease-editorial transition-colors hover:bg-[color:var(--hairline)]"
        >
          <svg width="18" height="21" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg" className="ease-spring transition-transform duration-500 group-hover:rotate-[-6deg]">
            <path d="M11 0C11 0 18 6 18 13C18 17.4 15.2 20.5 13 22C13.5 20 13 18 11.5 16.5C11 19 9 21 7 22.5C5 21 4 18.5 4 16C4 13.5 5.5 11.5 7 10C7 12 7.5 13.5 8.5 14.5C8.5 10 11 0 11 0Z" fill="var(--accent)"/>
            <ellipse cx="11" cy="23" rx="4" ry="2.5" fill="var(--accent)" opacity="0.25"/>
          </svg>
          <span className="font-serif text-[17px] leading-none text-ink">HN Digest</span>
        </Link>

        <span className="mx-1 hidden h-5 w-px bg-[color:var(--hairline-strong)] sm:block" />

        <span className="hidden items-center gap-2 rounded-full bg-[color:var(--surface)] px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[12px] text-ink-soft">{email}</span>
        </span>

        <Link
          href="/editor"
          className="group btn-magnet relative flex items-center gap-2 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-[color:var(--surface-elevated)] ease-spring transition-all hover:bg-[color:var(--foreground-dark)]"
        >
          Open editor
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white ease-spring transition-transform duration-500 group-hover:translate-x-[2px] group-hover:-translate-y-[1px] group-hover:scale-[1.06]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9L9 3" />
              <path d="M4 3h5v5" />
            </svg>
          </span>
        </Link>
      </nav>
    </header>
  );
}
