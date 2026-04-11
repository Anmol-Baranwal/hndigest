"use client";

import { useAgentContext, useFrontendTool, useAgent, useCopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { NewsletterConfig, NewsletterSection, SectionType } from "../lib/types";
import { ActivateModal } from "./activate-modal";
import { Icons } from "./icons";
import Link from "next/link";

const SECTION_PALETTE = [
  { type: "hn-stories",     icon: "🔥", label: "Top Stories",    desc: "Most upvoted right now" },
  { type: "show-hn",        icon: "🚀", label: "Show HN",         desc: "What builders are shipping" },
  { type: "hiring",         icon: "💼", label: "Who's Hiring",    desc: "Latest jobs from HN" },
  { type: "open-source",    icon: "⭐", label: "Open Source",     desc: "Trending GitHub projects" },
  { type: "most-commented", icon: "💬", label: "Most Discussed",  desc: "Highest comment threads" },
  { type: "trending",       icon: "📈", label: "Trending",         desc: "Combined upvotes + discussion score" },
  { type: "ask-hn",        icon: "❓", label: "Ask HN",            desc: "Top community questions" },
  { type: "topic",         icon: "🔍", label: "Topic",             desc: "Stories by keyword (AI, Rust, etc.)" },
  { type: "recent-gems",   icon: "💎", label: "Recent Gems",       desc: "New stories with high points" },
  { type: "high-signal",   icon: "📡", label: "High Signal",       desc: "High points, low comments" },
] as const;

const PROMPT_SUGGESTIONS = [
  "Add AI news from the last 48 hours + high signal stories with 200+ points",
  "Top stories + recent gems from last 24h + who's hiring, daily at 9am",
  "Most discussed + Ask HN + open source projects, weekly on Fridays",
];

const DEFAULT_CONFIG: NewsletterConfig = {
  title: "My HN Digest",
  sections: [
    { id: "intro-1", type: "intro", props: { content: "Your curated Hacker News digest, delivered fresh." } },
    { id: "stories-1", type: "hn-stories", props: {} },
    { id: "divider-1", type: "divider", props: {} },
    { id: "footer-1", type: "footer", props: { content: "You're receiving this because you set up HN Digest." } },
  ],
  styles: {
    primaryColor: "#FF6600",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    headerStyle: "minimal",
    fontFamily: "sans",
  },
  hnConfig: { category: "topstories", count: 5 },
  schedule: { frequency: "daily", time: "08:00", timezone: "UTC", active: false },
  recipients: [],
};

export function NewsletterEditor() {
  const [config, setConfig] = useState<NewsletterConfig>(DEFAULT_CONFIG);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const isInitialPreviewRef = useRef(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [showActivate, setShowActivate] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  useEffect(() => setMounted(true), []);

  const sendToChat = async (text: string) => {
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content: text });
    await copilotkit.runAgent({ agent });
  };
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/schedule", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.schedule) {
          const { id: _id, ownerEmail: _o, createdAt: _c, updatedAt: _u, sendHistory: _h, llmProvider: _l, encryptedLlmKey: _k, ...loadedConfig } = data.schedule;
          setConfig(loadedConfig as NewsletterConfig);
          setHasSchedule(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToSchedule = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      await fetch("/api/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: config.title,
          sections: config.sections,
          styles: config.styles,
          hnConfig: config.hnConfig,
          schedule: config.schedule,
          recipients: config.recipients,
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  useAgentContext({
    description:
      "Current newsletter config. sections = content blocks, styles = appearance, hnConfig = which HN stories, schedule = when to send.",
    value: JSON.stringify(config),
  });

  useAgentContext({
    description: "Instructions for the HN newsletter assistant",
    value: `You are a newsletter designer helping the user build a Hacker News digest. Be conversational and helpful — not robotic.

── WHAT THIS APP DOES ──
Users chat with you to design a Hacker News newsletter. They pick sections (e.g. top stories, AI news, hiring), set a schedule, and you update the newsletter live. When they're happy, they activate it and it lands in their inbox automatically.

── BEHAVIOR TABLE ──
Greeting / "what is this?" / "what can you do?"  → explain the app in 2-3 sentences, ask what they want
"What sections are available?"                    → list all section types with a short description each
"What can I customize in [section]?"             → explain count + any section-specific params
Style change (color, font, header)               → call update_style, confirm in one sentence
Add a section                                    → call add_section ONCE, confirm in one sentence
Remove / delete / get rid of                     → call remove_section, confirm in one sentence
Reorder / move to top                            → call reorder_sections, confirm in one sentence
Schedule change                                  → call set_schedule, confirm in one sentence
Rename                                           → call update_newsletter_title, confirm in one sentence
Multiple changes in one message                  → make all tool calls, confirm all in one sentence

── TOOLS ──
- add_section(type, ...params)
- remove_section(id)
- update_section(id, props)
- reorder_sections(ids[])
- update_style(primaryColor?, backgroundColor?, textColor?, headerStyle?, fontFamily?)
- set_hn_config(category?, count?): topstories | beststories | newstories | askstories | showstories
- update_newsletter_title(title)
- set_schedule(frequency?, time?): daily | weekly | monthly, time HH:MM UTC

── SECTIONS ──
All sections support count (default 5, max 30). Only pass count if user explicitly states a number.

Content sections:
- hn-stories: top HN stories
- show-hn: Show HN projects
- ask-hn: top Ask HN questions
- hiring: Who's Hiring thread
- open-source: GitHub projects from Show HN
- most-commented: stories with most comments
- trending: stories ranked by upvotes + comments×2

Dynamic sections (Algolia):
- topic(query, hours?, count?): keyword search. hours=24|48|168. Infer from natural language — "AI news this week" → query="AI", hours=168
- recent-gems(hours?, minPoints?, count?): recent stories above a points threshold. hours=24|48|168, minPoints default 50
- high-signal(minPoints?, count?): high-upvote stories sorted by score. minPoints default 200

Structural (no data):
- intro(content), footer(content), custom-text(content), divider

── CURRENT STATE ──
Newsletter: "${config.title}" · ${config.sections.length} sections · ${config.schedule.frequency}
Section ids: ${config.sections.map((s) => `${s.id}(${s.type}${s.props.query ? `:${s.props.query}` : ""})`).join(", ")}

── RULES ──
1. NEVER call remove_section unless user says "remove", "delete", or "get rid of".
2. Call add_section EXACTLY ONCE per request.
3. Stop after completing tool calls — no extra calls.
4. "Move to top" → use reorder_sections, place just below any intro section.
5. Be concise. One short sentence to confirm what changed.`,
  });

  useFrontendTool(
    {
      name: "add_section",
      description: "Add a content section. Types: hn-stories, show-hn, hiring, open-source, most-commented, trending, ask-hn, topic (needs query+hours), recent-gems (needs hours+minPoints), high-signal (needs minPoints), divider, custom-text, intro, footer.",
      parameters: z.object({
        type: z.enum(["hn-stories", "show-hn", "hiring", "open-source", "most-commented", "trending", "ask-hn", "topic", "recent-gems", "high-signal", "divider", "custom-text", "intro", "footer"]),
        text: z.string().optional(),
        content: z.string().optional(),
        level: z.number().min(1).max(3).optional(),
        count: z.number().min(1).max(30).optional(),
        query: z.string().optional().describe("For topic sections: the search keyword (e.g. 'AI', 'Rust', 'infrastructure')"),
        hours: z.number().optional().describe("Time window in hours: 24, 48, or 168 (week). For topic and recent-gems sections."),
        minPoints: z.number().optional().describe("Minimum points threshold. For recent-gems and high-signal sections."),
      }),
      handler: async ({ type, text, content, level, count, query, hours, minPoints }) => {
        const section: NewsletterSection = {
          id: `${type}-${Date.now()}`,
          type: type as SectionType,
          props: {
            ...(text !== undefined && { text }),
            ...(content !== undefined && { content }),
            ...(level !== undefined && { level }),
            ...(count !== undefined && count > 0 && { count }),
            ...(query !== undefined && { query }),
            ...(hours !== undefined && { hours }),
            ...(minPoints !== undefined && { minPoints }),
          },
        };
        setConfig((prev) => {
          // Insert before footer/divider-at-end so new sections don't go after the footer
          const sections = [...prev.sections];
          const footerIdx = sections.findLastIndex(s => s.type === "footer");
          if (footerIdx !== -1) sections.splice(footerIdx, 0, section);
          else sections.push(section);
          return { ...prev, sections };
        });
        return `Added ${type} section`;
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "remove_section",
      description: "Remove a section by id.",
      parameters: z.object({ id: z.string() }),
      handler: async ({ id }) => {
        setConfig((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) }));
        return `Removed ${id}`;
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "update_section",
      description: "Edit an existing section's properties.",
      parameters: z.object({
        id: z.string(),
        text: z.string().optional(),
        content: z.string().optional(),
        level: z.number().min(1).max(3).optional(),
        align: z.enum(["left", "center", "right"]).optional(),
        count: z.number().min(1).max(30).optional(),
        query: z.string().optional(),
        hours: z.number().optional(),
        minPoints: z.number().optional(),
      }),
      handler: async ({ id, ...props }) => {
        setConfig((prev) => ({
          ...prev,
          sections: prev.sections.map((s) => (s.id === id ? { ...s, props: { ...s.props, ...props } } : s)),
        }));
        return `Updated ${id}`;
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "reorder_sections",
      description: "Reorder sections by providing new ordered list of ids.",
      parameters: z.object({ ids: z.array(z.string()) }),
      handler: async ({ ids }) => {
        setConfig((prev) => {
          const map = new Map(prev.sections.map((s) => [s.id, s]));
          return { ...prev, sections: ids.flatMap((id) => (map.has(id) ? [map.get(id)!] : [])) };
        });
        return "Reordered";
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "update_style",
      description: "Change newsletter styling: primaryColor, backgroundColor, textColor, headerStyle (minimal|bold|dark), fontFamily (sans|serif|mono).",
      parameters: z.object({
        primaryColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        headerStyle: z.enum(["minimal", "bold", "dark"]).optional(),
        fontFamily: z.enum(["sans", "serif", "mono"]).optional(),
      }),
      handler: async (updates) => {
        setConfig((prev) => ({ ...prev, styles: { ...prev.styles, ...updates } }));
        return "Styles updated";
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "set_hn_config",
      description: "Configure HN stories: category (topstories|beststories|newstories|askstories|showstories), count (1-20).",
      parameters: z.object({
        category: z.enum(["topstories", "beststories", "newstories", "askstories", "showstories"]).optional(),
        count: z.number().min(1).max(30).optional(),
      }),
      handler: async ({ category, count }) => {
        setConfig((prev) => ({
          ...prev,
          hnConfig: { category: category ?? prev.hnConfig.category, count: count ?? prev.hnConfig.count },
        }));
        return "HN config updated";
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "update_newsletter_title",
      description: "Rename the newsletter.",
      parameters: z.object({ title: z.string() }),
      handler: async ({ title }) => {
        setConfig((prev) => ({ ...prev, title }));
        return `Title: "${title}"`;
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "set_schedule",
      description: "Set frequency (daily|weekly|monthly) and send time (HH:MM UTC).",
      parameters: z.object({
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        time: z.string().optional(),
      }),
      handler: async ({ frequency, time }) => {
        setConfig((prev) => ({
          ...prev,
          schedule: { ...prev.schedule, frequency: frequency ?? prev.schedule.frequency, time: time ?? prev.schedule.time },
        }));
        return "Schedule updated";
      },
    },
    [setConfig]
  );

  useFrontendTool(
    {
      name: "add_recipient",
      description: "Add an email recipient.",
      parameters: z.object({ email: z.string().email() }),
      handler: async ({ email }) => {
        setConfig((prev) => ({ ...prev, recipients: [...new Set([...prev.recipients, email])] }));
        return `Added ${email}`;
      },
    },
    [setConfig]
  );

  const refreshPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (data.html) {
        setPreviewHtml(data.html);
        if (!isInitialPreviewRef.current) {
          requestAnimationFrame(() => {
            if (previewPaneRef.current) previewPaneRef.current.scrollTop = previewPaneRef.current.scrollHeight;
          });
        }
        isInitialPreviewRef.current = false;
      }
    } catch {
    } finally {
      setPreviewLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(refreshPreview, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [config, refreshPreview]);


  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">

      <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-5 flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-[15px] font-semibold text-foreground hover:text-accent transition-colors">
            HN Digest
          </Link>
          <span className="text-[#e0ddd8]">/</span>
          <span className="text-[15px] text-subtle">Editor</span>
        </div>

        <div className="flex items-center gap-2.5">
          {previewLoading && (
            <span className="text-sm text-[#bbb]">Rendering…</span>
          )}

          {mounted && <div className="relative">
            <button
              onClick={() => setPaletteOpen((v) => !v)}
              title="Add sections / prompts"
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                paletteOpen
                  ? "border-foreground bg-foreground text-white"
                  : "border-border text-subtle hover:border-[#ccc]"
              }`}
            >
              <Icons.grid />
            </button>
            {paletteOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPaletteOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-xl shadow-lg z-50 p-3 space-y-3">
                <div>
                  <p className="text-xs text-subtle uppercase tracking-wider mb-2">Add section</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SECTION_PALETTE.map(({ type, icon, label, desc }) => (
                      <button
                        key={type}
                        title={desc}
                        onClick={() => { sendToChat(`Add a ${label} section`); setPaletteOpen(false); }}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-[#d4d1ca] text-foreground-dark hover:border-accent hover:text-accent transition-colors"
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-card pt-3">
                  <p className="text-xs text-subtle uppercase tracking-wider mb-2">Try a prompt</p>
                  <div className="space-y-1.5">
                    {PROMPT_SUGGESTIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => { sendToChat(p); setPaletteOpen(false); }}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg bg-surface hover:bg-card text-label transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              </>
            )}
          </div>}
          {hasSchedule && (
            <>
              {saveStatus === "saved" && <span className="text-sm text-green-600">Saved</span>}
              {saveStatus === "error" && <span className="text-sm text-red-500">Error saving</span>}
              <button
                onClick={saveToSchedule}
                disabled={saving}
                className="text-sm border border-border px-4 py-2 rounded-lg text-label hover:bg-surface transition-colors disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <Link
                href="/dashboard"
                className="text-sm border border-border px-4 py-2 rounded-lg text-label hover:bg-surface transition-colors"
              >
                Dashboard
              </Link>
            </>
          )}
          <button
            onClick={() => setPreviewOpen((v) => !v)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all ${
              previewOpen
                ? "border-foreground bg-foreground text-white"
                : "border-border text-label hover:border-[#ccc]"
            }`}
          >
            <Icons.sidebar />
            Preview
          </button>
          {!hasSchedule && (
            <button
              onClick={() => setShowActivate(true)}
              className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors font-medium"
            >
              Activate →
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <CopilotChat
            labels={{
              modalHeaderTitle: "Create your HN Newsletter",
              welcomeMessageText: "Describe your newsletter and I will build it.",
              chatInputPlaceholder: "Add sections, change colors, set a schedule…",
            }}
            className="flex-1 min-h-0"
          />
        </div>

        <div
          className={`flex-shrink-0 border-l border-border bg-card flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
            previewOpen ? "w-[560px]" : "w-0"
          }`}
        >
          <div className="h-12 bg-white border-b border-border flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-xs font-medium text-body uppercase tracking-wider">
              Email Preview
            </span>
            <button
              onClick={() => setPreviewOpen(false)}
              className="text-placeholder hover:text-body transition-colors p-1 rounded"
              aria-label="Close preview"
            >
              <Icons.close />
            </button>
          </div>

          <div ref={previewPaneRef} className="flex-1 overflow-y-auto py-6 px-4">
            {previewHtml ? (
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full"
                  style={{ height: "900px", border: "none", display: "block" }}
                  title="Newsletter Preview"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-placeholder">Loading preview…</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showActivate && (
        <ActivateModal config={config} onClose={() => setShowActivate(false)} />
      )}
    </div>
  );
}
