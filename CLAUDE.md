See AGENTS.md for full project context, architecture, and rules.

---

# Code Conventions

## TypeScript
- Strict TypeScript throughout. No `any` types.
- Use proper Supabase generated types where available.
- API routes return `NextResponse` with typed JSON.

## Components
- Use shadcn/ui primitives from `components/ui/`. Never invent new base components.
- Forms live in `components/forms/`.
- History/stats components live in `components/history/`.
- Layout components (sidebar, mobile-nav) live in `components/layout/`.

## Styling
- Tailwind CSS v4 utility classes only.
- **NEVER hardcode color values.** Always use CSS custom properties:
  - `--signal` (orange/primary), `--live` (green/success), `--warn` (yellow/warning), `--alarm` (red/error), `--sky` (blue/info)
  - Usage: `text-[var(--live)]`, `bg-[var(--signal)]`, `border-[var(--alarm)]`
- Component-level custom classes: `.glow-field`, `.display-xl`, `.kicker`, `.stat-number`, `.dot-live`, `.stamp`, `.hazard`
- Fonts: `font-sans` (Space Grotesk), `font-display` (Unbounded), `font-mono` (JetBrains Mono)

## File Organization
- `(app)/` route group — protected app shell with shared sidebar layout
- `(auth)/` route group — login/register pages (no sidebar)
- `app/api/` — all API routes, nested by resource
- `app/api/extension/` — extension-specific token-auth routes
- `lib/` — shared utilities, Supabase clients, YouTube helpers
- `extension/` — standalone Chrome extension (plain JS, no build step)

## API Routes
- Web API routes use session auth via `lib/supabase/server.ts` (cookie-based).
- Extension API routes use token auth via `lib/supabase/admin.ts` (service-role, bypasses RLS).
- Always validate input with Zod or manual checks before DB operations.
- Return consistent error shapes: `{ error: string }`.

## Extension Development
- Chrome Extension Manifest V3 (MV3). No jQuery, no build tools — plain JS.
- Service worker (`background.js`) handles all logic. Popup is UI-only.
- Blocking via `chrome.declarativeNetRequest`. Rules generated dynamically from user's blocked_sites.
- Auth: pairing code → exchange for persistent `upb_` token → SHA-256 hashed in storage.
- Never store raw tokens. Always hash with SHA-256 before storing.

## Database
- All tables have RLS enabled. User can only access their own rows.
- Extension APIs use service-role client to bypass RLS (trusted server context).
- DB triggers handle: profile auto-creation on signup, distraction accumulation, task completion on valid submission.
- Task dates calculated by `task_date_for_timestamp()` function based on user timezone + daily reset time.
- Schema at `supabase/migrations/0001_init.sql` — run manually in Supabase SQL Editor.

## Localization
- All user-facing text is in **Indonesian (Bahasa Indonesia)**.
- Error messages, labels, placeholders — everything in Indonesian.
- Code comments and variable names can be in English.
