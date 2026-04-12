"use client";

import { useAgentContext, useFrontendTool, useAgent, useCopilotKit, CopilotChat, ToolCallStatus } from "@copilotkit/react-core/v2";
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
  { type: "recent-gems",   icon: "💎", label: "Recent Gems",       desc: "New stories with high upvotes" },
  { type: "high-signal",   icon: "📡", label: "High Signal",       desc: "Top stories by score, filterable by min upvotes and timeframe" },
] as const;

function normalizeDividers(sections: import("../lib/types").NewsletterSection[]): import("../lib/types").NewsletterSection[] {
  const STRUCTURAL = new Set(["intro", "footer", "divider"]);
  const result: import("../lib/types").NewsletterSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const prev = result[result.length - 1];
    const next = sections[i + 1];

    if (s.type === "divider") {
      // Drop: consecutive, right after intro, right before footer, at start/end
      if (!prev || prev.type === "intro" || prev.type === "divider") continue;
      if (!next || next.type === "footer") continue;
      result.push(s);
    } else if (!STRUCTURAL.has(s.type)) {
      // Content section: auto-insert divider if prev is content (not intro/divider)
      if (prev && prev.type !== "divider" && prev.type !== "intro") {
        result.push({ id: `divider-auto-${i}`, type: "divider" as const, props: {} });
      }
      result.push(s);
    } else {
      result.push(s);
    }
  }

  return result;
}

const PREVIEW_CACHE_VERSION = "3";

const PROMPT_SUGGESTIONS = [
  "Add AI news from the last 48 hours + high signal stories with 200+ upvotes",
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
  const previewCacheRef = useRef<Map<string, string>>(new Map());
  const prevSectionCountRef = useRef(0);
  const scrollToBottomRef = useRef(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [showActivate, setShowActivate] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  useEffect(() => setMounted(true), []);

  const sendToChat = async (text: string) => {
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content: text });
    await copilotkit.runAgent({ agent });
  };
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const immediateRefreshRef = useRef(false);

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
      .catch(() => {})
      .finally(() => setConfigLoading(false));
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

  const deleteSection = useCallback((id: string) => {
    immediateRefreshRef.current = true;
    setConfig((prev) => {
      const idx = prev.sections.findIndex(s => s.id === id);
      if (idx === -1) return prev;

      let sections = [...prev.sections];
      sections.splice(idx, 1);

      // Loop until stable — removing one divider can expose another orphan
      let prevLen = -1;
      while (sections.length !== prevLen) {
        prevLen = sections.length;
        sections = sections.filter((s, i, arr) => {
          if (s.type !== "divider") return true;
          const before = arr[i - 1];
          const after = arr[i + 1];
          if (!before || before.type === "intro") return false;
          if (!after || after.type === "footer") return false;
          if (before.type === "divider") return false;
          const hasContentAfter = arr.slice(i + 1).some(x => !["divider", "footer", "intro"].includes(x.type));
          if (!hasContentAfter) return false;
          return true;
        });
      }

      if (hasSchedule) {
        fetch("/api/schedule", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        }).catch(() => {});
      }
      return { ...prev, sections };
    });
  }, [hasSchedule]);

  useAgentContext({
    description:
      "Current newsletter config. sections = content blocks, styles = appearance, hnConfig = which HN stories, schedule = when to send.",
    value: JSON.stringify(config),
  });

  useAgentContext({
    description: "Instructions for the HN newsletter assistant",
    value: `You are a friendly assistant that helps users build a Hacker News email digest. Be conversational, helpful, and human. You always respond, no matter what the user says.

── WHAT THIS APP DOES ──
HN Digest lets users build a personalized Hacker News newsletter delivered to their inbox. They chat with you to design it: pick sections (top stories, AI news, hiring, etc.), set filters like count, time window, and upvote threshold, choose a schedule, and customize the style. When ready, they activate with a magic link.

── HOW TO RESPOND ──
Greeting / casual message                        → respond naturally, briefly explain what you can help with
"what is this?" / "what is this project?"        → explain HN Digest in 2-3 sentences, ask what they'd like to build
"what can you do?" / "help"                      → list what you can help with (sections, filters, schedule, style)
"what sections are available?" / "what can I add?" → call show_available_sections (renders a visual card grid)
"what can I customize in [section]?"             → explain count + that section's specific params
Style change (color, font, header)               → call update_style, confirm in one sentence
Add a section                                    → CHECK EXISTING SECTIONS FIRST (see rules), then call add_section once
Remove / delete / get rid of                     → call remove_section with the correct id from Section ids list
Reorder / move to top                            → call reorder_sections
Schedule change                                  → call set_schedule
Rename                                           → call update_newsletter_title
Change count / hours / upvotes on existing       → call update_section with the correct id, NOT add_section
Multiple changes in one message                  → make all tool calls, confirm all in one sentence
Off-topic / confusing / anything else            → respond helpfully and naturally

── CURRENT SECTIONS (always check before adding) ──
Newsletter: "${config.title}" · ${config.schedule.frequency}
${config.sections.map((s, i) => `  ${i + 1}. id="${s.id}" type=${s.type}${s.props.query ? ` query="${s.props.query}"` : ""}${s.props.count ? ` count=${s.props.count}` : ""}${s.props.hours ? ` hours=${s.props.hours}` : ""}${s.props.minPoints ? ` minPoints=${s.props.minPoints}` : ""}`).join("\n")}

── DUPLICATE RULES (critical — read before every add_section call) ──
SINGLETON types (only ONE allowed): hn-stories, show-hn, ask-hn, hiring, open-source, most-commented, trending, intro, footer.
- If user asks to add a singleton type that ALREADY EXISTS in the list above → call update_section on the existing one instead, or tell the user it's already there.
- If user wants to change count/hours/upvotes on an existing section → ALWAYS call update_section, never add a new one.

MULTI-INSTANCE types (multiple allowed with different params): topic, recent-gems, high-signal, divider.
- topic: OK to add multiple if query is different. If same query exists → update_section instead.
- recent-gems / high-signal: OK to add multiple only if params meaningfully differ. Otherwise update existing.

── SECTION REFERENCE ──
Standard sections — ONLY support count. NO hours, NO minPoints, NO query. Ever.
  hn-stories     → display name "Top Stories"
  show-hn        → display name "Show HN"
  ask-hn         → display name "Ask HN"
  hiring         → display name "Who's Hiring"
  open-source    → display name "Open Source"
  most-commented → display name "Most Discussed" (NEVER say "Most Commented" — always say "Most Discussed")
  trending       → display name "Trending"

Filtered sections — support hours, minPoints, query in addition to count:
  topic(query, hours, count)            → DEFAULT hours=48. REQUIRED query.
  recent-gems(hours, minPoints, count)  → DEFAULT hours=48, minPoints=50.
  high-signal(minPoints, hours, count)  → DEFAULT minPoints=200, hours=720.

hours values: 24=1day, 48=2days, 72=3days, 96=4days, 120=5days, 144=6days, 168=1week, 336=2weeks, 480=20days, 720=30days.

Structural (no data, no filters):
  intro(content), footer(content), divider

── ONE-SHOT EXAMPLES ──
User: "filter show HN to last 48 hours"
→ WRONG: do NOT call update_section with hours on show-hn
→ RIGHT: "Show HN doesn't support timeframe filtering — it always pulls the latest Show HN posts. Want a Topic section with query='Show HN' and hours=48 instead?"

User: "add 10 upvote minimum to ask HN"
→ WRONG: do NOT add minPoints to ask-hn
→ RIGHT: "Ask HN only supports count. For upvote filtering try Recent Gems with minPoints=10."

User: "filter top stories to this week"
→ WRONG: do NOT add hours to hn-stories
→ RIGHT: "Top Stories doesn't support timeframe filtering. Want a High Signal section (200+ upvotes, last 30 days) instead?"

User: "add AI news"
→ add_section(type="topic", query="AI", hours=48) → "Added AI topic section for the last 48 hours."

User: "add topic"
→ Ask: "What topic should I search for?"

User: "add recent gems"
→ add_section(type="recent-gems", hours=48, minPoints=50) → "Added Recent Gems — posts from last 48h with 50+ upvotes."

User: "add high signal"
→ add_section(type="high-signal", minPoints=200, hours=720) → "Added High Signal — top posts with 200+ upvotes from the last 30 days."

User: "okay infrastructure" (after recommending topics)
→ add_section(type="topic", query="infrastructure", hours=48) → "Added Infrastructure for the last 48 hours. It's saved — if no posts show up in the preview right now, they'll appear automatically when matching HN posts are found."

User: "dark mode" / "make it dark" / "black background"
→ update_style(backgroundColor="#111111", textColor="#ffffff", headerStyle="dark") → "Switched to dark mode — dark background, white text, dark header."

User: "black header" / "dark header"
→ update_style(headerStyle="dark") → "Dark header set. Say 'light header' to revert, or 'dark mode' to make the whole newsletter dark."

User: "light header" / "revert header" / "white header"
→ update_style(headerStyle="minimal") → "Switched back to a light header."

User: "make it light again" / "light mode"
→ update_style(backgroundColor="#ffffff", textColor="#1a1a1a", headerStyle="minimal") → "Switched back to light mode."

User: "make show HN show 10 stories"
→ update_section(id="<show-hn-id>", count=10) → "Show HN will now show 10 stories."

User: "add Most Discussed + Ask HN + Open Source" (Most Discussed already exists)
→ add Ask HN, add Open Source (skip most-commented since it exists)
→ "Most Discussed is already in your newsletter — added Ask HN and Open Source."

User: "add Most Discussed + Ask HN + Open Source" (none exist)
→ add all three
→ "Added Most Discussed, Ask HN, and Open Source."

── RULES ──
1. BEFORE calling add_section: scan the current sections list above. If the type is a singleton and already exists, call update_section or inform the user instead.
2. Standard sections (hn-stories, show-hn, ask-hn, hiring, open-source, most-commented, trending) ONLY accept count. If user asks for hours/minPoints on these, explain it's not supported and suggest an alternative.
3. Call add_section EXACTLY ONCE per new section. Exception: inserting multiple dividers between existing sections.
4. A divider is automatically inserted before every new content section — you do NOT need to add it manually.
5. NEVER call remove_section unless user says "remove", "delete", or "get rid of". Use the exact id from the sections list.
6. For filtered sections (topic, recent-gems, high-signal): always include default props even if user doesn't specify.
7. "Move to top" → reorder_sections, place just after any intro.
8. Stop after completing tool calls. One short sentence to confirm what changed.
9. Never refuse. If unclear, ask one short clarifying question.`,
  });

  useFrontendTool(
    {
      name: "add_section",
      description: "Add a content section. Types: hn-stories, show-hn, hiring, open-source, most-commented, trending, ask-hn, topic (needs query+hours), recent-gems (needs hours+minPoints), high-signal (needs minPoints), divider, intro, footer.",
      parameters: z.object({
        type: z.enum(["hn-stories", "show-hn", "hiring", "open-source", "most-commented", "trending", "ask-hn", "topic", "recent-gems", "high-signal", "divider", "intro", "footer"]),
        text: z.string().optional(),
        content: z.string().optional(),
        level: z.number().min(1).max(3).optional(),
        count: z.number().min(1).max(30).optional(),
        query: z.string().optional().describe("For topic sections: the search keyword (e.g. 'AI', 'Rust', 'infrastructure')"),
        hours: z.number().optional().describe("Time window in hours: 24, 48, or 168 (week). For topic and recent-gems sections."),
        minPoints: z.number().optional().describe("Minimum upvotes threshold. For recent-gems and high-signal sections."),
      }),
      handler: async ({ type, text, content, level, count, query, hours, minPoints }) => {
        const SINGLETON_TYPES = ["hn-stories", "show-hn", "hiring", "open-source", "most-commented", "trending", "ask-hn", "intro", "footer"];
        const STANDARD_TYPES = ["hn-stories", "show-hn", "ask-hn", "hiring", "open-source", "most-commented", "trending"];
        const isStandard = STANDARD_TYPES.includes(type);
        const section: NewsletterSection = {
          id: `${type}-${Date.now()}`,
          type: type as SectionType,
          props: {
            ...(text !== undefined && { text }),
            ...(content !== undefined && { content }),
            ...(level !== undefined && { level }),
            ...(count !== undefined && count > 0 && { count }),
            // Standard sections don't support these — strip them even if AI passes them
            ...(!isStandard && query !== undefined && { query }),
            ...(!isStandard && hours !== undefined && { hours }),
            ...(type === "recent-gems" || type === "high-signal" ? (minPoints !== undefined && { minPoints }) : {}),
          },
        };
        const isContent = !["divider", "intro", "footer"].includes(type);
        let blocked = false;
        setConfig((prev) => {
          if (SINGLETON_TYPES.includes(type) && prev.sections.some(s => s.type === type)) {
            blocked = true;
            return prev;
          }
          const sections = [...prev.sections];
          const footerIdx = sections.findLastIndex(s => s.type === "footer");
          const insertIdx = footerIdx !== -1 ? footerIdx : sections.length;
          if (isContent) {
            const prevSection = sections[insertIdx - 1];
            if (prevSection && prevSection.type !== "divider" && prevSection.type !== "intro") {
              sections.splice(insertIdx, 0, { id: `divider-${Date.now() + 1}`, type: "divider", props: {} }, section);
              return { ...prev, sections };
            }
          }
          sections.splice(insertIdx, 0, section);
          return { ...prev, sections };
        });
        if (blocked) return `Skipped: ${type} section already exists. Use update_section to modify it instead.`;
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
        const STANDARD_TYPES = ["hn-stories", "show-hn", "ask-hn", "hiring", "open-source", "most-commented", "trending"];
        setConfig((prev) => ({
          ...prev,
          sections: prev.sections.map((s) => {
            if (s.id !== id) return s;
            const sanitized = { ...props };
            // Standard sections only support count — strip hours, minPoints, query
            if (STANDARD_TYPES.includes(s.type)) {
              delete sanitized.hours;
              delete sanitized.minPoints;
              delete sanitized.query;
            }
            // topic doesn't support minPoints; recent-gems/high-signal don't support query
            if (s.type === "topic") delete sanitized.minPoints;
            if (s.type === "recent-gems" || s.type === "high-signal") delete sanitized.query;
            return { ...s, props: { ...s.props, ...sanitized } };
          }),
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

  useFrontendTool(
    {
      name: "show_available_sections",
      description: "Show a visual overview of all available section types. Call this when the user asks what sections are available, what they can add, or wants to browse section options.",
      parameters: z.object({}),
      followUp: false,
      handler: async () => "Showing available sections.",
      render: ({ status }) => {
        if (status === ToolCallStatus.Executing) {
          return (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          );
        }
        return (
          <div className="mt-3 space-y-3">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">10 section types</p>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_PALETTE.map(({ type, icon, label, desc }) => (
                <div
                  key={type}
                  className="flex flex-col gap-1 px-3.5 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-[13px] font-semibold text-gray-900">{label}</span>
                  </span>
                  <p className="text-[11.5px] text-gray-500 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    []
  );

  const refreshPreview = useCallback(async () => {
    const cacheKey = `${PREVIEW_CACHE_VERSION}:${JSON.stringify(config)}`;
    const contentCount = config.sections.filter(s => !["intro","footer","divider"].includes(s.type)).length;
    if (!isInitialPreviewRef.current && contentCount > prevSectionCountRef.current) {
      scrollToBottomRef.current = true;
    }
    prevSectionCountRef.current = contentCount;
    const cached = previewCacheRef.current.get(cacheKey);
    if (cached) {
      setPreviewHtml(cached);
      isInitialPreviewRef.current = false;
      return;
    }
    setPreviewLoading(true);
    const prevScrollTop = previewPaneRef.current?.scrollTop ?? 0;
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (data.html) {
        previewCacheRef.current.set(cacheKey, data.html);
        setPreviewHtml(data.html);
        requestAnimationFrame(() => {
          if (previewPaneRef.current) {
            previewPaneRef.current.scrollTop = isInitialPreviewRef.current ? 0 : prevScrollTop;
          }
        });
        isInitialPreviewRef.current = false;
      }
    } catch {
    } finally {
      setPreviewLoading(false);
    }
  }, [config]);

  useEffect(() => {
    const normalized = normalizeDividers(config.sections);
    const typeSeq = (s: NewsletterSection[]) => s.map(x => x.type).join(",");
    if (typeSeq(normalized) !== typeSeq(config.sections)) {
      setConfig(prev => ({ ...prev, sections: normalized }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sections]);

  useEffect(() => {
    if (configLoading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = immediateRefreshRef.current ? 0 : 500;
    immediateRefreshRef.current = false;
    debounceRef.current = setTimeout(refreshPreview, delay);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [config, refreshPreview, configLoading]);


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
              onClick={() => { setSectionsOpen((v) => !v); setPaletteOpen(false); }}
              title="Manage sections"
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                sectionsOpen
                  ? "border-foreground bg-foreground text-white"
                  : "border-border text-subtle hover:border-[#ccc]"
              }`}
            >
              <Icons.trash />
            </button>
            {sectionsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSectionsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-68 bg-white border border-border rounded-xl shadow-lg z-50 p-3" style={{ width: "272px" }}>
                  <p className="text-xs text-subtle uppercase tracking-wider mb-2">Remove section</p>
                  {(() => {
                    // Only show content sections — dividers are auto-managed
                    const removable = config.sections.filter(s => !["intro", "footer", "divider"].includes(s.type));
                    if (removable.length === 0) return (
                      <p className="text-xs text-placeholder px-2 py-1.5">No sections to remove</p>
                    );
                    return (
                      <div className="space-y-0.5">
                        {removable.map((s) => {
                          const meta = SECTION_PALETTE.find(p => p.type === s.type);
                          const label = meta?.label ?? s.type;
                          const icon = meta?.icon ?? "·";
                          const details = [
                            s.props.query && `"${s.props.query}"`,
                            s.props.hours && `${s.props.hours}h`,
                            s.props.count && `×${s.props.count}`,
                          ].filter(Boolean).join(" · ");
                          return (
                            <div key={s.id} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-surface group cursor-default">
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="text-sm flex-shrink-0">{icon}</span>
                                <span className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium text-label leading-tight">{label}</span>
                                  {details && <span className="text-[10px] text-placeholder leading-tight truncate">{details}</span>}
                                </span>
                              </span>
                              <button
                                onClick={() => { deleteSection(s.id); setSectionsOpen(false); }}
                                className="cursor-pointer flex-shrink-0 ml-2 text-placeholder hover:text-red-500 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                                aria-label={`Remove ${label}`}
                              >
                                <Icons.trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>}
          {mounted && <div className="relative">
            <button
              onClick={() => { setPaletteOpen((v) => !v); setSectionsOpen(false); }}
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
          {!configLoading && !hasSchedule && (
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

          <div ref={previewPaneRef} className="flex-1 overflow-y-auto pt-4">
            {configLoading || !previewHtml ? (
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-pulse">
                {/* Header block */}
                <div className="bg-gray-800 px-8 py-8 space-y-3">
                  <div className="h-2.5 bg-gray-600 rounded w-32" />
                  <div className="h-7 bg-gray-500 rounded w-48 mt-2" />
                  <div className="h-3 bg-gray-600 rounded w-72" />
                </div>
                {/* Section label */}
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-gray-300 rounded-full" />
                    <div className="h-3 bg-gray-300 rounded w-24" />
                  </div>
                </div>
                {/* Story rows */}
                <div className="px-6 pb-4 space-y-5">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex gap-4 pt-3 border-t border-gray-100">
                      <div className="h-5 w-4 bg-gray-300 rounded flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <div className="h-3 bg-gray-200 rounded w-36" />
                </div>
              </div>
            ) : (
              <iframe
                srcDoc={previewHtml}
                className="w-full"
                scrolling="no"
                style={{ height: "600px", border: "none", display: "block", overflow: "hidden" }}
                onLoad={(e) => {
                  const iframe = e.currentTarget;
                  iframe.style.height = "0px";
                  requestAnimationFrame(() => requestAnimationFrame(() => {
                    try {
                      const doc = iframe.contentDocument;
                      const h = Math.max(
                        doc?.documentElement?.scrollHeight ?? 0,
                        doc?.body?.scrollHeight ?? 0,
                      ) + 40; // buffer for bottom padding
                      iframe.style.height = `${Math.max(h, 200)}px`;
                    } catch {
                      iframe.style.height = "600px";
                    }
                    if (scrollToBottomRef.current && previewPaneRef.current) {
                      scrollToBottomRef.current = false;
                      previewPaneRef.current.scrollTop = previewPaneRef.current.scrollHeight;
                    }
                  }));
                }}
                title="Newsletter Preview"
              />
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
