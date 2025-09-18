"use client";

import React, { useEffect, useRef, useState } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
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
  initialPages = 2,
  minDelay = 500,
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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 🎬 Fetch when visible
  useEffect(() => {
    if (!visible) return;

    async function load() {
      setLoading(true);
      lockScroll(); // 🚫 lock here
      const start = Date.now();

      try {
        let results: any[] = [];
        for (let page = 1; page <= initialPages; page++) {
          let data;
          if (type === "movie" && genreId) {
            data = await getMoviesByGenre(genreId, title, page);
          } else if (type === "tv") {
            data = await getTVShows(page);
          }
          if (data?.results) results = [...results, ...data.results];
        }
        setItems(results);
      } finally {
        const elapsed = Date.now() - start;
        const wait = Math.max(minDelay - elapsed, 0);
        setTimeout(() => {
          setLoading(false);
          unlockScroll(); // ✅ unlock after load
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
