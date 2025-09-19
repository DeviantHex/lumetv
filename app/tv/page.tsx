// app/tv/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  getFilteredTVShows,
  getPopularTVShows, 
  getTrendingTVShows, // Add this import
  getImageUrl, 
  SortOption,
  FilterOptions
} from '@/lib/tmdb'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import './MediaPage.css'

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularity Descending' },
  { value: 'popularity.asc', label: 'Popularity Ascending' },
  { value: 'first_air_date.desc', label: 'Air Date (Newest)' },
  { value: 'first_air_date.asc', label: 'Air Date (Oldest)' },
  { value: 'vote_average.desc', label: 'Rating (Highest)' },
  { value: 'vote_average.asc', label: 'Rating (Lowest)' },
  { value: 'name.asc', label: 'Name (A-Z)' },
  { value: 'name.desc', label: 'Name (Z-A)' },
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


export default function TVPage() {
  const searchParams = useSearchParams()
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('popularity.desc')
  const [selectedListType, setSelectedListType] = useState<string>('popular')
  const [minRating, setMinRating] = useState<number | ''>('')
  const [maxRating, setMaxRating] = useState<number | ''>('')
  const [minYear, setMinYear] = useState<number | ''>('')
  const [maxYear, setMaxYear] = useState<number | ''>('')
  const [genreName, setGenreName] = useState<string>('')
  const [tvShows, setTVShows] = useState<any[]>([])
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
    setGenreName(`${nameParam} TV Shows`)
  } else {
    setSelectedGenre(null)
    setGenreName('All TV Shows')
  }

  setIsInitialLoad(false) // finish initial setup
}, [searchParams])

// Run only once after initial setup completes
useEffect(() => {
  if (!isInitialLoad) {
    fetchTVShows(1, true)
  }
}, [isInitialLoad])

// Run when filters change (but skip very first render)
useEffect(() => {
  if (isInitialLoad) return

  setCurrentPage(1)
  setTVShows([])
  fetchTVShows(1, true)
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


const fetchTVShows = async (page: number, reset: boolean = false) => {
  if (reset) setLoading(true)
  else setLoadingMore(true)
  
  try {
    let data
    
    if (selectedListType === 'trending') {
      // Apply genre filter even to trending
      if (selectedGenre) {
        const filters = buildFilters();
        data = await getFilteredTVShows(filters, page)
      } else {
        data = await getTrendingTVShows(page)
      }
    } else if (selectedListType === 'popular') {
      // Apply genre filter even to popular
      if (selectedGenre) {
        const filters = buildFilters();
        data = await getFilteredTVShows(filters, page)
      } else {
        data = await getPopularTVShows(page)
      }
    } else {
      const filters = buildFilters();
      data = await getFilteredTVShows(filters, page)
    }
    
    if (reset) {
      setTVShows(data.results || [])
    } else {
      setTVShows(prev => [...prev, ...(data.results || [])])
    }
    
    setTotalPages(data.total_pages > 500 ? 500 : data.total_pages)
  } catch (error) {
    console.error('Failed to fetch TV Shows:', error)
  } finally {
    setLoading(false)
    setLoadingMore(false)
  }
}

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !loadingMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchTVShows(nextPage)
    }
  }, [currentPage, totalPages, loadingMore, selectedGenre, selectedSort, selectedListType, minRating, maxRating, minYear, maxYear])

  const [isFetching] = useInfiniteScroll(loadMore, currentPage < totalPages && !loadingMore)

  const handleGenreChange = (genreId: number | null, name: string) => {
    setSelectedGenre(genreId)
    setGenreName(genreId ? `${name} TV Shows` : 'All TV Shows')
    setCurrentPage(1)
    setTVShows([])
  }

  const handleSortChange = (sortOption: SortOption) => {
    setSelectedSort(sortOption)
    setCurrentPage(1)
    setTVShows([])
  }

  const handleListTypeChange = (listType: string) => {
    setSelectedListType(listType)
    setCurrentPage(1)
    setTVShows([])
  }

  const handleRatingFilterChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    if (type === 'min') {
      setMinRating(numValue);
    } else {
      setMaxRating(numValue);
    }
    setCurrentPage(1);
    setTVShows([]);
  }

  const handleYearFilterChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : Number(value);
    if (type === 'min') {
      setMinYear(numValue);
    } else {
      setMaxYear(numValue);
    }
    setCurrentPage(1);
    setTVShows([]);
  }

  const clearFilters = () => {
    setMinRating('');
    setMaxRating('');
    setMinYear('');
    setMaxYear('');
    setSelectedSort('popularity.desc');
    setSelectedGenre(null);
    setGenreName('All TV Shows');
    setCurrentPage(1);
    setTVShows([]);
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
                  const genre = TV_GENRES.find(g => g.id === genreId)
                  if (genre) handleGenreChange(genreId, genre.name)
                }
              }}
            >
              <option value="">All Genres</option>
              {TV_GENRES.map(genre => (
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
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="media-grid">
            {tvShows.map(show => (
              <Link 
                key={`${show.id}-${Math.random()}`} // Add random to ensure unique keys
                href={`/watch/tv/${show.id}`}
                className="media-card-link"
              >
                <div className="media-card">
                  <img 
                    src={getImageUrl(show.poster_path, "w300")} // Changed back to w300
                    alt={show.name} 
                    onError={(e) => {
                      e.currentTarget.src = '/fallback-poster.jpg';
                    }}
                  />
                  <div className="media-info">
                    <h3>{show.name}</h3>
                    <p>{show.first_air_date?.split('-')[0]}</p>
                    <div className="media-rating">
                      <span>⭐ {show.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {(loadingMore || isFetching) && (
            <div className="loading-more">Loading more TV shows...</div>
          )}

          {currentPage >= totalPages && tvShows.length > 0 && (
            <div className="end-of-results">No more TV shows to load</div>
          )}

          {tvShows.length === 0 && !loading && (
            <div className="no-results">
              <h3>No TV shows found</h3>
              <p>Try adjusting your filters to find more results.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}