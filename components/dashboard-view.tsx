"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScheduleRecord, SectionType } from "../lib/types";

interface Props {
  email: string;
  schedule: ScheduleRecord | null;
}

const SECTION_META: Record<SectionType, { label: string; icon: string; color: string; bg: string; structural?: boolean }> = {
  "hn-stories":     { label: "Top Stories",   icon: "#",  color: "#FF6600", bg: "#fff5f0" },
  "show-hn":        { label: "Show HN",        icon: "S",  color: "#7C3AED", bg: "#f5f0ff" },
  "hiring":         { label: "Who's Hiring",   icon: "H",  color: "#0284C7", bg: "#f0f7ff" },
  "open-source":    { label: "Open Source",    icon: "★",  color: "#16A34A", bg: "#f0fdf4" },
  "most-commented": { label: "Most Discussed", icon: "D",  color: "#DC2626", bg: "#fff0f0" },
  "heading":        { label: "Heading",         icon: "T",  color: "#6B7280", bg: "#f9fafb", structural: true },
  "divider":        { label: "Divider",         icon: "—",  color: "#9CA3AF", bg: "#f9fafb", structural: true },
  "custom-text":    { label: "Text Block",      icon: "P",  color: "#6B7280", bg: "#f9fafb", structural: true },
  "intro":          { label: "Intro",           icon: "I",  color: "#F59E0B", bg: "#fffbf0", structural: true },
  "footer":         { label: "Footer",          icon: "F",  color: "#6B7280", bg: "#f9fafb", structural: true },
};

function normalizeTime(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "08:00";
  if (digits.length <= 2) return `${String(Math.min(23, +digits)).padStart(2, "0")}:00`;
  const h = Math.min(23, +digits.slice(0, 2));
  const m = Math.min(59, +digits.slice(2, 4));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Less than 1h";
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
    <div className="bg-white border border-[#e8e6e0] rounded-xl p-5">
      <p className="text-xs text-[#aaa] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#1a1a1a]">{value}</p>
      {sub && <p className="text-xs text-[#aaa] mt-0.5">{sub}</p>}
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
    <div className="flex items-center justify-between py-4 border-b border-[#f0efe9] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
        <p className="text-xs text-[#aaa] mt-0.5">{hint}</p>
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
            className="border border-[#e8e6e0] rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-[#FF6600]"
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-xs bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-[#aaa] hover:text-[#666]">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-xs border border-[#e8e6e0] px-3 py-1.5 rounded-lg text-[#666] hover:bg-[#f8f7f4] transition-colors"
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
  const [llmProvider, setLlmProvider] = useState<"openai" | "anthropic" | "gemini">(
    initialSchedule?.llmProvider ?? "openai"
  );
  const [editFreq, setEditFreq] = useState<"daily" | "weekly" | "monthly">(initialSchedule?.schedule.frequency ?? "daily");
  const [editTime, setEditTime] = useState(initialSchedule?.schedule.time ?? "08:00");
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
      <div className="min-h-screen bg-[#fafaf8]">
        <Nav email={email} />
        <div className="max-w-4xl mx-auto px-8 py-24 text-center">
          <div className="text-5xl mb-6">✉️</div>
          <h2 className="font-serif text-3xl text-[#1a1a1a] mb-3">No newsletter yet</h2>
          <p className="text-[#888] text-sm mb-8">
            Build your first newsletter in the AI editor and activate a schedule.
          </p>
          <Link
            href="/editor"
            className="inline-block bg-[#FF6600] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#e55b00] transition-colors"
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
    <div className="min-h-screen bg-[#fafaf8]">
      <Nav email={email} />

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-6">

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-4xl text-[#1a1a1a]">{schedule.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                sched.active
                  ? "bg-green-100 text-green-700"
                  : "bg-[#f0efe9] text-[#888]"
              }`}>
                {sched.active ? "Active" : "Paused"}
              </span>
            </div>
            <p className="text-sm text-[#aaa]">Created {formatDate(schedule.createdAt)}</p>
          </div>
          <button
            onClick={toggleActive}
            disabled={toggling}
            className="text-sm border border-[#e8e6e0] px-4 py-2 rounded-full text-[#666] hover:bg-[#f0efe9] transition-colors disabled:opacity-40"
          >
            {toggling ? "…" : sched.active ? "Pause" : "Resume"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Sections" value={String(sections.length)} sub="content blocks" />
          <StatCard label="Recipients" value={String(recipients.length)} sub={recipients.length === 0 ? "add below" : recipients.length === 1 ? "email address" : "email addresses"} />
          <StatCard
            label="Schedule"
            value={sched.frequency.charAt(0).toUpperCase() + sched.frequency.slice(1)}
            sub={`${sched.time} UTC`}
          />
          <StatCard
            label="Next Send"
            value={nextSendText}
            sub={sentCount > 0 ? `${sentCount} sent total` : "no sends yet"}
          />
        </div>

        <div className="bg-white border border-[#e8e6e0] rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a1a]">Schedule</h2>
              <p className="text-xs text-[#aaa] mt-0.5">When your newsletter goes out</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={editFreq}
                onChange={(e) => {
                  const f = e.target.value as "daily" | "weekly" | "monthly";
                  setEditFreq(f);
                  setEditDay(f === "weekly" ? 1 : 1);
                }}
                className="border border-[#e8e6e0] rounded-lg px-2 pr-10 py-2 text-sm focus:outline-none focus:border-[#FF6600] text-[#1a1a1a] bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              {editFreq === "weekly" && (
                <select
                  value={editDay}
                  onChange={(e) => setEditDay(Number(e.target.value))}
                  className="border border-[#e8e6e0] rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#FF6600] text-[#1a1a1a] bg-white"
                >
                  {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              )}

              {editFreq === "monthly" && (
                <select
                  value={editDay}
                  onChange={(e) => setEditDay(Number(e.target.value))}
                  className="border border-[#e8e6e0] rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#FF6600] text-[#1a1a1a] bg-white"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d === 1 ? "1st" : d === 2 ? "2nd" : d === 3 ? "3rd" : `${d}th`}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  onBlur={(e) => setEditTime(normalizeTime(e.target.value))}
                  placeholder="HH:MM"
                  className="border border-[#e8e6e0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600] text-[#1a1a1a] w-24"
                />
                <span className="text-xs text-[#aaa]">UTC</span>
              </div>

              <button
                disabled={savingSchedule || (
                  editFreq === sched.frequency &&
                  editTime === sched.time &&
                  editDay === (sched.day ?? 1)
                )}
                onClick={async () => {
                  setSavingSchedule(true);
                  await patch({ schedule: { ...sched, frequency: editFreq, time: editTime, day: editDay } });
                  setSavingSchedule(false);
                }}
                className="text-sm bg-[#1a1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-40"
              >
                {savingSchedule ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 bg-white border border-[#e8e6e0] rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4">Content Sections</h2>
              <div className="space-y-1">
                {sections.filter((s) => !SECTION_META[s.type]?.structural).map((section, i) => {
                  const meta = SECTION_META[section.type];
                  const count = section.props.count;
                  return (
                    <div key={section.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#fafaf8]">
                      <span className="text-xs text-[#aaa] w-4 text-right">{i + 1}</span>
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-[#1a1a1a]">{meta.label}</span>
                        {count && <span className="text-xs text-[#aaa] ml-1.5">{count} items</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#f0efe9] pt-5">
              <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Style & Config</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#fafaf8] rounded-lg px-4 py-3">
                  <p className="text-xs text-[#aaa] mb-1">Font</p>
                  <p className="font-medium text-[#1a1a1a] capitalize">{styles.fontFamily}</p>
                </div>
                <div className="bg-[#fafaf8] rounded-lg px-4 py-3">
                  <p className="text-xs text-[#aaa] mb-1">Header style</p>
                  <p className="font-medium text-[#1a1a1a] capitalize">{styles.headerStyle}</p>
                </div>
                <div className="bg-[#fafaf8] rounded-lg px-4 py-3">
                  <p className="text-xs text-[#aaa] mb-1">HN category</p>
                  <p className="font-medium text-[#1a1a1a]">{hnConfig.category.replace("stories", " stories")}</p>
                </div>
                <div className="bg-[#fafaf8] rounded-lg px-4 py-3">
                  <p className="text-xs text-[#aaa] mb-1">Accent color</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-[#e8e6e0] flex-shrink-0"
                      style={{ background: styles.primaryColor }}
                    />
                    <p className="font-medium text-[#1a1a1a] font-mono text-xs">{styles.primaryColor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white border border-[#e8e6e0] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4">Send History</h2>
            {sendHistory.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm text-[#aaa]">No sends yet.</p>
                <p className="text-xs text-[#bbb] mt-1">
                  Your first email will appear here after it's sent.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sendHistory.slice(0, 12).map((send, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#f8f7f4] last:border-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${send.success ? "bg-green-500" : "bg-red-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#1a1a1a]">{formatDateTime(send.sentAt)}</p>
                      <p className="text-xs text-[#aaa]">
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
                  <p className="text-xs text-[#aaa] text-center pt-2">
                    +{sendHistory.length - 12} older sends
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e8e6e0] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Send to</h2>
            <span className="text-xs text-[#aaa]">{recipients.length} / 3</span>
          </div>
          <p className="text-xs text-[#aaa] mb-4">Your personal delivery addresses. Max 3.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {recipients.length === 0 && (
              <p className="text-sm text-[#aaa]">No addresses yet. Add yours below.</p>
            )}
            {recipients.map((r) => (
              <div
                key={r}
                className="flex items-center gap-1.5 bg-[#f8f7f4] border border-[#e8e6e0] rounded-full pl-3 pr-1 py-1"
              >
                <span className="text-sm text-[#1a1a1a]">{r}</span>
                <button
                  onClick={() => removeRecipient(r)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[#aaa] hover:bg-[#e8e6e0] hover:text-[#666] transition-colors text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {recipients.length < 3 && (
            <div className="flex gap-2">
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                placeholder="you@example.com"
                className="flex-1 border border-[#e8e6e0] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#FF6600] transition-colors"
              />
              <button
                onClick={addRecipient}
                disabled={addingRecipient || !newRecipient.includes("@")}
                className="bg-[#1a1a1a] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-40"
              >
                {addingRecipient ? "Adding…" : "Add"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e8e6e0] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-1">API Keys</h2>
          <p className="text-xs text-[#aaa] mb-4">Your keys are encrypted at rest and never exposed.</p>

          <KeyField
            label="Resend API Key"
            hint="Used to send your newsletter emails"
            placeholder="re_…"
            onSave={(v) => patch({ resendApiKey: v }).then(() => {})}
          />

          <div className="py-4 border-b border-[#f0efe9]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-[#1a1a1a]">AI Model Key</p>
                <p className="text-xs text-[#aaa] mt-0.5">Powers the newsletter editor chat</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value as "openai" | "anthropic" | "gemini")}
                  className="border border-[#e8e6e0] rounded-lg px-2 pr-7 py-1.5 text-xs focus:outline-none focus:border-[#FF6600] text-[#666]"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
            </div>
            <KeyField
              label={`${llmProvider.charAt(0).toUpperCase() + llmProvider.slice(1)} Key`}
              hint={
                llmProvider === "openai" ? "sk-proj-…" :
                llmProvider === "anthropic" ? "sk-ant-…" : "AIza…"
              }
              placeholder={
                llmProvider === "openai" ? "sk-proj-…" :
                llmProvider === "anthropic" ? "sk-ant-…" : "AIza…"
              }
              onSave={(v) => patch({ llmProvider, llmApiKey: v }).then(() => {})}
            />
          </div>
        </div>

        <div className="bg-white border border-red-100 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-xs text-[#aaa] mb-4">
            Deleting your newsletter removes all saved data including your encrypted API key. This cannot be undone.
          </p>
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#666]">Are you sure?</p>
              <button
                onClick={deleteSchedule}
                disabled={deleting}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-[#aaa] hover:text-[#666]"
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
    <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto border-b border-[#e8e6e0]">
      <Link href="/" className="text-sm font-medium text-[#1a1a1a]">
        HN Digest
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#888]">{email}</span>
        <Link
          href="/editor"
          className="text-sm bg-[#1a1a1a] text-white px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
        >
          Open Editor
        </Link>
      </div>
    </nav>
  );
}
