# OFFSCRIPT — delivery notes

French-language immersive marketing site. React 19, Vite 8, TypeScript (strict), Tailwind v4, three / @react-three/fiber 9, GSAP + ScrollTrigger.

## Structure
- `src/App.tsx` — hero stage (320vh sticky: rip intro → "Dérive" derail → floating demo windows), then Services, Philosophy, Process, Contact.
- `src/scenes/` — WebGL hero (particles, screens, rails, post-processing).
- `src/components/sections/` — Hero/header, Statement, Services, Philosophy, Process, Contact (form + footer).
- `src/components/ui/FloatingWindows.tsx` — draggable demo windows and the "tear open" transition.
- `src/demos/` — ten interactive demo sites (`#/demo/<slug>`), lazy-loaded.
- `src/data/site.ts` — all editable content: contact details, expertises, process, form options.
- `public/media/` — photo/video drop-in slots (see `public/media/README.txt`); missing files fall back to generative visuals.
- `api/contact.ts` — contact endpoint (Vercel serverless function, Resend).
- `tests/` — Playwright scripts (`sections.mjs`, `form.mjs`).

## Setup
```
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview
```
Add `?intro=0` to skip the opening animation while testing.

## Contact form
The form validates client-side and server-side, has a honeypot, and only shows "Message envoyé" when the server answers `{ ok: true }`. Otherwise it shows an honest error. Without a backend (e.g. `npm run dev`) you will see "L'envoi n'est pas encore activé".

To enable sending (Vercel):
1. Create a Resend account and verify your sending domain.
2. Set env vars: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` (e.g. `OFFSCRIPT <contact@yourdomain>`).
3. Deploy; the form posts to `/api/contact`. For another host, set `VITE_CONTACT_ENDPOINT` or port the handler.

## Still to configure
- `src/data/site.ts`: `email`, `instagram`, `linkedin` are empty and display "à confirmer" until filled.
- Domain: `offscript.ma` is the planned, unconfirmed domain. Update `public/sitemap.xml`, `public/robots.txt`, and add `<link rel="canonical">` and absolute `og:image`/`og:url` once confirmed.
- Budget ranges in `BUDGETS` are placeholders — adjust to your pricing.
- Missing media (fallback visuals are used meanwhile): volta detail-2/3, onyx watch-3/4 (+ optional macro.mp4), atelier project-1..4, pulse hero.mp4 + crowd-1/2.
- Demo content is illustrative; no real clients, reviews or awards are claimed anywhere.

## Testing done
Type-check clean; production build passes; Playwright on desktop (1440) and mobile (390): no horizontal overflow, no console errors, form validation and honest-failure states verified, section screenshots reviewed.

## Limitations
- Tested with software WebGL only; real GPU and real phone performance are unverified.
- Reduced-motion and non-WebGL fallbacks are implemented but only partly exercised in automated tests.
- Ten demos and the hero WebGL chunk (~270 KB gzip) are heavy for low-end phones; post-processing is disabled on small screens.
