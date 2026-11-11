# AI handoff: HydroNexus website

## Purpose and status
A single-page research website for a school team's spaceflight **proposal** (Sequentially Triggered Peptide Hydrogels). It was first built visually in Framer and then re-implemented here as code. All sections are complete; the site builds with `npm run build`.

## Hard rules (from the owner)
1. Never invent results, measurements, citations, ISS approval, flight status or medical efficacy. Keep established background / hypothesis / proposed method / conceptual simulation / actual results (none yet) clearly separate.
2. Chamber contents come from the proposal: Chamber 1 = PA solution (4.0 mL). Chamber 2 = full salt dose 100% (single-stage) or stage-1 25% (sequential). Chamber 3 = water blank (single-stage) or stage-2 75% salt (sequential). No chemical locking solution is flown; fixation is done on the ground after return.
3. Palette: navy #10243A, cyan #19C6D2, off-white #F3F7FA, with restrained shades. Chamber colours in diagrams and simulation: teal #1FB5A6, amber #FFB347, coral #FF6F61.
4. Free tools only; never buy domains or plans without asking. Do not publish or deploy without the owner's instruction.
5. Both Co-Team Leads (Keshav Singh, Arav Gupta) have equal prominence.
6. No video yet; the video section is switched off in code.

## Architecture
- `index.html` -> `src/main.tsx` -> `App.tsx` (renders everything). `styles.css` holds all CSS (class names: `sec`, `inner`, `grid`, `col` = ruled editorial column, `card`, `cell` = condition card, `tube`/`ch` = chamber diagram, `reveal` = scroll fade-in).
- `App.tsx` helpers: `Section`, `Head`, `Col`, `Card`, `Tube`. Data arrays at the top (`conditions`, `predicted`, `groups`). Scroll reveals use one IntersectionObserver in `App` (respects reduced motion in CSS).
- `data/team.ts`, `data/references.ts`: editable data. Team renders three groups (students, mentors, leadership) from `category`; designations are arrays.
- Components: `HydroSimulation` (Three.js, ~37 KB, self-contained, React state for UI plus refs for the render loop), `NanofibreField` (canvas, ~30 fps, pauses off-screen, still for reduced motion), `PASelfAssembly` (SVG). They import `RenderTarget` from `shims/framer.ts` only for legacy compatibility.
- Anchors: `#home #background #problem #hypothesis #design #mixstix #simulation #method #expected #applications #references #team`. The nav lists nine of them.

## Content summary (source of truth)
Four conditions: 1 ISS+single-stage, 2 ISS+sequential, 3 Earth+single-stage, 4 Earth+sequential. Two clamps, two crew activations, 8.0 mL total. Incubation about 30 min (tested 15 to 60). Planned: documentation Jan to Mar 2027, loading July 2027, launch Aug 2027, analysis Sep to Oct 2027. Design needs six tubes (two flight, two flight backup, two ground); the standard kit has three; fallback is Arm B only. Measurements: macro photos, fibre diameter (cryo-TEM/SEM, 100+ fibres, 3 regions), porosity, regional CV, aggregates, rheology if enough gel. Flight arms are single tubes, so flight results are only indicative.
References kept (verified against publisher or index pages): [1] Hartgerink et al., Science 2001, doi 10.1126/science.1063187 (pH-triggered PA scaffolds); [2] MRS OPL 2014 PA salt effects, doi 10.1557/opl.2014.40; [3] Sepahvandi et al., Gels 2025, doi 10.3390/gels11050342 (simulated microgravity review); [4] Rugg, ISS National Laboratory, 7 Nov 2024 (MixStix). The Framer version had 12 references; the owner asked for 3 to 4, so claims depending on removed sources were reworded.

## Completed
Hero with canvas fibres, all 13 sections (video hidden), self-assembly schematic, 2x2 conditions matrix, MixStix arm diagrams, 3D simulation with all controls and callouts, expandable team data, four references, SEO tags, responsive CSS (860 px and 560 px breakpoints), scroll reveals, hover lifts.

## Remaining / not verified
- Not visually tested in a real browser after the port from Framer: check every section at desktop, tablet and phone widths; click every simulation control.
- Replace `YOUR-DOMAIN` (index.html, robots.txt, sitemap.xml); add `public/og-image.png` (1200x630).
- Add team photos (`public/team/`), project video, and optionally a contact email (none published).
- The PA schematic scrolls horizontally on narrow screens.
- Consider code-splitting Three.js (bundle is about 670 KB, 185 KB gzipped).
- Authors for reference [2] were not recorded.

## Verification checklist for any change
`npm run build` passes; no text claims results or approvals; chamber contents unchanged; citation numbers match `references.ts`; contrast readable; reduced-motion respected.

## Update (11 Nov 2026)
- Video section is now enabled in `src/App.tsx` with the YouTube embed https://www.youtube.com/embed/2mL9SMTMmEY (same video as the live Framer site).
- NOT verified: `npm install` and `npm run build` could not be run in the last session (sandbox had no network). Run `npm install && npm run build` first and fix anything that fails.
- Repository has not been created yet; use `sh scripts/push-to-github.sh` (needs git + gh CLI, `gh auth login`).
