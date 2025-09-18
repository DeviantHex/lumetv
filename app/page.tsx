// app/page.tsx
import React from "react";
import { getTrending, GENRES } from "@/lib/tmdb";
import LazyCarousel from "@/components/LazyCarousel";
import HeroSection from "@/components/HeroSection";
import HorizontalCarousel from "@/components/HorizontalCarousel";

export default async function Home() {
  const trending = await getTrending().catch(() => []);
  const randomTrending =
    trending.length > 0
      ? trending[Math.floor(Math.random() * trending.length)]
      : null;

  return (
    <div className="main-content-wrapper">
      {randomTrending && <HeroSection item={randomTrending} />}

      {/* ✅ Use plain HorizontalCarousel for trending since data is already fetched */}
      <HorizontalCarousel items={trending} title="Trending Now" />

    {/* Movies */}
    <LazyCarousel title="Action Movies" genreId={GENRES.ACTION} />
    <LazyCarousel title="Horror Movies" genreId={GENRES.HORROR} />
    <LazyCarousel title="Crime Thrillers" genreId={GENRES.CRIME} />
    <LazyCarousel title="Comedy Movies" genreId={GENRES.COMEDY} />
    <LazyCarousel title="Romance Movies" genreId={GENRES.ROMANCE} />
    <LazyCarousel title="Sci-Fi Movies" genreId={GENRES.SCIFI} />
    <LazyCarousel title="Fantasy Movies" genreId={GENRES.FANTASY} />
    <LazyCarousel title="Thrillers" genreId={GENRES.THRILLER} />
    <LazyCarousel title="Animated Films" genreId={GENRES.ANIMATION} />
    <LazyCarousel title="Documentaries" genreId={GENRES.DOCUMENTARY} />

    {/* TV */}
    <LazyCarousel title="Popular TV Series" type="tv" />
    </div>
  );
}
