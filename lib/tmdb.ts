// lib/tmdb.ts
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  throw new Error("Missing TMDB API key! Set NEXT_PUBLIC_TMDB_API_KEY in your .env.local");
}

// Type definitions
export type SortOption = 
  | 'popularity.desc' | 'popularity.asc' 
  | 'release_date.desc' | 'release_date.asc' 
  | 'vote_average.desc' | 'vote_average.asc' 
  | 'original_title.asc' | 'original_title.desc' 
  | 'revenue.desc' | 'revenue.asc'
  | 'first_air_date.desc' | 'first_air_date.asc'
  | 'name.asc' | 'name.desc';

export interface FilterOptions {
  genreId?: number | null;
  sortBy?: SortOption; // ← Make this optional
  minRating?: number;
  maxRating?: number;
  minYear?: number;
  maxYear?: number;
}

// Fetch trending movies & TV shows
export async function getTrending() {
  const res = await fetch(
    `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
  );
  if (!res.ok) throw new Error(`Failed to fetch trending movies`);
  const data = await res.json();
  return data.results || [];
}

// Add the missing getTrendingMovies function
export async function getTrendingMovies(page: number = 1) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`
    );
    if (!res.ok) throw new Error("Failed to fetch trending movies");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch trending movies:", err);
    return { results: [], total_pages: 0 };
  }
}

// Add the missing getTrendingTVShows function
export async function getTrendingTVShows(page: number = 1) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`
    );
    if (!res.ok) throw new Error("Failed to fetch trending TV shows");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch trending TV shows:", err);
    return { results: [], total_pages: 0 };
  }
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

// Old-style genre functions (keep for compatibility)
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

// Genre IDs for reference
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
};

export async function getFilteredMovies(filters: FilterOptions, page: number = 1) {
  try {
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}`;
    
    // Add genre filter if specified
    if (filters.genreId) {
      url += `&with_genres=${filters.genreId}`;
    }
    
    // Add rating filters
    if (filters.minRating !== undefined) {
      url += `&vote_average.gte=${filters.minRating}`;
    }
    if (filters.maxRating !== undefined) {
      url += `&vote_average.lte=${filters.maxRating}`;
    }
    
    // Add date filters based on year selection
    if (filters.minYear) {
      url += `&primary_release_date.gte=${filters.minYear}-01-01`;
    }
    if (filters.maxYear) {
      url += `&primary_release_date.lte=${filters.maxYear}-12-31`;
    }
    
    // Add sorting - use default if not specified
    url += `&sort_by=${filters.sortBy || 'popularity.desc'}&page=${page}`;
    
    console.log('Fetching movies with URL:', url);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch filtered movies: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch filtered movies:`, err);
    return { results: [], total_pages: 0 };
  }
}

export async function getFilteredTVShows(filters: FilterOptions, page: number = 1) {
  try {
    let url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}`;
    
    // Add genre filter if specified
    if (filters.genreId) {
      url += `&with_genres=${filters.genreId}`;
    }
    
    // Add rating filters
    if (filters.minRating !== undefined) {
      url += `&vote_average.gte=${filters.minRating}`;
    }
    if (filters.maxRating !== undefined) {
      url += `&vote_average.lte=${filters.maxRating}`;
    }
    
    // Add date filters based on year selection
    if (filters.minYear) {
      url += `&first_air_date.gte=${filters.minYear}-01-01`;
    }
    if (filters.maxYear) {
      url += `&first_air_date.lte=${filters.maxYear}-12-31`;
    }
    
    // Add sorting
    url += `&sort_by=${filters.sortBy}&page=${page}`;
    
    console.log('Fetching TV shows with URL:', url);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch filtered TV shows: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Failed to fetch filtered TV shows:`, err);
    return { results: [], total_pages: 0 };
  }
}

// Search movies, TV shows, or both
export async function searchMulti(query: string, page: number = 1) {
  if (!query) return { results: [], total_pages: 0 };

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
    const data = await res.json();
    return data; // includes results + total_pages + page
  } catch (err) {
    console.error("TMDB search failed:", err);
    return { results: [], total_pages: 0 };
  }
}


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

export async function getTrailer(type: "movie" | "tv", id: number) {
  try {
    const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    
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