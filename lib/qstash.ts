import { Client } from "@upstash/qstash";

function getClient() {
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error("QSTASH_TOKEN is not set");
  const baseUrl = process.env.QSTASH_URL;
  return new Client({ token, ...(baseUrl ? { baseUrl } : {}) });
}

function toCron(
  frequency: "daily" | "weekly" | "monthly",
  time: string,
  day?: number
): string {
  const [hours, minutes] = time.split(":").map(Number);
  if (frequency === "daily") return `${minutes} ${hours} * * *`;
  if (frequency === "weekly") return `${minutes} ${hours} * * ${day ?? 1}`;
  if (frequency === "monthly") return `${minutes} ${hours} ${day ?? 1} * *`;
  throw new Error(`Unknown frequency: ${frequency}`);
}

export async function scheduleDigest(
  scheduleId: string,
  frequency: "daily" | "weekly" | "monthly",
  time: string,
  day?: number
): Promise<string> {
  const client = getClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://hndigest.vercel.app";
  const cron = toCron(frequency, time, day);

  const result = await client.schedules.create({
    destination: `${baseUrl}/api/send?id=${scheduleId}`,
    cron,
    headers: {
      "x-cron-secret": process.env.CRON_SECRET ?? "dev-secret",
    },
  });

  return result.scheduleId;
}

export async function cancelDigest(qstashScheduleId: string): Promise<void> {
  try {
    const client = getClient();
    await client.schedules.delete(qstashScheduleId);
  } catch {
    // Ignore errors if already deleted
  }
}
