"use client";

import { useAgentContext, useFrontendTool, useAgent, useCopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { NewsletterConfig, NewsletterSection, SectionType } from "../lib/types";
import { ActivateModal } from "./activate-modal";
import Link from "next/link";

const SECTION_PALETTE = [
  { type: "hn-stories",     icon: "🔥", label: "Top Stories",    desc: "Most upvoted right now" },
  { type: "show-hn",        icon: "🚀", label: "Show HN",         desc: "What builders are shipping" },
  { type: "hiring",         icon: "💼", label: "Who's Hiring",    desc: "Latest jobs from HN" },
  { type: "open-source",    icon: "⭐", label: "Open Source",     desc: "Trending GitHub projects" },
  { type: "most-commented", icon: "💬", label: "Most Discussed",  desc: "Highest comment threads" },
  { type: "heading",        icon: "H",  label: "Heading",          desc: "A section title" },
  { type: "custom-text",    icon: "¶",  label: "Text",             desc: "Custom paragraph" },
] as const;

const PROMPT_SUGGESTIONS = [
  "Top 10 stories, dark header, daily at 9am",
  "Show HN + who's hiring, serif font, weekly on Fridays",
  "Most discussed stories with an open-source section, minimal style",
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
    fetch("/api/schedule")
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
    value: JSON.parse(JSON.stringify(config)),
  });

  useAgentContext({
    description: "Instructions for the HN newsletter assistant",
    value: `You are an expert newsletter designer helping build a Hacker News digest.

Tools available:
- add_section(type, text?, content?, level?): add hn-stories | heading | divider | custom-text | intro | footer
- remove_section(id): remove by id
- update_section(id, text?, content?, level?, align?): edit a block
- reorder_sections(ids[]): reorder all blocks
- update_style(primaryColor?, backgroundColor?, textColor?, headerStyle?, fontFamily?): change look
- set_hn_config(category?, count?): topstories | beststories | newstories | askstories | showstories, count 1-20
- update_newsletter_title(title): rename
- set_schedule(frequency?, time?): daily | weekly | monthly, time HH:MM UTC
- add_recipient(email): add a recipient

Current: "${config.title}" · ${config.sections.length} sections · ${config.hnConfig.count} ${config.hnConfig.category} · ${config.schedule.frequency}
Section ids: ${config.sections.map((s) => `${s.id}(${s.type})`).join(", ")}

Be concise and proactive. When user says "dark theme" → update headerStyle to "dark" + set backgroundColor to a dark color. Always confirm what you changed.`,
  });

  useFrontendTool(
    {
      name: "add_section",
      description: "Add a content block. Types: hn-stories, heading, divider, custom-text, intro, footer.",
      parameters: z.object({
        type: z.enum(["hn-stories", "show-hn", "hiring", "open-source", "most-commented", "heading", "divider", "custom-text", "intro", "footer"]),
        text: z.string().optional(),
        content: z.string().optional(),
        level: z.number().min(1).max(3).optional(),
        count: z.number().min(1).max(20).optional().describe("Number of items to show in this section"),
      }),
      handler: async ({ type, text, content, level, count }) => {
        const section: NewsletterSection = {
          id: `${type}-${Date.now()}`,
          type: type as SectionType,
          props: { text, content, level, count },
        };
        setConfig((prev) => ({ ...prev, sections: [...prev.sections, section] }));
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
      description: "Edit an existing section's content.",
      parameters: z.object({
        id: z.string(),
        text: z.string().optional(),
        content: z.string().optional(),
        level: z.number().min(1).max(3).optional(),
        align: z.enum(["left", "center", "right"]).optional(),
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
        count: z.number().min(1).max(20).optional(),
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
      if (data.html) setPreviewHtml(data.html);
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
    <div className="flex flex-col h-screen bg-[#f8f7f4] overflow-hidden">

      <header className="h-[60px] bg-white border-b border-[#e8e6e0] flex items-center justify-between px-5 flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-[15px] font-semibold text-[#1a1a1a] hover:text-[#FF6600] transition-colors">
            HN Digest
          </Link>
          <span className="text-[#e0ddd8]">/</span>
          <span className="text-[15px] text-[#888]">Editor</span>
        </div>

        <div className="flex items-center gap-2.5">
          {previewLoading && (
            <span className="text-sm text-[#bbb]">Rendering…</span>
          )}

          {/* Sections popover */}
          {mounted && <div className="relative">
            <button
              onClick={() => setPaletteOpen((v) => !v)}
              title="Add sections / prompts"
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                paletteOpen
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-[#e8e6e0] text-[#888] hover:border-[#ccc]"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <rect x="0" y="0" width="5.5" height="5.5" rx="1.2"/>
                <rect x="7.5" y="0" width="5.5" height="5.5" rx="1.2"/>
                <rect x="0" y="7.5" width="5.5" height="5.5" rx="1.2"/>
                <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2"/>
              </svg>
            </button>
            {paletteOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#e8e6e0] rounded-xl shadow-lg z-50 p-3 space-y-3">
                <div>
                  <p className="text-xs text-[#aaa] uppercase tracking-wider mb-2">Add section</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SECTION_PALETTE.map(({ type, icon, label, desc }) => (
                      <button
                        key={type}
                        title={desc}
                        onClick={() => { sendToChat(`Add a ${label} section`); setPaletteOpen(false); }}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-[#e8e6e0] text-[#444] hover:border-[#FF6600] hover:text-[#FF6600] transition-colors"
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#f0efe9] pt-3">
                  <p className="text-xs text-[#aaa] uppercase tracking-wider mb-2">Try a prompt</p>
                  <div className="space-y-1.5">
                    {PROMPT_SUGGESTIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => { sendToChat(p); setPaletteOpen(false); }}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg bg-[#f8f7f4] hover:bg-[#f0efe9] text-[#444] transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>}
          {hasSchedule && (
            <>
              {saveStatus === "saved" && <span className="text-sm text-green-600">Saved</span>}
              {saveStatus === "error" && <span className="text-sm text-red-500">Error saving</span>}
              <button
                onClick={saveToSchedule}
                disabled={saving}
                className="text-sm border border-[#e8e6e0] px-4 py-2 rounded-lg text-[#444] hover:bg-[#f8f7f4] transition-colors disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <Link
                href="/dashboard"
                className="text-sm border border-[#e8e6e0] px-4 py-2 rounded-lg text-[#444] hover:bg-[#f8f7f4] transition-colors"
              >
                Dashboard
              </Link>
            </>
          )}
          <button
            onClick={() => setPreviewOpen((v) => !v)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all ${
              previewOpen
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-[#e8e6e0] text-[#444] hover:border-[#ccc]"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="0" y="1" width="7" height="10" rx="1" opacity="0.4"/>
              <rect x="8" y="1" width="4" height="10" rx="1"/>
            </svg>
            Preview
          </button>
          {!hasSchedule && (
            <button
              onClick={() => setShowActivate(true)}
              className="text-sm bg-[#FF6600] text-white px-4 py-2 rounded-lg hover:bg-[#e55b00] transition-colors font-medium"
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
          className={`flex-shrink-0 border-l border-[#e8e6e0] bg-[#f0efe9] flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
            previewOpen ? "w-[560px]" : "w-0"
          }`}
        >
          <div className="h-12 bg-white border-b border-[#e8e6e0] flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-xs font-medium text-[#666] uppercase tracking-wider">
              Email Preview
            </span>
            <button
              onClick={() => setPreviewOpen(false)}
              className="text-[#aaa] hover:text-[#666] transition-colors p-1 rounded"
              aria-label="Close preview"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/>
                <line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            {previewHtml ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#e8e6e0] overflow-hidden">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full"
                  style={{ height: "900px", border: "none", display: "block" }}
                  title="Newsletter Preview"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#aaa]">Loading preview…</p>
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
