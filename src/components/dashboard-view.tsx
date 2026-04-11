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

const chevron = <Icons.chevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-placeholder pointer-events-none" />;

const selectCls = "appearance-none border border-border rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-accent text-foreground bg-white";

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

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <p className="text-xs text-placeholder uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-placeholder mt-0.5">{sub}</p>}
    </div>
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
    <div className="flex items-center justify-between py-4 border-b border-card last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-placeholder mt-0.5">{hint}</p>
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
            className="border border-border rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-accent"
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-xs bg-foreground text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-placeholder hover:text-body">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-xs border border-border px-3 py-1.5 rounded-lg text-body hover:bg-surface transition-colors"
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

  if (!schedule) {
    return (
      <div className="min-h-screen bg-background">
        <Nav email={email} />
        <div className="max-w-4xl mx-auto px-8 py-24 text-center">
          <div className="text-5xl mb-6">✉️</div>
          <h2 className="font-serif text-3xl text-foreground mb-3">No newsletter yet</h2>
          <p className="text-subtle text-sm mb-8">
            Build your first newsletter in the AI editor and activate a schedule.
          </p>
          <Link
            href="/editor"
            className="inline-block bg-accent text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Open AI Editor →
          </Link>
        </div>
      </div>
    );
  }

  const { schedule: sched, sections, recipients, sendHistory = [], styles, hnConfig } = schedule;
  const sentCount = sendHistory.filter((s) => s.success).length;

  return (
    <div className="min-h-screen bg-background">
      <Nav email={email} />

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-6">

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-4xl text-foreground">{schedule.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                sched.active
                  ? "bg-green-100 text-green-700"
                  : "bg-card text-subtle"
              }`}>
                {sched.active ? "Active" : "Paused"}
              </span>
            </div>
            <p className="text-sm text-placeholder">Created {formatDate(schedule.createdAt)}</p>
          </div>
          <button
            onClick={toggleActive}
            disabled={toggling}
            className="text-sm border border-border px-4 py-2 rounded-full text-body hover:bg-card transition-colors disabled:opacity-40"
          >
            {toggling ? "…" : sched.active ? "Pause" : "Resume"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Sections" value={String(sections.filter((s) => !SECTION_META[s.type]?.structural).length)} sub="content blocks" />
          <StatCard label="Recipients" value={String(recipients.length)} sub={recipients.length === 0 ? "add below" : recipients.length === 1 ? "email address" : "email addresses"} />
          <StatCard
            label="Schedule"
            value={sched.frequency.charAt(0).toUpperCase() + sched.frequency.slice(1)}
            sub={`${utcTimeToLocal(sched.time, sched.timezone ?? "UTC")} ${getTzAbbr(sched.timezone ?? "UTC")}`}
          />
          <StatCard
            label="Next Send"
            value={nextSendText}
            sub={sentCount > 0 ? `${sentCount} sent total` : "no sends yet"}
          />
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Schedule</h2>
              <p className="text-xs text-placeholder mt-0.5">When your newsletter goes out</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
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

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  onBlur={(e) => setEditTime(normalizeTime(e.target.value))}
                  placeholder="HH:MM"
                  className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-foreground w-20"
                />
                <div className="relative">
                  <select
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value)}
                    className={`${selectCls} w-32`}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                  {chevron}
                </div>
              </div>

              <button
                disabled={savingSchedule || (
                  editFreq === sched.frequency &&
                  localTimeToUtc(editTime, editTimezone) === sched.time &&
                  editDay === (sched.day ?? 1) &&
                  editTimezone === (sched.timezone ?? "UTC")
                )}
                onClick={async () => {
                  setSavingSchedule(true);
                  await patch({ schedule: { ...sched, frequency: editFreq, time: localTimeToUtc(editTime, editTimezone), timezone: editTimezone, day: editDay } });
                  setSavingSchedule(false);
                }}
                className="text-sm bg-foreground text-white px-4 py-2 rounded-lg hover:bg-foreground-dark transition-colors disabled:opacity-40"
              >
                {savingSchedule ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 bg-white border border-border rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-4">Content Sections</h2>
              <div className="space-y-1">
                {sections.filter((s) => !SECTION_META[s.type]?.structural).map((section, i) => {
                  const meta = SECTION_META[section.type];
                  const effectiveCount = section.props.count
                    ?? (section.type === "hn-stories" ? hnConfig.count : section.type === "hiring" ? 4 : 5);
                  return (
                    <div key={section.id} className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-background">
                      <span className="text-xs text-placeholder w-4 text-right">{i + 1}</span>
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{meta.label}</span>
                        <span className="text-xs text-placeholder ml-1.5">{effectiveCount} items</span>
                      </div>
                      <button
                        onClick={async () => {
                          const newSections = schedule!.sections.filter((s) => s.id !== section.id);
                          setSchedule((prev) => prev ? { ...prev, sections: newSections } : prev);
                          await patch({ sections: newSections });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-placeholder hover:text-red-500 cursor-pointer"
                        title="Remove section"
                      >
                        <Icons.trash width={14} height={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-card pt-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Style & Config</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-background rounded-lg px-4 py-3">
                  <p className="text-xs text-placeholder mb-1">Font</p>
                  <p className="font-medium text-foreground capitalize">{styles.fontFamily}</p>
                </div>
                <div className="bg-background rounded-lg px-4 py-3">
                  <p className="text-xs text-placeholder mb-1">Header style</p>
                  <p className="font-medium text-foreground capitalize">{styles.headerStyle}</p>
                </div>
                <div className="bg-background rounded-lg px-4 py-3">
                  <p className="text-xs text-placeholder mb-1">HN category</p>
                  <p className="font-medium text-foreground">{hnConfig.category.replace("stories", " stories")}</p>
                </div>
                <div className="bg-background rounded-lg px-4 py-3">
                  <p className="text-xs text-placeholder mb-1">Accent color</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0"
                      style={{ background: styles.primaryColor }}
                    />
                    <p className="font-medium text-foreground font-mono text-xs">{styles.primaryColor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white border border-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Send History</h2>
            {sendHistory.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm text-placeholder">No sends yet.</p>
                <p className="text-xs text-[#bbb] mt-1">
                  Your first email will appear here after it's sent.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sendHistory.slice(0, 12).map((send, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-surface last:border-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${send.success ? "bg-green-500" : "bg-red-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">{formatDateTime(send.sentAt)}</p>
                      <p className="text-xs text-placeholder">
                        {send.success
                          ? `${send.recipientCount} recipient${send.recipientCount !== 1 ? "s" : ""}`
                          : `Failed · ${send.error?.slice(0, 30) ?? "unknown error"}`}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${send.success ? "text-green-600" : "text-red-500"}`}>
                      {send.success ? "Sent" : "Failed"}
                    </span>
                  </div>
                ))}
                {sendHistory.length > 12 && (
                  <p className="text-xs text-placeholder text-center pt-2">
                    +{sendHistory.length - 12} older sends
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Delivery email</h2>
          <p className="text-sm text-foreground">{recipients[0]}</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">API Keys</h2>
          <p className="text-xs text-placeholder mb-4">Your keys are encrypted at rest and never exposed.</p>

          <KeyField
            label="Resend API Key"
            hint="Used to send your newsletter emails"
            placeholder="re_…"
            onSave={(v) => patch({ resendApiKey: v }).then(() => {})}
          />
        </div>

        <div className="bg-white border border-red-100 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-xs text-placeholder mb-4">
            Deleting your newsletter removes all saved data including your encrypted API key. This cannot be undone.
          </p>
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-body">Are you sure?</p>
              <button
                onClick={deleteSchedule}
                disabled={deleting}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-placeholder hover:text-body"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete newsletter
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function Nav({ email }: { email: string }) {
  return (
    <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto border-b border-border">
      <Link href="/" className="text-sm font-medium text-foreground">
        HN Digest
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-subtle">{email}</span>
        <Link
          href="/editor"
          className="text-sm bg-foreground text-white px-4 py-2 rounded-full hover:bg-foreground-dark transition-colors"
        >
          Open Editor
        </Link>
      </div>
    </nav>
  );
}
