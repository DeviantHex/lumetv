// app/movie/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { checkMultipleOnVixsrc } from '@/lib/vixsrc' // your existing helper
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  getFilteredMovies,
  getPopularMovies, 
  getTrendingMovies,
  getImageUrl, 
  SortOption,
  FilterOptions
} from '@/lib/tmdb'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import './MediaPage.css'

const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularity Descending' },
  { value: 'popularity.asc', label: 'Popularity Ascending' },
  { value: 'release_date.desc', label: 'Release Date (Newest)' },
  { value: 'release_date.asc', label: 'Release Date (Oldest)' },
  { value: 'vote_average.desc', label: 'Rating (Highest)' },
  { value: 'vote_average.asc', label: 'Rating (Lowest)' },
  { value: 'original_title.asc', label: 'Title (A-Z)' },
  { value: 'original_title.desc', label: 'Title (Z-A)' },
  { value: 'revenue.desc', label: 'Revenue (Highest)' },
  { value: 'revenue.asc', label: 'Revenue (Lowest)' },
]

const LIST_TYPES = [
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'discover', label: 'Discover' },
]

// Generate years from 1900 to current year + 1
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1900 }, (_, i) => CURRENT_YEAR - i);

// Rating options from 0 to 10
const RATINGS = Array.from({ length: 11 }, (_, i) => i);

export default function MoviePage() {
  const searchParams = useSearchParams()
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('popularity.desc')
  const [selectedListType, setSelectedListType] = useState<string>('discover')
  const [minRating, setMinRating] = useState<number | ''>('')
  const [maxRating, setMaxRating] = useState<number | ''>('')
  const [minYear, setMinYear] = useState<number | ''>('')
  const [maxYear, setMaxYear] = useState<number | ''>('')
  const [genreName, setGenreName] = useState<string>('')
  const [movies, setMovies] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // ← Add this

useEffect(() => {
  const genreParam = searchParams.get('genre')
  const nameParam = searchParams.get('name')
  
  if (genreParam && nameParam) {
    const genreId = parseInt(genreParam)
    setSelectedGenre(genreId)
    setGenreName(`${nameParam} Movies`)
  } else {
    setSelectedGenre(null)
    setGenreName('All Movies')
  }

  setIsInitialLoad(false) // finish initial setup
}, [searchParams])

// Run only once after initial setup completes
useEffect(() => {
  if (!isInitialLoad) {
    fetchMovies(1, true)
  }
}, [isInitialLoad])

// Run when filters change (but skip very first render)
useEffect(() => {
  if (isInitialLoad) return

  setCurrentPage(1)
  setMovies([])
  fetchMovies(1, true)
}, [
  selectedSort, 
  selectedListType, 
  minRating, 
  maxRating, 
  minYear, 
  maxYear,
  selectedGenre
])

const buildFilters = (): FilterOptions => {
  const filters: FilterOptions = {
    sortBy: selectedSort,
  };
  
  // Add genre filter if specified
  if (selectedGenre !== null) {
    filters.genreId = selectedGenre;
  }
  
  // Add rating filters
  if (minRating !== '') filters.minRating = Number(minRating);
  if (maxRating !== '') filters.maxRating = Number(maxRating);
  
  // Add year filters
  if (minYear !== '') filters.minYear = Number(minYear);
  if (maxYear !== '') filters.maxYear = Number(maxYear);
  
  return filters;
}

const fetchMovies = async (page: number, reset: boolean = false) => {
  if (reset) setLoading(true);
  else setLoadingMore(true);

  try {
    let data = selectedListType === "trending"
      ? selectedGenre ? await getFilteredMovies(buildFilters(), page) : await getTrendingMovies(page)
      : selectedListType === "popular"
      ? selectedGenre ? await getFilteredMovies(buildFilters(), page) : await getPopularMovies(page)
      : await getFilteredMovies(buildFilters(), page);

    let results = data.results || [];

    if (results.length > 0) {
      const movieIds = results.map(m => m.id);

      // Pass a callback to stream available movies
      await checkMultipleOnVixsrc("movie", movieIds, (availableIds) => {
        const filtered = results.filter(movie => availableIds.includes(movie.id));
        setMovies(prev => [...prev, ...filtered]);
      });
    }

    setTotalPages(data.total_pages > 500 ? 500 : data.total_pages);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !loadingMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchMovies(nextPage)
    }
  }, [currentPage, totalPages, loadingMore, selectedGenre, selectedSort, selectedListType, minRating, maxRating, minYear, maxYear])

  const [isFetching] = useInfiniteScroll(loadMore, currentPage < totalPages && !loadingMore)


  const handleGenreChange = (genreId: number | null, name: string) => {
    setSelectedGenre(genreId)
    setGenreName(genreId ? `${name} Movies` : 'All Movies')
    setCurrentPage(1)
    setMovies([])
  }

  const handleSortChange = (sortOption: SortOption) => {
    setSelectedSort(sortOption)
    setCurrentPage(1)
    setMovies([])
  }

  const handleListTypeChange = (listType: string) => {
    setSelectedListType(listType)
    setCurrentPage(1)
    setMovies([])
  }

  const handleRatingFilterChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    if (type === 'min') {
      setMinRating(numValue);
    } else {
      setMaxRating(numValue);
    }
    setCurrentPage(1);
    setMovies([]);
  }

  const handleYearFilterChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    if (type === 'min') {
      setMinYear(numValue);
    } else {
      setMaxYear(numValue);
    }
    setCurrentPage(1);
    setMovies([]);
  }

  const clearFilters = () => {
    setMinRating('');
    setMaxRating('');
    setMinYear('');
    setMaxYear('');
    setSelectedSort('popularity.desc');
    setSelectedGenre(null);
    setGenreName('All Movies');
    setCurrentPage(1);
    setMovies([]);
  }

  return (
    <div className="media-page">
      <div className="page-header">
        
        <div className="filters">
          <div className="filter-group">
            <label>List Type:</label>
            <select 
              value={selectedListType} 
              onChange={(e) => handleListTypeChange(e.target.value)}
            >
              {LIST_TYPES.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

      <div className="filter-group">
        <label>Filter by Genre:</label>
        <select 
          value={selectedGenre || ''} 
          onChange={(e) => {
            const value = e.target.value
            if (value === '') {
              handleGenreChange(null, '')
            } else {
              const genreId = parseInt(value)
              const genre = MOVIE_GENRES.find(g => g.id === genreId)
              if (genre) handleGenreChange(genreId, genre.name)
            }
          }}
        >
          <option value="">All Genres</option>
          {MOVIE_GENRES.map(genre => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>
      </div>
      
          {selectedListType === 'discover' && (
            <>
              <div className="filter-group">
                <label>Min Rating:</label>
                <select 
                  value={minRating} 
                  onChange={(e) => handleRatingFilterChange('min', e.target.value)}
                >
                  <option value="">Any Rating</option>
                  {RATINGS.map(rating => (
                    <option key={`min-${rating}`} value={rating}>{rating}+</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Max Rating:</label>
                <select 
                  value={maxRating} 
                  onChange={(e) => handleRatingFilterChange('max', e.target.value)}
                >
                  <option value="">Any Rating</option>
                  {RATINGS.map(rating => (
                    <option key={`max-${rating}`} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>From Year:</label>
                <select 
                  value={minYear} 
                  onChange={(e) => handleYearFilterChange('min', e.target.value)}
                >
                  <option value="">Any Year</option>
                  {YEARS.map(year => (
                    <option key={`min-${year}`} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>To Year:</label>
                <select 
                  value={maxYear} 
                  onChange={(e) => handleYearFilterChange('max', e.target.value)}
                >
                  <option value="">Any Year</option>
                  {YEARS.map(year => (
                    <option key={`max-${year}`} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sort By:</label>
                <select 
                  value={selectedSort} 
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>&nbsp;</label>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    {loading ? (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    ) : (
      <>
        <div className="media-grid">
          {movies.map(movie => (
            <Link 
              key={`${movie.id}-${Math.random()}`} 
              href={`/watch/movie/${movie.id}`}
              className="media-card-link"
            >
              <div className="media-card">
                <img 
                  src={getImageUrl(movie.poster_path, "w780")} 
                  alt={movie.title} 
                  onError={(e) => { e.currentTarget.src = '/fallback-poster.jpg'; }}
                />
                <div className="media-info">
                  <h3>{movie.title}</h3>
                  <p>{movie.release_date?.split('-')[0]}</p>
                  <div className="media-rating">
                    <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(loadingMore || isFetching) && (
          <div className="spinner-container small">
            <div className="spinner"></div>
          </div>
        )}

          {currentPage >= totalPages && movies.length > 0 && (
            <div className="end-of-results">No more movies to load</div>
          )}

          {movies.length === 0 && !loading && (
            <div className="no-results">
              <h3>No movies found</h3>
              <p>Try adjusting your filters to find more results.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}