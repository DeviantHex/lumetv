// WatchPage.tsx - USING EXACT HERO SECTION STRUCTURE
import React from "react";
import { headers } from "next/headers";
import { getDetails, getImageUrl } from "@/lib/tmdb";
import TVControls from "./TVControls";
import "./watch.css";

interface WatchPageProps {
  params: { type: string; id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { type, id } = params;

  // Get client IP
  const headersList = headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0] || headersList.get("x-real-ip") || "0.0.0.0";

  // Geo lookup
  let isItalian = false;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      cache: "no-store",
    });
    const data = await res.json();
    isItalian = data?.country_code === "IT";
  } catch (err) {
    console.error("GeoIP lookup failed:", err);
  }

  // Metadata
  const details = await getDetails(type === "movie" ? "movie" : "tv", id);
  const title = details?.title || details?.name || "Title";
  const overview = details?.overview || "";
  const poster = getImageUrl(details?.poster_path, "w780");
  const backdrop = getImageUrl(details?.backdrop_path, "w1280");
  const rating = details?.vote_average ? Math.round(details.vote_average * 10) / 10 : null;
  const releaseYear = details?.release_date 
    ? new Date(details.release_date).getFullYear() 
    : details?.first_air_date 
    ? new Date(details.first_air_date).getFullYear() 
    : null;

  // Embed URL
  let embedUrl = `https://vixsrc.to/${type}/${id}?primaryColor=E50914&autoplay=false`;
  if (isItalian) {
    embedUrl += "&lang=it";
  }

  return (
    <div className="watch-page">
      {/* Use EXACT same structure as home page HeroSection */}
      <div className="hero-section">
        <div 
          className="hero-background"
          style={{ 
            backgroundImage: `url(${backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-vignette"></div>
        </div>
        
        {/* Content area - this will contain your watch page content */}
        <div className="watch-content">
          <div className="media-container">
            {/* Poster */}
            <div className="poster-section">
              <div className="poster-frame">
                <img src={poster} alt={title} className="poster-image" />
              </div>
            </div>

            {/* Content */}
            <div className="content-section">
              {/* Title and Overview Row */}
              <div className="title-overview-row">
                <div className="title-section">
                  <h1 className="media-title">{title}</h1>
                  {releaseYear && <span className="release-year">({releaseYear})</span>}
                  
                  <div className="media-meta">
                    {rating && (
                      <div className="rating-badge">
                        <span className="rating-icon">⭐</span>
                        <span className="rating-value">{rating}/10</span>
                      </div>
                    )}
                    {details?.runtime && (
                      <div className="runtime">
                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </div>
                    )}
                  </div>
                </div>

                {/* Overview now beside title */}
                {overview && (
                  <div className="overview-section">
                    <h3 className="section-title">Overview</h3>
                    <p className="media-overview">{overview}</p>
                  </div>
                )}
              </div>

              {/* Player Section - Now takes full width below title/overview */}
              <div className="player-section">
                {type === "tv" ? (
                  <div className="tv-controls-wrapper">
                    <TVControls 
                      tvId={id} 
                      seasons={details?.seasons || []} 
                    />
                  </div>
                ) : (
                  <div className="movie-player">
                    <div className="player-container">
                      <iframe
                        src={embedUrl}
                        allowFullScreen
                        title={`${title} player`}
                        className="media-player"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}