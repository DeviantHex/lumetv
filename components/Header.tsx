'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './Header.css'

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

export default function Header() {
  const [query, setQuery] = useState('')
  const [showMovieGenres, setShowMovieGenres] = useState(false)
  const [showTVGenres, setShowTVGenres] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?query=${encodeURIComponent(query.trim())}`)
  }

  const navigateToGenre = (type: 'movie' | 'tv', genreId: number, genreName: string) => {
    router.push(`/${type}?genre=${genreId}&name=${encodeURIComponent(genreName)}`)
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <h1 className="logo">
            <Link href="/">LumeTV</Link>
          </h1>

          {/* Navigation closer to logo */}
          <nav className="main-nav">
            <Link href="/" className="nav-link">Home</Link>

            <div
              className="nav-link-container"
              onMouseEnter={() => setShowMovieGenres(true)}
              onMouseLeave={() => setShowMovieGenres(false)}
            >
              <Link href="/movie" className="nav-link">Movies</Link>
              {showMovieGenres && (
                <div className="genre-dropdown">
                  <div className="genre-grid">
                    {MOVIE_GENRES.map(genre => (
                      <button
                        key={genre.id}
                        className="genre-item"
                        onClick={() => navigateToGenre('movie', genre.id, genre.name)}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="nav-link-container"
              onMouseEnter={() => setShowTVGenres(true)}
              onMouseLeave={() => setShowTVGenres(false)}
            >
              <Link href="/tv" className="nav-link">TV Shows</Link>
              {showTVGenres && (
                <div className="genre-dropdown">
                  <div className="genre-grid">
                    {TV_GENRES.map(genre => (
                      <button
                        key={genre.id}
                        className="genre-item"
                        onClick={() => navigateToGenre('tv', genre.id, genre.name)}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="nav-right">
            <input
              type="text"
              placeholder="Search movies or shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
            <button onClick={handleSearch}>Search</button>
            <button className="sign-in-btn" onClick={() => setIsDialogOpen(true)}>Sign In</button>
          </div>
        </div>
      </header>

      {/* Login/Register Dialog */}
      {isDialogOpen && (
        <div className="dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>

            <form className="dialog-form">
              {isRegister && (
                <input type="text" placeholder="Username" required />
              )}
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="dialog-submit">
                {isRegister ? 'Register' : 'Login'}
              </button>
            </form>

            <p className="dialog-switch">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span onClick={() => setIsRegister(!isRegister)}>
                Click here!
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
