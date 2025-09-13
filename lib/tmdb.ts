// lib/tmdb.ts
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  throw new Error("Missing TMDB API key! Set NEXT_PUBLIC_TMDB_API_KEY in your .env.local");
}

// Fetch trending movies & TV shows
export async function getTrending() {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
  );
  if (!res.ok) throw new Error(`Failed to fetch trending movies`);
  const data = await res.json();
  return data.results || [];
}

// Fetch full movie/TV details by ID
export async function getDetails(type: "movie" | "tv", id: string) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}`);
    if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Failed to fetch details:", err);
    return null;
  }
}

// lib/tmdb.ts - Add these paginated functions
export async function getMoviesByGenre(genreId: number, genreName: string, page: number = 1) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    );
    if (!res.ok) throw new Error(`Failed to fetch ${genreName} movies`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch ${genreName} movies:`, err);
    return { results: [], total_pages: 0 };
  }
}

export async function getTVShowsByGenre(genreId: number, genreName: string, page: number = 1) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    );
    if (!res.ok) throw new Error(`Failed to fetch ${genreName} TV shows`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch ${genreName} TV shows:`, err);
    return { results: [], total_pages: 0 };
  }
}

// Add functions for popular content with pagination
export async function getPopularMovies(page: number = 1) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );
    if (!res.ok) throw new Error("Failed to fetch popular movies");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch popular movies:", err);
    return { results: [], total_pages: 0 };
  }
}

export async function getPopularTVShows(page: number = 1) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );
    if (!res.ok) throw new Error("Failed to fetch popular TV shows");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch popular TV shows:", err);
    return { results: [], total_pages: 0 };
  }
}

// Add this function to fetch TV shows
export async function getTVShows() {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`
    );
    if (!res.ok) throw new Error("Failed to fetch TV shows");
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to fetch TV shows:", err);
    return [];
  }
}

// You might also want to add genre IDs for reference
export const GENRES = {
  ACTION: 28,
  HORROR: 27,
  CRIME: 80,
  // Add more as needed
};

// Search movies, TV shows, or both
export async function searchMulti(query: string) {
  if (!query) return [];
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("TMDB search failed:", err);
    return [];
  }
}

export function getImageUrl(path?: string, size: string = "w500") {
  if (!path) return "/fallback.jpg"; // fallback image if TMDB doesn't return one
  return `https://image.tmdb.org/t/p/${size}${path}`;
}