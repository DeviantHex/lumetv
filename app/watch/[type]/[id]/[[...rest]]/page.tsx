import React from "react";
import { getDetails, getImageUrl } from "@/lib/tmdb";
import TVControls from "./TVControls"; // Client component
import "./watch.css";

interface WatchPageProps {
  params: { type: string; id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { type, id } = params;

  // Fetch metadata (Server Component can use async/await)
  const details = await getDetails(type === "movie" ? "movie" : "tv", id);
  const title = details?.title || details?.name || "Title";
  const overview = details?.overview || "";
  const poster = getImageUrl(details?.poster_path, "w780");

 return (
  <div className="watch-page container">
    <div className="watch-content">
      {/* Poster */}
      <div className="watch-poster">
        <img src={poster} alt={title} />
      </div>

      {/* Info & Embed */}
      <div className="watch-info">
        {overview && <p className="watch-overview">{overview}</p>}

        {/* TV controls only for TV shows */}
        {type === "tv" && details?.seasons?.length > 0 && (
          <div className="tv-selectors">
            <TVControls tvId={id} seasons={details.seasons} />
          </div>
        )}

        {/* For movies: simple embed */}
        {type === "movie" && (
          <div className="watch-embed">
            <iframe
              src={`https://vixsrc.to/movie/${id}?primaryColor=E50914&autoplay=false`}
              allowFullScreen
              title={`${title} player`}
            ></iframe>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
