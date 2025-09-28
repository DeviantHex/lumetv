// TVControls.tsx
'use client';
import React, { useState, useEffect } from "react";

interface TVControlsProps {
  tvId: string;
  seasons: any[];
}

export default function TVControls({ tvId, seasons = [] }: TVControlsProps) {
  // Safe initialization with fallbacks
  const safeSeasons = Array.isArray(seasons) && seasons.length > 0 ? seasons : [{ season_number: 1, name: "Season 1", episode_count: 1 }];
  
  const [selectedSeason, setSelectedSeason] = useState(safeSeasons[0]?.season_number || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(safeSeasons[0]);

  useEffect(() => {
    const season = safeSeasons.find(s => s.season_number === selectedSeason);
    setCurrentSeason(season || safeSeasons[0]);
    setSelectedEpisode(1); // reset episode when season changes
  }, [selectedSeason, safeSeasons]);

  // If no seasons available, show a message
  if (!Array.isArray(seasons) || seasons.length === 0) {
    return (
      <div className="tv-controls">
        <div className="no-seasons-message">
          <h3>No Seasons Available</h3>
          <p>Season information is not available for this TV show.</p>
          <div className="fallback-player">
            <div className="player-container">
              <iframe
                src={`https://vixsrc.to/tv/${tvId}/1/1?primaryColor=E50914&autoplay=false`}
                allowFullScreen
                title="TV Player"
                className="media-player"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-controls">
      <div className="selector-header">
        <h3>Select Episode</h3>
      </div>
      
      <div className="selectors-container">
        <div className="selector-group">
          <label className="selector-label">Season</label>
          <div className="custom-select">
            <select
              value={selectedSeason}
              onChange={e => setSelectedSeason(Number(e.target.value))}
              className="season-selector"
            >
              {safeSeasons.map(s => (
                <option key={s.season_number} value={s.season_number}>
                  {s.name || `Season ${s.season_number}`}
                </option>
              ))}
            </select>
            <div className="select-arrow">▼</div>
          </div>
        </div>

        <div className="selector-group">
          <label className="selector-label">Episode</label>
          <div className="custom-select">
            <select
              value={selectedEpisode}
              onChange={e => setSelectedEpisode(Number(e.target.value))}
              className="episode-selector"
            >
              {Array.from({ length: currentSeason?.episode_count || 1 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Episode {idx + 1}
                </option>
              ))}
            </select>
            <div className="select-arrow">▼</div>
          </div>
        </div>
      </div>

      <div className="player-wrapper">
        <div className="player-container">
          <iframe
            src={`https://vixsrc.to/tv/${tvId}/${selectedSeason}/${selectedEpisode}?primaryColor=E50914&autoplay=false`}
            allowFullScreen
            title="TV Player"
            className="media-player"
          />
        </div>
      </div>
    </div>
  );
}