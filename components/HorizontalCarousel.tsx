'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';

interface HorizontalCarouselProps {
  items: any[];
  title?: string;
}

export default function HorizontalCarousel({ items, title }: HorizontalCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftBtn(scrollLeft > 0);
    setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="carousel-section">
      {title && <h2 className="section-title">{title}</h2>}
      
      <div className="carousel-outer-container">
        {/* Left button */}
        {showLeftBtn && (
          <button onClick={() => scroll("left")} className="carousel-btn left-btn">◀</button>
        )}

        {/* Scrollable container with hidden overflow */}
        <div ref={containerRef} className="carousel-wrapper">
          <div className="grid-cards">
            {items.map(item => {
              if (!item) return null;
              const routeType = item.media_type || (item.title ? "movie" : "tv");
              const movieTitle = item.title || item.name || "Untitled";

              return (
                <div key={item.id} className="card">
                  <div className="card-inner">
                    <Link href={`/watch/${routeType}/${item.id}`} className="card-link">
                      <img
                        src={getImageUrl(item.backdrop_path || item.poster_path, "w780")}
                        alt={movieTitle}
                        className="card-image"
                      />
                    </Link>
                    <div className="card-overlay">
                      <div className="card-overlay-top">
                        <span className="card-title">{movieTitle}</span>
                        <span className="card-rating">⭐ {item.vote_average?.toFixed(1) || "N/A"}</span>
                      </div>
                      <div className="card-overlay-bottom">
                        <span className="card-date">
                          {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}
                        </span>
                        <Link href={`/watch/${routeType}/${item.id}`} className="card-play">▶ Play</Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right button */}
        {showRightBtn && (
          <button onClick={() => scroll("right")} className="carousel-btn right-btn">▶</button>
        )}
      </div>
    </div>
  );
}