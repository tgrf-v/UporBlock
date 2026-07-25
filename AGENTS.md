<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# UporBlock — Project Guide for AI Agents

## Overview

UporBlock is a distraction-blocking system with a Chrome extension + Next.js web app + Supabase backend. Users get blocked from distracting sites after a configurable threshold and must upload a productive YouTube video to regain access. All UI text is in **Indonesian**.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Database:** Supabase (PostgreSQL + RLS + Auth)
- **Extension:** Chrome Extension Manifest V3 (MV3)
- **Video Verification:** YouTube Data API v3
- **Package Manager:** npm

## Architecture

```
[Chrome Extension] <--token auth--> [Next.js API Routes] <--Supabase JS--> [Supabase/PostgreSQL]
                                          |
                                    [YouTube Data API]
                                          |
                                    [Web Dashboard (React)]
```

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User settings (timezone, threshold, block_mode, etc.) |
| `blocked_sites` | Sites to block (domain/url_prefix/wildcard/regex patterns) |
| `upload_allowlists` | Sites exempt from blocking (e.g. YouTube Studio) |
| `daily_tasks` | One per user per day — tracks status, distraction time |
| `distraction_events` | Raw tracking events from extension |
| `video_submissions` | YouTube video submissions for verification |
| `extension_pairing_codes` | Temporary 6-char codes for extension pairing |
| `extension_tokens` | Persistent `upb_` tokens for extension auth |

Schema: `supabase/migrations/0001_init.sql`

## API Routes

### Web (session-auth via cookies)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/settings` | Get user profile/settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/blocked-sites` | Create blocked site |
| DELETE | `/api/blocked-sites/[id]` | Delete blocked site |
| POST | `/api/allowlists` | Create allowlist entry |
| DELETE | `/api/allowlists/[id]` | Delete allowlist entry |
| GET | `/api/today` | Today's task status |
| GET | `/api/submissions` | List submissions |
| POST | `/api/submissions` | Submit YouTube video |
| GET | `/api/submissions/[id]` | Get submission detail |
| POST | `/api/submissions/[id]/validate` | Manual validation |
| GET | `/api/stats` | Aggregated stats |
| GET | `/api/history` | Paginated history |

### Extension (token-auth via `Bearer upb_...`)
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/extension/pairing-codes` | Generate pairing code |
| POST | `/api/extension/exchange-code` | Exchange code for token |
| GET | `/api/extension/bootstrap` | Full sync (profile, task, rules) |
| POST | `/api/extension/events` | Batch distraction events |
| POST | `/api/extension/enforce` | Update block status |

## Build & Dev Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Sprint Progress

- [x] **Sprint 1:** Foundation — Next.js, shadcn/ui, Supabase, auth, middleware, landing page, DB migration
- [x] **Sprint 2:** Web Control — Settings form, blocked sites CRUD, allowlists CRUD, API routes
- [x] **Sprint 3:** Extension Core — manifest.json, background.js, popup, blocked page, pairing API, connect page
- [x] **Sprint 4:** Enforcement — Focus detection, periodic sync, cooldown, progress bar, status polling
- [x] **Sprint 5:** Video Submission — YouTube API, submission API, form, submit page, validation
- [x] **Sprint 6:** History & Stats — /api/stats, /api/history, stats cards, daily tasks list, submissions list
- [x] **Sprint 7:** Navigation & Polish — Sidebar, mobile nav, (app) route group, loading/error states, landing redesign

## Theme & Design

- **Mode:** Dark — "Studio Lockout" theme
- **Primary:** Signal orange (`oklch(0.70 0.185 35)`)
- **Background:** Dark (`oklch(0.155 0.02 250)`)
- **Status colors:** Use CSS variables — `--signal` (orange), `--live` (green), `--warn` (yellow), `--alarm` (red), `--sky` (blue)
- **Fonts:** Space Grotesk (body), Unbounded (display headings), JetBrains Mono (data/monospace)
- **Textures:** Grid background, noise SVG overlay, ambient glow animation

## Important Rules

- **NEVER hardcode emerald/green colors.** Use CSS variables: `text-[var(--live)]`, `bg-[var(--signal)]`, etc.
- **UI text must be Indonesian.** No English in user-facing labels.
- **Use shadcn/ui components** from `components/ui/`. Don't invent new primitives.
- **Extension APIs use service-role Supabase** (bypasses RLS). Web APIs use session-based auth.
- **Extension auth:** SHA-256 hashed tokens with `upb_` prefix. Never store raw tokens.
- **Task dates** are calculated server-side based on user timezone + daily reset time.
