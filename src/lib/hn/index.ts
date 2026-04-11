import { HNConfig, HiringEntry, NewsletterConfig, NewsletterData } from "../types";
import { fetchItemIds, fetchItemsBatch, fetchStories } from "./firebase";
import {
  fetchTopicStories,
  fetchAskHN,
  fetchRecentGems,
  fetchHighSignal,
  findHiringThreadId,
} from "./algolia";

export { fetchStories, fetchTopicStories, fetchAskHN, fetchRecentGems, fetchHighSignal };

export async function fetchStoriesByConfig(config: HNConfig) {
  return fetchStories(config.category, config.count);
}

export async function fetchShowHNStories(count = 11) {
  return fetchStories("showstories", count);
}

export async function fetchMostCommented(count = 5) {
  const ids = await fetchItemIds("topstories");
  const stories = await fetchItemsBatch(ids, 50);
  return stories
    .filter((s) => s.descendants > 0)
    .sort((a, b) => (b.descendants ?? 0) - (a.descendants ?? 0))
    .slice(0, count);
}

export async function fetchOpenSourceProjects(count = 5) {
  const stories = await fetchStories("showstories", 60);
  return stories.filter((s) => s.url?.includes("github.com")).slice(0, count);
}

export async function fetchTrending(count = 5) {
  const ids = await fetchItemIds("topstories");
  const stories = await fetchItemsBatch(ids, 80);
  return stories
    .map((s) => ({ ...s, _score: s.score + (s.descendants ?? 0) * 2 }))
    .sort((a, b) => (b as any)._score - (a as any)._score)
    .slice(0, count);
}

export async function fetchHiringCompanies(count = 4): Promise<HiringEntry[]> {
  const HN_BASE = "https://hacker-news.firebaseio.com/v0";
  const threadId = await findHiringThreadId();
  if (!threadId) return [];

  const threadRes = await fetch(`${HN_BASE}/item/${threadId}.json`);
  const thread = await threadRes.json();
  const commentIds: number[] = (thread?.kids ?? []).slice(0, count * 3);

  const comments = await Promise.allSettled(
    commentIds.map(async (id) => {
      const res = await fetch(`${HN_BASE}/item/${id}.json`);
      return res.json();
    })
  );

  const entries: HiringEntry[] = [];
  for (const result of comments) {
    if (result.status !== "fulfilled") continue;
    const comment = result.value;
    if (!comment?.text || comment.deleted || comment.dead) continue;

    const plainText = comment.text
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/")
      .replace(/&#x60;/g, "`").replace(/&#x3D;/g, "=").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ").trim();

    const firstLine = plainText.split("\n")[0].slice(0, 200);
    const parts = firstLine.split(/\s*\|\s*/);
    const company = parts[0]?.trim().slice(0, 60) || "Company";
    const role = parts[1]?.trim().slice(0, 60);
    const location = parts[2]?.trim().slice(0, 60);
    const remote = /remote/i.test(firstLine);
    const excerpt = plainText.slice(0, 180).trim();

    entries.push({
      id: comment.id,
      company,
      role,
      location,
      remote,
      excerpt,
      commentUrl: `https://news.ycombinator.com/item?id=${comment.id}`,
    });

    if (entries.length >= count) break;
  }

  return entries;
}

export async function fetchNewsletterData(config: NewsletterConfig): Promise<NewsletterData> {
  const data: NewsletterData = {};
  const fetches: Promise<void>[] = [];

  for (const section of config.sections) {
    const count = section.props.count && section.props.count > 0 ? section.props.count : undefined;

    switch (section.type) {
      case "hn-stories":
        if (!data.topStories)
          fetches.push(fetchStoriesByConfig(config.hnConfig).then((s) => { data.topStories = s; }));
        break;
      case "show-hn":
        if (!data.showHNStories)
          fetches.push(fetchShowHNStories(count ?? 5).then((s) => { data.showHNStories = s; }));
        break;
      case "hiring":
        if (!data.hiringEntries)
          fetches.push(fetchHiringCompanies(count ?? 4).then((s) => { data.hiringEntries = s; }));
        break;
      case "open-source":
        if (!data.openSourceProjects)
          fetches.push(fetchOpenSourceProjects(count ?? 5).then((s) => { data.openSourceProjects = s; }));
        break;
      case "most-commented":
        if (!data.mostCommentedStories)
          fetches.push(fetchMostCommented(count ?? 5).then((s) => { data.mostCommentedStories = s; }));
        break;
      case "trending":
        if (!data.trendingStories)
          fetches.push(fetchTrending(count ?? 5).then((s) => { data.trendingStories = s; }));
        break;
      case "ask-hn":
        if (!data.askHNStories)
          fetches.push(fetchAskHN(count ?? 5).then((s) => { data.askHNStories = s; }));
        break;

      // Dynamic sections — fetched per section ID since each may have different params
      case "topic":
        fetches.push(
          fetchTopicStories(section.props.query ?? "technology", count ?? 5, section.props.hours ?? 24)
            .then((s) => { data.sectionData = { ...data.sectionData, [section.id]: s }; })
        );
        break;
      case "recent-gems":
        fetches.push(
          fetchRecentGems(count ?? 5, section.props.hours ?? 24, section.props.minPoints ?? 50)
            .then((s) => { data.sectionData = { ...data.sectionData, [section.id]: s }; })
        );
        break;
      case "high-signal":
        fetches.push(
          fetchHighSignal(count ?? 5, section.props.minPoints ?? 200)
            .then((s) => { data.sectionData = { ...data.sectionData, [section.id]: s }; })
        );
        break;
    }
  }

  await Promise.all(fetches);
  return data;
}

export function formatTimeAgo(unixTimestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - unixTimestamp);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
