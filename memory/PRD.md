# Studio Inai — Architect Consulting Website (PRD)

## Original Problem Statement
> "Help me build a nice website for my Architect Consulting company which should look professional as well as modern. I have attached the document about the company and also logo and I have given some reference website as well: 1) https://mawidesign.in/ and 2) [share.google link]. I need the page to be dynamic and controllable from admin panel through login and I need sections like Home, About us, Portfolio, Contact us and a Nice online meeting scheduling section."

## User Personas
- **Prospective Client (Public)** — discovers Studio Inai, browses portfolio, reads about the team, contacts the studio or books a 30-min consultation.
- **Studio Inai Admin** — logs in to manage all site content, projects, team, services, enquiries, bookings and availability.

## Core Requirements
- Public website with: Home, About, Portfolio (filterable + detail modal), Contact (form + map + WhatsApp), Online Meeting Scheduling.
- Admin panel under `/admin` with JWT login; dashboard + CMS for: Site Content, Portfolio, Team, Services, Messages, Bookings, Availability.
- Editorial/architectural aesthetic — Cormorant Garamond + Outfit + Manrope on a stone/earthy minimal palette (not generic SaaS).

## What's Been Implemented (Feb 2026)
- **Backend (FastAPI + MongoDB)** — JWT auth (Bearer), seeded admin, single-source `SiteContent`, full CRUD on Projects/Team/Services, contact messages inbox, booking system with conflict detection, weekly availability + blocked dates + service list.
- **Public Frontend** — editorial Home with hero/intro/four pillars/featured work/services/CTA; About with team grid; filterable Portfolio with detail modal; Contact form + map + WhatsApp; full Schedule flow with custom calendar + 30-min slots + 3-step success.
- **Admin Frontend** — Login → Dashboard (stats + recents) → Site Content editor (hero, about, pillars, contact) → Projects CRUD → Team CRUD → Services CRUD → Messages inbox with read/delete → Bookings table with status + meet link + reply email → Availability editor (weekly slots + blocked dates + service list).
- **Tested end-to-end** by testing agent: 30/30 backend pytest tests passed; all key frontend flows verified.

## Architecture
- Backend at `/app/backend` — `server.py`, `models.py`, `auth.py`, `seed.py`. All routes under `/api`.
- Frontend at `/app/frontend/src` — React 19 + react-router v7 + Tailwind + Shadcn components, sonner toasts, framer-motion ready. API client at `lib/api.js` (axios + Bearer token interceptor).
- Auth: JWT, 24h access token, stored in `localStorage` as `inai_token`.

## Test Credentials
- Admin: `admin@studioinai.com` / `StudioInai@2026` (also in `/app/memory/test_credentials.md`).

## P0 — Completed
- All five public sections + admin CMS + scheduling.

## P1 — Backlog (Next Iteration)
- Replace text wordmark with the official Studio Inai logo (waiting on PNG/SVG export of the `.dwg`).
- Email notifications (Resend/SendGrid) for contact submissions and booking confirmations to admin + auto-confirm email to client.
- Google Calendar + Meet auto-link generation per booking (instead of manual paste).
- Real architectural photography in portfolio (currently curated Unsplash placeholders — editable per project from admin).
- Individual project detail page route (`/portfolio/:slug`) for richer SEO instead of modal.

## P2 — Future
- SEO meta tags + OG previews per project.
- Multi-image upload to backend (object storage) instead of pasting URLs.
- Blog / Journal section for publications and press.
- Multi-admin user management.
- Brute-force lockout on login + password reset.
- Migration from deprecated `@app.on_event` to lifespan handlers.

## Notes
- Calendar local-timezone handling uses server UTC for "today" slot filtering; acceptable for IST given server proximity but worth verifying near midnight.
