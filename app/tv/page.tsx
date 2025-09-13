// app/tv/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTVShowsByGenre, getPopularTVShows, getImageUrl } from '@/lib/tmdb'
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

export default function TVPage() {
  const searchParams = useSearchParams()
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [genreName, setGenreName] = useState<string>('All TV Shows')
  const [tvShows, setTVShows] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reset to page 1 when genre changes
    setCurrentPage(1)
    
    // Get genre from URL params if available
    const genreParam = searchParams.get('genre')
    const nameParam = searchParams.get('name')
    
    if (genreParam && nameParam) {
      const genreId = parseInt(genreParam)
      setSelectedGenre(genreId)
      setGenreName(`${nameParam} TV Shows`)
      fetchTVShows(genreId, 1)
    } else {
      // Default to all TV shows (no genre filter)
      setSelectedGenre(null)
      setGenreName('All TV Shows')
      fetchTVShows(null, 1)
    }
  }, [searchParams])

  const fetchTVShows = async (genreId: number | null, page: number) => {
    setLoading(true)
    try {
      let data
      if (genreId) {
        data = await getTVShowsByGenre(genreId, 'TV Shows', page)
      } else {
        data = await getPopularTVShows(page)
      }
      
      setTVShows(data.results || [])
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages) // TMDB limits to 500 pages
    } catch (error) {
      console.error('Failed to fetch TV shows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreChange = (genreId: number | null, name: string) => {
    setSelectedGenre(genreId)
    setGenreName(genreId ? `${name} TV Shows` : 'All TV Shows')
    setCurrentPage(1)
    fetchTVShows(genreId, 1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchTVShows(selectedGenre, newPage)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="media-page">
      <div className="page-header">
        <h1>{genreName}</h1>
        
        <div className="filters">
          <div className="genre-filter">
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
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="media-grid">
            {tvShows.map(show => (
              <Link 
                key={show.id} 
                href={`/watch/tv/${show.id}`}
                className="media-card-link"
              >
                <div className="media-card">
                  <img 
                    src={getImageUrl(show.poster_path, "w300")} 
                    alt={show.name} 
                  />
                  <div className="media-info">
                    <h3>{show.name}</h3>
                    <p>{show.first_air_date?.split('-')[0]}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}