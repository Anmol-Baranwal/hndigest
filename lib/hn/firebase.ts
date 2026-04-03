import { HNStory } from "../types";

const HN_BASE = "https://hacker-news.firebaseio.com/v0";

export async function fetchItemIds(category: string): Promise<number[]> {
  const res = await fetch(`${HN_BASE}/${category}.json`, {
    next: { revalidate: 600 },
  });
  return res.json();
}

export async function fetchItem(id: number): Promise<HNStory | null> {
  try {
    const res = await fetch(`${HN_BASE}/item/${id}.json`);
    const item = await res.json();
    return item?.title ? item : null;
  } catch {
    return null;
  }
}

export async function fetchItemsBatch(ids: number[], count: number): Promise<HNStory[]> {
  const results = await Promise.allSettled(
    ids.slice(0, count * 2).map(fetchItem)
  );
  return results
    .filter((r): r is PromiseFulfilledResult<HNStory> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
    .slice(0, count);
}

export async function fetchStories(category: string, count: number): Promise<HNStory[]> {
  const ids = await fetchItemIds(category);
  return fetchItemsBatch(ids, count);
}
