// app/movie/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getMoviesByGenre, getPopularMovies, getImageUrl } from '@/lib/tmdb'
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

export default function MoviePage() {
  const searchParams = useSearchParams()
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [genreName, setGenreName] = useState<string>('All Movies')
  const [movies, setMovies] = useState<any[]>([])
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
      setGenreName(`${nameParam} Movies`)
      fetchMovies(genreId, 1)
    } else {
      // Default to all movies (no genre filter)
      setSelectedGenre(null)
      setGenreName('All Movies')
      fetchMovies(null, 1)
    }
  }, [searchParams])

  const fetchMovies = async (genreId: number | null, page: number) => {
    setLoading(true)
    try {
      let data
      if (genreId) {
        data = await getMoviesByGenre(genreId, 'Movies', page)
      } else {
        data = await getPopularMovies(page)
      }
      
      setMovies(data.results || [])
      setTotalPages(data.total_pages > 500 ? 500 : data.total_pages) // TMDB limits to 500 pages
    } catch (error) {
      console.error('Failed to fetch movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreChange = (genreId: number | null, name: string) => {
    setSelectedGenre(genreId)
    setGenreName(genreId ? `${name} Movies` : 'All Movies')
    setCurrentPage(1)
    fetchMovies(genreId, 1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchMovies(selectedGenre, newPage)
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
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="media-grid">
            {movies.map(movie => (
              <Link 
                key={movie.id} 
                href={`/watch/movie/${movie.id}`}
                className="media-card-link"
              >
                <div className="media-card">
                  <img 
                    src={getImageUrl(movie.poster_path, "w300")} 
                    alt={movie.title} 
                  />
                  <div className="media-info">
                    <h3>{movie.title}</h3>
                    <p>{movie.release_date?.split('-')[0]}</p>
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