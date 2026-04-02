import {
  HNConfig,
  HNStory,
  HiringEntry,
  NewsletterConfig,
  NewsletterData,
} from "./types";

const HN_BASE = "https://hacker-news.firebaseio.com/v0";
const ALGOLIA = "https://hn.algolia.com/api/v1";

async function fetchItemIds(category: string): Promise<number[]> {
  const res = await fetch(`${HN_BASE}/${category}.json`, {
    next: { revalidate: 600 },
  });
  return res.json();
}

async function fetchItem(id: number): Promise<HNStory | null> {
  try {
    const res = await fetch(`${HN_BASE}/item/${id}.json`);
    const item = await res.json();
    return item?.title ? item : null;
  } catch {
    return null;
  }
}

async function fetchItemsBatch(ids: number[], count: number): Promise<HNStory[]> {
  const results = await Promise.allSettled(
    ids.slice(0, count * 2).map(fetchItem)
  );
  return results
    .filter((r): r is PromiseFulfilledResult<HNStory> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
    .slice(0, count);
}

export async function fetchStories(config: HNConfig): Promise<HNStory[]> {
  const ids = await fetchItemIds(config.category);
  return fetchItemsBatch(ids, config.count);
}

export async function fetchShowHNStories(count = 11): Promise<HNStory[]> {
  const ids = await fetchItemIds("showstories");
  return fetchItemsBatch(ids, count);
}

export async function fetchMostCommented(count = 5): Promise<HNStory[]> {
  const ids = await fetchItemIds("topstories");
  // Fetch more to sort by comment count
  const stories = await fetchItemsBatch(ids, 50);
  return stories
    .filter((s) => s.descendants > 0)
    .sort((a, b) => (b.descendants ?? 0) - (a.descendants ?? 0))
    .slice(0, count);
}

export async function fetchOpenSourceProjects(count = 5): Promise<HNStory[]> {
  const ids = await fetchItemIds("showstories");
  const stories = await fetchItemsBatch(ids, 60);
  return stories
    .filter((s) => s.url?.includes("github.com"))
    .slice(0, count);
}

export async function fetchHiringCompanies(count = 4): Promise<HiringEntry[]> {
  const searchRes = await fetch(
    `${ALGOLIA}/search?query=Ask%20HN%3A%20Who%20is%20Hiring%3F&tags=story,author_whoishiring&hitsPerPage=1`,
    { next: { revalidate: 3600 } }
  );
  const searchData = await searchRes.json();
  const threadId = searchData?.hits?.[0]?.objectID;
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

    // Parse "Company | Role | Location" from HTML text
    const plainText = comment.text
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&#x60;/g, "`")
      .replace(/&#x3D;/g, "=")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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
    const count = section.props.count;
    switch (section.type) {
      case "hn-stories":
        if (!data.topStories)
          fetches.push(fetchStories(config.hnConfig).then((s) => { data.topStories = s; }));
        break;
      case "show-hn":
        if (!data.showHNStories)
          fetches.push(fetchShowHNStories(count ?? 11).then((s) => { data.showHNStories = s; }));
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
