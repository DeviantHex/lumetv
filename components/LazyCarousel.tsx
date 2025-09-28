"use client";

import React, { useEffect, useRef, useState } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import { checkMultipleOnVixsrc } from "@/lib/vixsrc";
import { getMoviesByGenre, getTVShows } from "@/lib/tmdb";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

interface LazyCarouselProps {
  title: string;
  genreId?: number;
  type?: "movie" | "tv";
  initialPages?: number;
  minDelay?: number;
}

export default function LazyCarousel({
  title,
  genreId,
  type = "movie",
  initialPages = 5,
  minDelay = 3000,
}: LazyCarouselProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 👀 Watch when carousel enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 🎬 Fetch when visible
  useEffect(() => {
    if (!visible) return;

  async function load() {
    setLoading(true);
    const start = Date.now();

    try {
      const MIN_ITEMS = 10;
      const MAX_PAGES = 9; // don't fetch endlessly
      let results: any[] = [];
      let filtered: any[] = [];
      let page = 1;

      while (filtered.length < MIN_ITEMS && page <= MAX_PAGES) {
        let data;
        if (type === "movie" && genreId) data = await getMoviesByGenre(genreId, title, page);
        else if (type === "tv") data = await getTVShows();

        if (!data?.results?.length) break;

        results.push(...data.results);

        // batch availability check in chunks of 100
        const ids = data.results.map((r: any) => r.id);
        const okIds = await checkMultipleOnVixsrc(type!, ids);

        filtered.push(...data.results.filter((item: any) => okIds.includes(item.id)));
        page++;
      }

      setItems(filtered.slice(0, MIN_ITEMS));
    } finally {
      const elapsed = Date.now() - start;
      const wait = Math.max(minDelay - elapsed, 0);
      setTimeout(() => {
        setLoading(false);
      }, wait);
    }
  }

    load();
  }, [visible, genreId, type, initialPages, title, minDelay]);

  return (
    <div ref={containerRef} className="my-6">
      {loading || !visible ? (
        <div className="skeleton-carousel">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <HorizontalCarousel items={items} title={title} />
      )}
    </div>
  );
}
