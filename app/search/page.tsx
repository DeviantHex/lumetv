import React from 'react';
import { searchMulti } from '@/lib/tmdb';
import HorizontalCarousel from '@/components/HorizontalCarousel';

interface SearchPageProps {
  searchParams: { query?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.query || '';
  let results: any[] = [];

  if (query) {
    try {
      results = await searchMulti(query);
    } catch (err) {
      console.error('Search failed:', err);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-900">
      <h1 className="text-head">
        Search Results for "{query}"
      </h1>

      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <HorizontalCarousel items={results} />
      )}
    </div>
  );
}
