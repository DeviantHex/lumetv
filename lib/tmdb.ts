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
  COMEDY: 35,
  ROMANCE: 10749,
  SCIFI: 878,
  FANTASY: 14,
  THRILLER: 53,
  ANIMATION: 16,
  DOCUMENTARY: 99,
  // add as many as you want from TMDB's genre list
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

// lib/tmdb.ts

export async function getRuntimeAndGenres(type: "movie" | "tv", id: number) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!res.ok) throw new Error(`Failed to fetch runtime for ${type}/${id}`);
    const data = await res.json();

    if (type === "movie") {
      return {
        runtime: data.runtime || null,
        genres: data.genres?.map((g: any) => g.name) || [],
        releaseDate: data.release_date || null,
        rating: data.vote_average || null,
      };
    } else {
      const runtime = Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0
        ? data.episode_run_time[0]
        : null;

      return {
        runtime,
        genres: data.genres?.map((g: any) => g.name) || [],
        releaseDate: data.first_air_date || null,
        rating: data.vote_average || null,
      };
    }
  } catch (err) {
    console.error("Failed to fetch runtime/genres:", err);
    return { runtime: null, genres: [], releaseDate: null, rating: null };
  }
}

// lib/tmdb.ts - Updated getTrailer function
export async function getTrailer(type: "movie" | "tv", id: number) {
  try {
    const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    
    // Check if API key is available
    if (!TMDB_API_KEY) {
      console.error("TMDB API key is missing");
      return null;
    }
    
    const res = await fetch(
      `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`
    );
    
    if (!res.ok) {
      console.error(`TMDB API error: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch trailer for ${type}/${id}`);
    }
    
    const data = await res.json();
    
    // Find the first trailer (usually the official one)
    const trailer = data.results.find(
      (video: any) => video.type === "Trailer" && video.site === "YouTube"
    );
    
    return trailer ? trailer.key : null;
  } catch (err) {
    console.error("Failed to fetch trailer:", err);
    return null;
  }
}

export function getImageUrl(path?: string, size: string = "w780") {
  if (!path) return "/fallback.jpg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Fetch multiple pages and merge results
export async function getMultiplePages<T>(
  fetchFn: (page: number) => Promise<{ results: T[] }>,
  pages: number = 2
) {
  const results: T[] = [];
  for (let i = 1; i <= pages; i++) {
    const data = await fetchFn(i);
    results.push(...(data.results || []));
  }
  return results;
}
