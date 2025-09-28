// app/api/check-availability-batch/route.ts
import { NextResponse } from "next/server";

// In-memory cache
const cache: Record<string, boolean> = {};
const timestamps: Record<string, number> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function fetchWithCache(type: string, id: number) {
  const key = `${type}-${id}`;
  const now = Date.now();

  if (cache[key] !== undefined && (now - (timestamps[key] || 0)) < CACHE_TTL) {
    return { id, ok: cache[key] };
  }

  try {
    let url = `https://vixsrc.to/${type}/${id}`;

    // For TV shows, check first season / first episode
    if (type === "tv") {
      url += `/1/1`;
    }

    const res = await fetch(url, { method: "HEAD", redirect: "manual" });
    const ok = res.status >= 200 && res.status < 400;

    cache[key] = ok;
    timestamps[key] = now;
    return { id, ok };
  } catch (err) {
    console.error(`[ERROR] Failed fetch for ${type} ${id}:`, err);
    cache[key] = false;
    timestamps[key] = now;
    return { id, ok: false };
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, ids } = body;

    if (!type || !Array.isArray(ids)) {
      console.warn("[API] Invalid request body");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const results = await Promise.all(ids.map((id: number) => fetchWithCache(type, id)));

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[API] Batch availability failed:", err);
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 500 });
  }
}
