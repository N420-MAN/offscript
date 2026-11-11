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

## Tuning and diagnostics

- `?debug` on any URL shows a small overlay with the 3D frame rate, render resolution and canvas size (bottom-left).
- Transition speed limit: `MAX_SPEED` in `src/hooks/useStageScroll.ts` (share of the journey per second; lower = slower).
- 3D quality: the render resolution starts at its maximum and the governor in `src/scenes/objects/Derail.tsx` lowers it only after a
  sustained slow stretch (floors: 1.5x on desktop, 1.75x on phones/tablets) and raises it again when frames are fast. Rotating a phone or
  crossing the phone breakpoint rebuilds the scene with the right settings.
- Contact API: set `ALLOWED_ORIGINS` (e.g. `offscript.ma,www.offscript.ma`) once the production domain is live. The rate limit is per
  server instance; for a durable one, add a shared store (e.g. Upstash Redis).
- The privacy line under the form ("Les informations saisies servent uniquement à répondre à votre demande.") must match your real data
  handling: adjust it if you add analytics, a CRM or retention.
- Tests (not shipped in the zip) live in `tests/`; `relax.test.mjs` checks the window layout without a browser.

## Changes in offscript-2
- New "03 — Projets" section (`src/components/sections/Work.tsx`): a readable index of the ten demos below Services; each card opens its demo with the demo's own reveal (`src/lib/openDemo.ts`). Section labels renumbered 04–06.
- Services: split header, tighter top spacing; on desktop a preview of a matching demo trails the pointer over the list.
- Process: sticky heading with a live step counter on wide screens; the step being read is highlighted.
- Hero: when the intro is skipped (returning visitor, `?intro=0`) the headline still enters line by line on load.
- Buttons step up on hover and press on click (`.btn`); cards lift 2px and their titles underline (`.work-card`, `.link-draw`); all off under reduced motion.
- Demos: prev/next controls with a counter (bottom right), a wipe between demos, and Esc closes back to the studio.
- Performance: React, GSAP and three.js in their own cached chunks (`vite.config.ts`); app code is ~27 KB gzip. Photos in `public/media` and `public/demos` recompressed (same filenames).
- Visual pass 2: a vermilion band of the studio's trades after Projets (`Band.tsx`, pausable, still under reduced motion); Philosophy on a bone ground with three principles (Clair, Singulier, Vivant: new copy, edit in `Philosophy.tsx`); Contact heading split with its CTA, the form in a graphite panel, and a full footer (navigation, contacts, back to top, solid wordmark).

## Smoothness pass (measured on Intel Iris Xe, 1440×900)
| Phase | Before | After |
|---|---|---|
| Hero at rest | 35 fps | 51–55 fps |
| The break (scrolling) | 25 fps, worst stall 216 ms | 41–57 fps, worst ~67 ms |
| Windows flying in | 26 fps, worst stall 500 ms | 48–57 fps |
| Windows at rest | 52 fps | 60 fps |

- Intro: the page waits with a blinking caret until the 3D scene has compiled, then types and tears (typing used to freeze ~0.5 s and jump). The scrollbar gutter is reserved, so the page no longer shifts sideways and the canvas no longer resizes when the tear ends. Sections below the hero no longer re-render when the intro finishes.
- 3D: desktop renders at up to 1.5× (was 2×), no double anti-aliasing, at most 2× MSAA; invisible glyph particles are skipped by the GPU; the break's vermilion screen textures are uploaded in advance; the quality governor reacts in ~1–2 s (was ~10 s), lowers resolution down to 1× before capping frame rate, and never resizes mid-transition or during the intro glide.
- Scroll: the gate now stops a wheel/trackpad scroll exactly at the windows instead of overshooting and yanking back; the scene follows the scroll faster (MAX_SPEED 0.34); the header measures at most once per frame.
- Windows: calm, mostly upright drift (tilt ±5°, 3D sway ±3–10°, smaller swells), gentler entry spin; previews pre-decoded while the hero is idle; entry glow repainted in steps rather than every frame.
- Fixed: header/footer/hero links clicked from the top no longer stop at the demo windows. The link glide cleared its own gate bypass right after setting it, so the scroll gate caught it; the order is fixed, and an interrupted glide now hands the gate back instead of leaving it off.

## Demo sites, niche pass (2026-11-11)
Lineup chosen for a Casablanca studio's best niches (health, hospitality, property, restaurants, private education).
Fragment (shop), Volta (EV) and Pulse (festival) are untouched.

| Demo | Niche | What a client can do on it |
|---|---|---|
| Maison Safran (new, replaces Nordal) | Restaurant | Menu by section with MAD prices, the room and terrace, table booking (day, lunch/dinner, time, covers) |
| Les Cèdres (new, replaces Onyx) | Private school | Cycle explorer, a school day, campus, fees estimator with sibling discount, visit booking |
| Centre Aurèle (rebuilt) | Medical centre | Specialties, doctors with fees and availability, booking by specialty → doctor → slot |
| Riad Zéphyr (rebuilt) | Riad / guesthouse | Rooms with nightly prices, experiences, direct booking with live total |
| Verticale (extended) | Property developer | Exploding floors kept; gallery, apartment finder with status, mortgage simulator, brochure/visit form |
| Atelier Null (extended) | Architecture | Projects with photos, process, project brief form |
| Synapse (extended) | Software / AI | The product answering with cited sources, pricing in MAD, demo request |

- Shared demo kit: `src/demos/kit.tsx` (photos, day/slot pickers, honest "demo, nothing sent" confirmation, credits footer).
- Every booking/form ends on a confirmation that says plainly nothing was sent.
- ".ma" removed from the window bars and project cards; they show the sector instead.
- Photos: free-licence stand-ins from Wikimedia Commons in `public/media/<demo>/`, credited in each demo's footer
  ("Crédits photos") from `src/demos/credits.json` (copy of `public/media/CREDITS.json`). No photo of a named, recognisable
  place is presented as the client's own; no real person is given a fictional doctor's name (doctors appear as initials).
- Previews (`public/demos/<slug>.jpg`) regenerated for the new heroes; `?clean` hides the demo controls for screenshots.
- Business names, prices, doctors and figures are fictional demo content.

### Restaurant photo fix

- The two "couscous" signature photos were tajines. They are replaced by a real seven-vegetable couscous (ZRAFIQA, CC BY-SA 4.0) and a real couscous tfaya (Samarrows, CC BY-SA 4.0).
- A couscous tfaya line is added to the Plats menu.
- The alt text on the Plats and Entrées photos now matches what is shown.
- Four unused or wrong restaurant photos are removed, along with their credits.

### Photo-label audit (all demos)

- Riad: the hammam card now shows a hammam hot room instead of a fountain, and the rooftop-dinner card shows the medina rooftops at night instead of a souk lantern stall.
- Riad: Suite Terrasse is now "sous les palmiers", because the photo is a ground-level garden terrace, not a rooftop. The room alt texts now match their photos.
- School: the campus photo, which showed a Malaysian school with Chinese signage, is replaced. The "Salle de conférences" caption is now "Salles d étude", since the photo shows an old study hall.
- Clinic, Verticale and Atelier: alt text corrected to describe what each photo shows.
- Unused photos are removed, along with their footer credits.
- public/media/README.txt now says that hotel/, residence/ and volta/ came with offscript-1.
