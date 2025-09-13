// app/page.tsx
import React from "react";
import { getTrending, getMoviesByGenre, getTVShows, GENRES, getImageUrl } from "@/lib/tmdb";
import HorizontalCarousel from "@/components/HorizontalCarousel";
import HeroSection from "@/components/HeroSection";

export default async function Home() {
  // Fetch all data in parallel
  const [trending, actionMoviesData, horrorMoviesData, crimeMoviesData, tvShows] = 
    await Promise.all([
      getTrending().catch(() => []),
      getMoviesByGenre(GENRES.ACTION, "Action").catch(() => ({ results: [] })),
      getMoviesByGenre(GENRES.HORROR, "Horror").catch(() => ({ results: [] })),
      getMoviesByGenre(GENRES.CRIME, "Crime").catch(() => ({ results: [] })),
      getTVShows().catch(() => [])
    ]);

  // Extract just the results from the paginated responses
  const actionMovies = actionMoviesData.results || [];
  const horrorMovies = horrorMoviesData.results || [];
  const crimeMovies = crimeMoviesData.results || [];

  // Select a random trending item for the hero section
  const randomTrending = trending.length > 0 
    ? trending[Math.floor(Math.random() * trending.length)]
    : null;

  return (
    <div className="main-content-wrapper">
      {/* Hero Section with random trending item */}
      {randomTrending && <HeroSection item={randomTrending} />}
      
      <HorizontalCarousel items={trending} title="Trending Now" />
      <HorizontalCarousel items={actionMovies} title="Action Movies" />
      <HorizontalCarousel items={horrorMovies} title="Horror Movies" />
      <HorizontalCarousel items={crimeMovies} title="Crime Thrillers" />
      <HorizontalCarousel items={tvShows} title="Popular TV Series" />
    </div>
  );
}