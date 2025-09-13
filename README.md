# VixStream — VixSrc frontend (Next.js + Tailwind) — UPDATED with TMDB

## What's changed
- TMDB integration for metadata (titles, posters, backdrops, overview, ratings)
- Home page uses TMDB Trending to display posters and titles
- Watch pages fetch TMDB details and embed VixSrc player (best-effort mapping using TMDB IDs)
- Search powered by TMDB
- Fixed globals.css placement and next.config.js

## Setup
1. Ensure .env.local contains your TMDB API key (already included for convenience).
2. Install dependencies:
   npm install
   # If tailwind not installed properly:
   npm install -D tailwindcss@3.4.13 postcss autoprefixer
   npx tailwindcss init -p

3. Run dev:
   npm run dev

Notes:
- VixSrc may not use TMDB IDs internally for every title; if some embeds don't load, you may need to map VixSrc IDs to TMDB IDs in lib/vixsrc.ts
- For production, remove secrets from .env.local and set environment variables in your host.

