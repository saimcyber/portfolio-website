# Saim Zaib — Portfolio

Personal portfolio site for **Saim Zaib**, DevOps & Cloud Engineer based in
Islamabad, Pakistan.

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black)

Built with React, TypeScript and Vite, with a hand-built 3D hero scene
(`@react-three/fiber` + `drei`), a GSAP `ScrollSmoother` layout, and a custom
prerendered portfolio with an on-demand scene. Deployed on Vercel.

## Highlights

- Code-built 3D hero scene — no downloaded GLB/HDR assets
- Prerendered content available immediately; desktop 3D loads on demand
- Career timeline, horizontally-scrolling project showcase, and a CI/CD-pipeline
  tech-stack diagram, all driven from one content file
- Security headers and long-lived asset caching configured in `vercel.json`

## Origin

This site has been rebuilt well past its starting point. Everything below is
original work:

- **The hero** — a real-time Kubernetes cluster visualisation
  (`src/components/Cluster/`), written from scratch. It replaces the original
  3D avatar, which is gone along with every one of its assets.
- **Every section** — About, What I Do, Career, Work, Tech Stack, the Digital
  Footprint scanner and the interactive `~` shell — is original in copy,
  design and implementation.
- **Removed entirely** — the Rapier physics mini-game, the encrypted character
  GLB, the DRACO decoder and the HDR environment map.

What carries over from the open-source "3D Developer Portfolio" by
**Moncy Yohannan** is the GSAP ScrollSmoother / ScrollTrigger scroll
choreography and the split-text intro, both heavily adapted. Used under the
Personal Portfolio License (see `LICENSE`); credit per its attribution clause —
www.moncy.dev.

---

## Running locally

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # type-check, bundle, and prerender to dist/
npm run preview  # serve the production build
```

---

## Editing content

All personal content lives in a single file: **`src/data/content.ts`**.

| Export | Drives |
|---|---|
| `personal` | Name, email, phone, location, social links, resume path |
| `careerData` | The career/experience timeline |
| `projects` | The horizontally-scrolling work section |
| `skillCards` | The two "What I Do" cards and their tag lists |

Hero wording lives in `src/components/Landing.tsx`, and the loading-screen
marquee in `src/components/Loading.tsx`.

### Adding project images

Drop `.webp` files into `public/images/` and reference them from the `projects`
array as `/images/<name>.webp`. Set each project's optional `link` field to its
repo URL to activate the outward-arrow badge on the card.

### Tech stack

The stack section is a five-stage CI/CD pipeline driven by `stackStages` and
`stackFoundation` in **`src/data/content.ts`**. Each tool carries an `icon`
string key; `TechStack.tsx` maps those keys onto glyphs from
`react-icons/si` (Simple Icons), which is already a dependency. Add a tool by
adding an entry to a stage's `tools` array and, if it needs a new glyph, a
matching line in the `ICONS` map. A key with no glyph falls back to a dot
rather than throwing, so content edits can't white-screen the section.

---

## Things to know

- **GSAP.** `ScrollSmoother` and `SplitText` are imported from the plain
  `gsap` package (v3.13+), which bundles every plugin for free since GSAP's
  April 2025 licensing change. No club membership or `gsap-trial` needed.
- **Desktop vs mobile.** The decorative 3D scene loads on desktop only after selecting **Explore 3D scene**. A lightweight diagram appears first. Mobile and reduced-motion visitors receive the full portfolio without the WebGL bundle.
- **There are no 3D assets left.** The hero scene builds its environment from
  `<Lightformer>`s and its geometry in code, so nothing is downloaded. The
  original encrypted character GLB, its DRACO decoder and the bone data went
  with the character; `char_enviorment.hdr` went with the tech-stack canvas.
- **Rendering.** The build prerenders the React tree into HTML using `scripts/prerender.mjs`; the browser hydrates it. Content and scrolling no longer wait for a loading screen or WebGL. Keep browser APIs inside effects or guard them for build-time rendering.
- **The tech-stack section used to be the heaviest thing on the site**: a
  Rapier physics canvas at ~2.2MB raw / ~854KB gzipped, ~89% of it the physics
  engine's WebAssembly binary inlined as base64. It was replaced by a static
  pipeline diagram, which removed that chunk entirely and let
  `@react-three/rapier` and `three-stdlib` be dropped. The remaining 3D cost is
  the hero scene alone.
- **Deployment headers** live in `vercel.json` — long-lived immutable caching
  for hashed `/assets`; revalidating daily caching for `/images`, plus `nosniff`, `Referrer-Policy`,
  `X-Frame-Options` and a `Permissions-Policy` that keeps `geolocation` enabled
  for the opt-in button in the Digital Footprint section.
- **`@gsap/react`** is pinned in `package-lock.json` to the public npm registry
  rather than `npm.greensock.com`, which is unreachable from some networks.
  Same tarball, same integrity hash.

---

## License


See `LICENSE` (Personal Portfolio License v1.0). Its attribution and
non-commercial terms cover the adapted scroll/intro code noted under **Origin**.

## SEO maintenance

Run `npm run build` and `npm run check:seo` before deployment. The sitemap includes the homepage only because the portfolio is one page; section anchors are internal links, not separate indexed URLs. Keep the Google verification meta tag in `index.html`. Structured data is generated from `src/data/content.ts`. The font is self-hosted through `@fontsource-variable/geist`.

See [the SEO delivery report](docs/seo-report.md) and [the backlink plan](docs/backlink-strategy.md).
