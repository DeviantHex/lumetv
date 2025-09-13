'use client';
import React, { useState, useEffect } from "react";

interface TVControlsProps {
  tvId: string;
  seasons: any[];
}

export default function TVControls({ tvId, seasons }: TVControlsProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.season_number || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(seasons[0]);

  useEffect(() => {
    const season = seasons.find(s => s.season_number === selectedSeason);
    setCurrentSeason(season || seasons[0]);
    setSelectedEpisode(1); // reset episode when season changes
  }, [selectedSeason, seasons]);

  return (
    <div className="tv-controls">
      {/* Season & Episode Selectors */}
      <div className="tv-selectors" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Season:</label>
          <select
            value={selectedSeason}
            onChange={e => setSelectedSeason(Number(e.target.value))}
          >
            {seasons.map(s => (
              <option key={s.season_number} value={s.season_number}>
                {s.name || `Season ${s.season_number}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Episode:</label>
          <select
            value={selectedEpisode}
            onChange={e => setSelectedEpisode(Number(e.target.value))}
          >
            {Array.from({ length: currentSeason?.episode_count || 24 }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Episode {idx + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Embed iframe */}
      <div style={{ width: '100%', marginTop: '1rem' }}>
        <iframe
          src={`https://vixsrc.to/tv/${tvId}/${selectedSeason}/${selectedEpisode}?primaryColor=E50914&autoplay=false`}
          allowFullScreen
          title={`TV Player`}
          style={{
            width: '1000px',
            height: '500px',  // adjust height as needed
            border: 'none',
            borderRadius: '12px',
          }}
        />
      </div>
    </div>
  );
}
