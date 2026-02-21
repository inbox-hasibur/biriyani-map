# SRS v2.0 — Iftar Maps (Viral Ready Edition)

(Condensed technical SRS — same as delivered earlier in chat; included here for repo)

## 1. Overview
- Purpose: Lightweight, shareable Iftar/Biriyani spot map using Vercel for static hosting and Supabase for DB/realtime.
- Host: Vercel (Next.js static), DB/Realtime/Auth: Supabase

## 2. System Architecture
- Frontend: Next.js static app (no server routes)
- DB & Realtime: Supabase Postgres + Realtime
- Auth: Supabase Auth
- Caching: react-query or SWR
- Map tiles: OSM or CARTO Voyager

## 3. Functional Requirements
- FR-01 Area Search (geocoding + pan/zoom)
- FR-02 Current Location (Locate Me button)
- FR-03 Live Stats Header (today counts)
- FR-04 Filtering (verified-only toggle)
- FR-05 Lightweight Post (no images)
- FR-06 Voting (upvote/downvote)
- FR-07 Auto-hide when score <= -5

## 4. Data Model
- users, spots, spot_votes tables (see detailed SRS in chat)

## 5. Triggers & Security
- Triggers to update `spots.score` on votes and set `is_visible=false` when `score<=-5`.
- Enable RLS and strict policies.

## 6. Deployment
- Create Supabase project, apply SQL, enable RLS, setup auth
- Deploy frontend to Vercel

---

See chat for full detailed SRS. Placeholders and SQL below in `supabase/setup.sql`.
