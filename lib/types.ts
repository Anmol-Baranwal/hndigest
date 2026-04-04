export type SectionType =
  | "hn-stories"      // top/best/new stories
  | "show-hn"         // Show HN stories
  | "hiring"          // Who is Hiring (Ask HN monthly thread)
  | "open-source"     // Open source projects (Show HN with GitHub)
  | "most-commented"  // Most commented stories
  | "trending"        // Combined score: upvotes + comments×2
  | "ask-hn"          // Top Ask HN posts
  | "topic"           // Algolia: query + time window (dynamic)
  | "recent-gems"     // Algolia: recent stories with min points (dynamic)
  | "high-signal"     // Algolia: high points, low comments (dynamic)
  | "heading"
  | "divider"
  | "custom-text"
  | "intro"
  | "footer";

export interface NewsletterSection {
  id: string;
  type: SectionType;
  props: {
    text?: string;
    content?: string;
    level?: number;
    align?: "left" | "center" | "right";
    count?: number;       // number of items to show
    query?: string;       // topic: Algolia search query
    hours?: number;       // topic/recent-gems: time window in hours (24, 48, 168)
    minPoints?: number;   // recent-gems/high-signal: minimum points threshold
  };
}

export interface NewsletterStyles {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  headerStyle: "minimal" | "bold" | "dark";
  fontFamily: "sans" | "serif" | "mono";
}

export interface HNConfig {
  category:
    | "topstories"
    | "beststories"
    | "newstories"
    | "askstories"
    | "showstories";
  count: number;
}

export interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly";
  time: string; // HH:MM UTC
  day?: number; // weekly: 0=Sun…6=Sat, monthly: 1–28
  timezone: string;
  active: boolean;
}

export interface NewsletterConfig {
  title: string;
  sections: NewsletterSection[];
  styles: NewsletterStyles;
  hnConfig: HNConfig;
  schedule: ScheduleConfig;
  recipients: string[];
}

export interface SendRecord {
  sentAt: string;
  recipientCount: number;
  success: boolean;
  error?: string;
}

export interface ScheduleRecord extends NewsletterConfig {
  id: string;
  ownerEmail: string;
  encryptedResendKey: string;
  encryptedLlmKey?: string;
  llmProvider?: "openai" | "anthropic" | "gemini";
  qstashScheduleId?: string;
  sendHistory?: SendRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  descendants: number;
  time: number;
}

export interface HiringEntry {
  id: number;
  company: string;
  role?: string;
  location?: string;
  remote?: boolean;
  excerpt: string;
  commentUrl: string;
}

// All data fetched for a newsletter render
export interface NewsletterData {
  topStories?: HNStory[];
  showHNStories?: HNStory[];
  hiringEntries?: HiringEntry[];
  openSourceProjects?: HNStory[];
  mostCommentedStories?: HNStory[];
  trendingStories?: HNStory[];
  askHNStories?: HNStory[];
  sectionData?: Record<string, HNStory[]>; // dynamic sections keyed by section.id
}
