import { HNStory } from "../types";

const ALGOLIA = "https://hn.algolia.com/api/v1";

interface AlgoliaHit {
  objectID: string;
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  author?: string;
  created_at_i?: number;
  story_text?: string;
}

function hitToStory(hit: AlgoliaHit): HNStory {
  return {
    id: Number(hit.objectID),
    title: hit.title ?? "(no title)",
    url: hit.url,
    score: hit.points ?? 0,
    by: hit.author ?? "",
    descendants: hit.num_comments ?? 0,
    time: hit.created_at_i ?? 0,
  };
}

export async function fetchTopicStories(
  query: string,
  count = 5,
  hours = 24
): Promise<HNStory[]> {
  const since = Math.floor(Date.now() / 1000) - hours * 3600;
  const url = `${ALGOLIA}/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since},points>10&hitsPerPage=${count * 2}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return (data.hits ?? []).slice(0, count).map(hitToStory);
}

export async function fetchAskHN(count = 5): Promise<HNStory[]> {
  const url = `${ALGOLIA}/search?tags=ask_hn&numericFilters=points>10&hitsPerPage=${count}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return (data.hits ?? []).slice(0, count).map(hitToStory);
}

export async function fetchRecentGems(
  count = 5,
  hours = 24,
  minPoints = 50
): Promise<HNStory[]> {
  const since = Math.floor(Date.now() / 1000) - hours * 3600;
  const url = `${ALGOLIA}/search_by_date?tags=story&numericFilters=created_at_i>${since},points>${minPoints}&hitsPerPage=${count}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  const data = await res.json();
  return (data.hits ?? []).slice(0, count).map(hitToStory);
}

export async function fetchHighSignal(
  count = 5,
  minPoints = 200
): Promise<HNStory[]> {
  const url = `${ALGOLIA}/search?tags=story&numericFilters=points>${minPoints}&hitsPerPage=${count * 2}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return (data.hits ?? [])
    .sort((a: AlgoliaHit, b: AlgoliaHit) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, count)
    .map(hitToStory);
}

export async function findHiringThreadId(): Promise<string | null> {
  const url = `${ALGOLIA}/search?query=Ask%20HN%3A%20Who%20is%20Hiring%3F&tags=story,author_whoishiring&hitsPerPage=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return data?.hits?.[0]?.objectID ?? null;
}
