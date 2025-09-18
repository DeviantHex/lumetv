// components/HeroSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';

interface HeroSectionProps {
  item: any;
}

export default function HeroSection({ item }: HeroSectionProps) {
  if (!item) {
    return <div className="hero-section" style={{backgroundColor: '#0c0f17', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <p>No trending content available</p>
    </div>;
  }

  const title = item.title || item.name || "Untitled";
  const overview = item.overview || "";
  const routeType = item.media_type || (item.title ? "movie" : "tv");
  const backgroundImage = getImageUrl(item.backdrop_path, "w1280") || getImageUrl(item.poster_path, "w1280");

  return (
    <div className="hero-section">
      <div 
        className="hero-background"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-vignette"></div> {/* Vignette element added */}
      </div>
      
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-description">
          {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
        </p>
        <div className="hero-actions">
          <Link href={`/watch/${routeType}/${item.id}`} className="hero-play-btn">
            <span>▶</span> Play
          </Link>
          <button className="hero-info-btn">
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}