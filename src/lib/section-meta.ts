import { SectionType } from "./types";

export const SECTION_META: Record<SectionType, { label: string; icon: string; color: string; bg: string; structural?: boolean }> = {
  "hn-stories":     { label: "Top Stories",   icon: "#",  color: "#FF6600", bg: "#fff5f0" },
  "show-hn":        { label: "Show HN",        icon: "S",  color: "#7C3AED", bg: "#f5f0ff" },
  "hiring":         { label: "Who's Hiring",   icon: "H",  color: "#0284C7", bg: "#f0f7ff" },
  "open-source":    { label: "Open Source",    icon: "★",  color: "#16A34A", bg: "#f0fdf4" },
  "most-commented": { label: "Most Discussed", icon: "D",  color: "#DC2626", bg: "#fff0f0" },
  "trending":       { label: "Trending",       icon: "↑",  color: "#0891B2", bg: "#f0fbff" },
  "ask-hn":         { label: "Ask HN",         icon: "?",  color: "#7C3AED", bg: "#f5f0ff" },
  "topic":          { label: "Topic",          icon: "🔍", color: "#0284C7", bg: "#f0f7ff" },
  "recent-gems":    { label: "Recent Gems",    icon: "💎", color: "#16A34A", bg: "#f0fdf4" },
  "high-signal":    { label: "High Signal",    icon: "📡", color: "#DC2626", bg: "#fff0f0" },
  "divider":        { label: "Divider",         icon: "—",  color: "#9CA3AF", bg: "#f9fafb", structural: true },
  "custom-text":    { label: "Text Block",      icon: "P",  color: "#6B7280", bg: "#f9fafb", structural: true },
  "intro":          { label: "Intro",           icon: "I",  color: "#F59E0B", bg: "#fffbf0", structural: true },
  "footer":         { label: "Footer",          icon: "F",  color: "#6B7280", bg: "#f9fafb", structural: true },
};
