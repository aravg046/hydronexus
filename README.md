# HydroNexus website

Student research website for **Sequentially Triggered Peptide Hydrogels** (Team HydroNexus, City Montessori School, Aliganj, Voyager MixStix Student Research Program with the Rakia Mission).
It presents a **proposal**. It does not claim flight approval, experimental results or medical efficacy.

## Technologies
React 18 + TypeScript, Vite 5, Three.js (0.160) for the 3D simulation, a 2D canvas for the hero fibres, inline SVG for the self-assembly schematic, plain CSS (no UI framework). Fonts: Geist and Geist Mono (Google Fonts link in `index.html`).

## Project structure
```
index.html                 SEO tags (title, description, Open Graph, Twitter, canonical) and font links
public/                    files copied as-is: robots.txt, sitemap.xml, team/ (photos), video/ (video files)
scripts/push-to-github.sh  optional: creates a new GitHub repo named hydronexus-website and pushes (needs the gh CLI)
src/main.tsx               entry point
src/App.tsx                the whole page: nav, hero and every section, in order
src/styles.css             all styling and the three responsive breakpoints
src/data/team.ts           team members (edit this to add or remove people)
src/data/references.ts     reference list (numbers must match [n] citations in App.tsx)
src/components/HydroSimulation.tsx   interactive 3D MixStix simulation
src/components/NanofibreField.tsx    animated conceptual fibre graphic (hero)
src/components/PASelfAssembly.tsx    peptide-amphiphile self-assembly schematic
src/shims/framer.ts        tiny stand-ins for the Framer APIs the components were first written against
AI_HANDOFF.md              full architecture and status for another AI assistant
```
There are no raster images, video files or GLB models: the 3D scene is built procedurally in code.

## Install and run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks then writes the production site to dist/
npm run preview    # serve dist/ locally
```
Node 18 or newer.

## Editing
- **Text of a section:** open `src/App.tsx`, find the section by its `id` (`background`, `problem`, `hypothesis`, `design`, `mixstix`, `simulation`, `method`, `expected`, `applications`, `references`, `team`) and edit the text. Keep scientific labels (hypothesis, prediction, conceptual) intact.
- **Team:** edit `src/data/team.ts`. Each person has `category` (`students`, `mentors`, `leadership`), any number of `designations`, and an optional `photo` (save the image in `public/team/` and use `"/team/name.jpg"`). The page groups and lays out people automatically.
- **References:** edit `src/data/references.ts` and keep citation numbers in `App.tsx` consistent.
- **Colours and spacing:** CSS variables at the top of `src/styles.css` (`--navy #10243A`, `--cyan #19C6D2`, `--white #F3F7FA`; chamber colours `--teal`, `--amber`, `--coral`).
- **Images:** put files in `public/` and reference them as `/name.png`. Always add `alt` text.
- **Video:** the YouTube embed (https://www.youtube.com/embed/2mL9SMTMmEY) is already switched on in the `{true ? (` block labelled VIDEO in `App.tsx`. To change it, edit the `iframe` `src` (or put a file in `public/video/` and use a `<video>` tag). Change `true` to `false` to hide the section. A nav link can be added to the `nav` array.
- **New component:** create `src/components/Thing.tsx`, import it in `App.tsx`, place it inside a `<Section id="..." tone="dark|light">`.

## Modifying the 3D MixStix simulation (`HydroSimulation.tsx`)
The file has three marked parts.
1. **SIMULATION** (top): pure particle logic. Constants `T_ACT1` (4 s), `T_ACT2` (18 s), `T_END` (36 s) set the timeline. `createSim` places PA particles and ions; `stepSim` moves them (diffusion; on Earth also settling and convection) and decides assembly. Ion count per chamber follows the proposal: single-stage puts all ions in Chamber 2 and water in Chamber 3; sequential puts 25% in Chamber 2 and 75% in Chamber 3.
2. **SCENE**: Three.js tube, chambers, clamps, particles, mixing and gravity arrows, camera (drag to rotate, wheel or pinch to zoom, double-click resets).
3. **UI**: stage caption, legend, callout labels with connector lines (`CALLS` array), and controls (Play/Pause, Reset, speed, focus or compare-all-4, triggering, gravity).
Props with defaults are at the bottom (`defaultView`, `defaultMode`, `defaultGravity`, `autoPlay`, `startTime`, `showControls`, `showCallouts`, `disclaimer`).
Rules: it is a conceptual illustration. Do not add measured-looking numbers, and keep Chamber 3 as water blank (single-stage) or stage-2 salt (sequential). The proposal has no chemical locking solution in flight.

## Deploying (free)
- **Vercel or Netlify:** import the GitHub repo; build command `npm run build`, output `dist`. Free `*.vercel.app` / `*.netlify.app` addresses need no payment.
- **GitHub Pages:** build, then publish `dist/` (set `base` in `vite.config.ts` if serving from a sub-path).
- Before launch replace `YOUR-DOMAIN` in `index.html`, `public/robots.txt` and `public/sitemap.xml`, and add a 1200x630 `public/og-image.png`.

## For another AI coding assistant
Read `AI_HANDOFF.md` first, then `src/App.tsx`. Make targeted edits, run `npm run build` before finishing, and do not invent results, citations or approvals.
