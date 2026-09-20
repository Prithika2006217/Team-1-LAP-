// ---------------------------------------------------------------------------
// Redis client (BASE placeholder).
// ---------------------------------------------------------------------------
// This sets up the Upstash Redis connection so the rest of the app can import
// a single shared client. The actual cache helpers (e.g. live-exam auto-save
// buffering to protect Postgres from write-overload) are a LATER phase — this
// file just establishes the connection.
//
// Connection is created lazily and does NOT crash the server if Redis is
// unavailable, so interns can run the API without Redis configured yet.
// ---------------------------------------------------------------------------
import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const configuredUrl = process.env.REDIS_URL?.trim();
  if (!configuredUrl) {
    console.warn("[redis] REDIS_URL not set — cache disabled (fine for local base dev).");
    return null;
  }

  // Upstash often displays a CLI command; ioredis needs only its URL.
  const redisUrl = configuredUrl.replace(
    /^redis-cli\s+--tls\s+-u\s+redis:\/\//i,
    "rediss://"
  );

  redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

  redis.on("error", (err) => console.error("[redis] connection error:", err.message));
  redis.on("connect", () => console.log("[redis] connected"));

  return redis;
}
