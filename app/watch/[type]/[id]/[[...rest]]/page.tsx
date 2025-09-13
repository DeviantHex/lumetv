import React from "react";
import { headers } from "next/headers"; // ✅ app router way
import { getDetails, getImageUrl } from "@/lib/tmdb";
import TVControls from "./TVControls"; // Client component
import "./watch.css";

interface WatchPageProps {
  params: { type: string; id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { type, id } = params;

  // ✅ Get client IP
  const headersList = headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "0.0.0.0";

  // ✅ Geo lookup
  let isItalian = false;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      // force server-side fetch
      cache: "no-store",
    });
    const data = await res.json();
    isItalian = data?.country_code === "IT";
  } catch (err) {
    console.error("GeoIP lookup failed:", err);
  }

  // ✅ Metadata
  const details = await getDetails(type === "movie" ? "movie" : "tv", id);
  const title = details?.title || details?.name || "Title";
  const overview = details?.overview || "";
  const poster = getImageUrl(details?.poster_path, "w780");

  // ✅ Embed URL
  let embedUrl = `https://vixsrc.to/${type}/${id}?primaryColor=E50914&autoplay=false`;
  if (isItalian) {
    embedUrl += "&lang=it";
  }

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

          {type === "tv" && details?.seasons?.length > 0 && (
            <div className="tv-selectors">
              <TVControls tvId={id} seasons={details.seasons} />
            </div>
          )}

          {type === "movie" && (
            <div className="watch-embed">
              <iframe
                src={embedUrl}
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
