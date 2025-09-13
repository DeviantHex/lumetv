'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';

interface HorizontalCarouselProps {
  items: any[];
  title?: string;
}

export default function HorizontalCarousel({ items, title }: HorizontalCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = 400;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="carousel-section">
      {title && <h2 className="section-title">{title}</h2>}
      
      <div className="carousel-wrapper">
        <button onClick={() => scroll("left")} className="carousel-btn left-btn">◀</button>

        <div ref={containerRef} className="grid-cards">
          {items.map(item => {
            if (!item) return null;
            
            const routeType = item.media_type || (item.title ? "movie" : "tv");
            const title = item.title || item.name || "Untitled";
            const isHovered = hoveredItem === item.id;

            return (
              <div 
                key={item.id} 
                className="card"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link href={`/watch/${routeType}/${item.id}`} className="card-link">
                  <img 
                    src={getImageUrl(item.poster_path)} 
                    alt={title} 
                    className="card-image"
                  />
                  
                  {/* Card content that appears on hover */}
                  <div className={`card-content ${isHovered ? 'visible' : ''}`}>
                    <h3 className="card-title">{title}</h3>
                    <p className="card-date">
                      {item.release_date || item.first_air_date || ""}
                    </p>
                    
                    {/* Play button that appears on hover */}
                    <div className="card-actions">
                      <Link 
                        href={`/watch/${routeType}/${item.id}`} 
                        className="play-button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ▶ Play
                      </Link>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <button onClick={() => scroll("right")} className="carousel-btn right-btn">▶</button>
      </div>
    </div>
  );
}