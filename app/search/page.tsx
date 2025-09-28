'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { searchMulti, getImageUrl } from '@/lib/tmdb'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { checkMultipleOnVixsrc } from '@/lib/vixsrc'
import './MediaPage.css'

interface SearchPageProps {
  searchParams: { query?: string }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.query?.trim() || ''
  const [results, setResults] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(async () => {
    if (!query || page > totalPages || loading) return
    setLoading(true)

    try {
      const data = await searchMulti(query, page)
      let newResults = data.results || []

      // Filter via Vixsrc availability
      const idsByType: Record<string, number[]> = { movie: [], tv: [] }
      newResults.forEach(item => {
        if (item.media_type === 'movie') idsByType.movie.push(item.id)
        if (item.media_type === 'tv') idsByType.tv.push(item.id)
      })

      const availableMovies = await checkMultipleOnVixsrc('movie', idsByType.movie)
      const availableTVs = await checkMultipleOnVixsrc('tv', idsByType.tv)

      newResults = newResults.filter(item =>
        (item.media_type === 'movie' && availableMovies.includes(item.id)) ||
        (item.media_type === 'tv' && availableTVs.includes(item.id))
      )

      setResults(prev => [...prev, ...newResults])
      setTotalPages(data.total_pages)
      setPage(prev => prev + 1)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [query, page, totalPages, loading])

  const [isFetching] = useInfiniteScroll(loadMore, page <= totalPages && !loading)

  // Initial load
  useEffect(() => {
    if (!query) return
    setResults([])
    setPage(1)
    setTotalPages(1)

    const fetchFirstPage = async () => {
      setLoading(true)
      try {
        const data = await searchMulti(query, 1)
        let newResults = data.results || []

        // Filter via Vixsrc availability
        const idsByType: Record<string, number[]> = { movie: [], tv: [] }
        newResults.forEach(item => {
          if (item.media_type === 'movie') idsByType.movie.push(item.id)
          if (item.media_type === 'tv') idsByType.tv.push(item.id)
        })

        const availableMovies = await checkMultipleOnVixsrc('movie', idsByType.movie)
        const availableTVs = await checkMultipleOnVixsrc('tv', idsByType.tv)

        newResults = newResults.filter(item =>
          (item.media_type === 'movie' && availableMovies.includes(item.id)) ||
          (item.media_type === 'tv' && availableTVs.includes(item.id))
        )

        setResults(newResults)
        setTotalPages(data.total_pages)
        setPage(2)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFirstPage()
  }, [query])

  return (
    <div className="media-page">
      <div className="page-header">
        <h1>
          {query ? `Search Results for "${query}"` : 'Search Movies & TV Shows'}
        </h1>
      </div>

      {results.length === 0 && !loading ? (
        <div className="no-results">
          <h3>No results found</h3>
          <p>Try a different keyword or check your spelling.</p>
        </div>
      ) : (
        <>
          <div className="media-grid">
            {results.map((item) => {
              const title = item.title || item.name
              const poster = item.poster_path
                ? getImageUrl(item.poster_path, 'w500')
                : '/no-poster.png'

              return (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={`/${item.media_type}/${item.id}`}
                  className="media-card-link"
                >
                  <div className="media-card">
                    <img src={poster} alt={title} />
                    <div className="media-info">
                      <h3>{title}</h3>
                      <p>{item.release_date || item.first_air_date || 'N/A'}</p>
                      {item.vote_average > 0 && (
                        <div className="media-rating">
                          ⭐ {item.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {(loading || isFetching) && (
            <div className="loading-more">Loading more results…</div>
          )}
          {page > totalPages && results.length > 0 && (
            <div className="end-of-results">End of search results</div>
          )}
        </>
      )}
    </div>
  )
}
