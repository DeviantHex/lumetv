'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';

interface HeroSectionProps {
  item: any;
}

// Add this function to your tmdb.ts file
async function getTrailer(type: "movie" | "tv", id: number) {
  try {
    const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) throw new Error(`Failed to fetch trailer for ${type}/${id}`);
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

export default function HeroSection({ item }: HeroSectionProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (item) {
      // Fetch trailer when component mounts
      const type = item.media_type || (item.title ? "movie" : "tv");
      getTrailer(type, item.id).then(key => {
        setTrailerKey(key);
      });
    }
  }, [item]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    
    // Start playing the video when it's loaded
    setTimeout(() => {
      setIsVideoPlaying(true);
    }, 500);
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
    setShowFallback(true);
    setIsVideoLoaded(false);
  };

  if (!item) {
    return (
      <div className="hero-section" style={{backgroundColor: '#0c0f17', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p>No trending content available</p>
      </div>
    );
  }

  const title = item.title || item.name || "Untitled";
  const overview = item.overview || "";
  const routeType = item.media_type || (item.title ? "movie" : "tv");
  const backgroundImage = getImageUrl(item.backdrop_path, "w1280") || getImageUrl(item.poster_path, "w1280");

  return (
    <div className="hero-section">
      <div className="hero-background">
        {/* Show background image initially and as fallback */}
        <div 
          className="hero-background-image"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            opacity: isVideoPlaying ? 0 : 1,
            transition: 'opacity 1s ease-in-out'
          }}
        />
        
        {/* Show video when available and loaded */}
        {trailerKey && !showFallback && (
          <div className="hero-video-container">
            <iframe
              ref={videoRef}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0&enablejsapi=1`}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoLoad}
              onError={handleVideoError}
              className="hero-video"
              style={{
                opacity: isVideoPlaying ? 1 : 0,
                transition: 'opacity 1s ease-in-out'
              }}
            />
          </div>
        )}
        
        <div className="hero-overlay"></div>
        <div className="hero-vignette"></div>
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
            ℹ More Info
          </button>
        </div>
      </div>
    </div>
  );
}