# Saim Zaib — Portfolio

Personal portfolio site for **Saim Zaib**, DevOps & Cloud Engineer based in
Islamabad, Pakistan.

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black)

Built with React, TypeScript and Vite, with a hand-built 3D hero scene
(`@react-three/fiber` + `drei`), native section navigation, and prerendered content. Deployed on Vercel.

## Highlights

- Code-built 3D hero scene — no downloaded GLB/HDR assets
- Prerendered content available immediately; desktop 3D starts automatically after the intro
- Animated career timeline, project showcase with image/video galleries, and a CI/CD-pipeline
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

Originally based on the open-source "3D Developer Portfolio" by
**Moncy Yohannan**. The legacy loading screen and scroll hijacking have been
replaced by scoped animations. Attribution is retained under the
Personal Portfolio License (see `LICENSE`): www.moncy.dev.

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
| `projects` | Project details, tools, conceptual diagrams and optional repository links |
| `skillCards` | The two "What I Do" cards and their tag lists |

Hero wording lives in `src/components/Landing.tsx`.

### Adding project pictures or videos

Paste your files into the matching folder:

| Project | Folder |
|---|---|
| SecureKubeOps Pipeline | `public/projects/securekubeops-pipeline/` |
| AwareNet Platform | `public/projects/awarenet-platform/` |
| AWS Cloud Automation | `public/projects/aws-cloud-automation/` |

No content-code changes are needed. The Vite media plugin discovers files on dev
server startup and at build time. Adding or removing media while developing
refreshes the preview. A deployed site needs a new build/deployment after files
are added. Use `cover.webp`, `cover.png` or `cover.jpg` for the first image;
number other files such as `01-dashboard.webp` and `02-demo.mp4` to set their order.
File names become captions. Nested folders and spaces in names work too.

Images support WebP, AVIF, PNG, JPG/JPEG, GIF and SVG. Videos support MP4, WebM,
MOV and M4V; MP4 (H.264) and WebM are the most portable choices. Videos have
native controls, do not autoplay, and pause when you switch projects. Images
open in an accessible enlarged preview with Escape to close. Empty folders
show conceptual architecture diagrams, rather than fake screenshots.

See [`public/projects/README.md`](public/projects/README.md) for details.
Set an optional project's `link` in `src/data/content.ts` to show a repository
or live-project button. Run `node --test scripts/project-media.test.mjs` to
check file discovery, ordering and URL encoding.

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

- **GSAP.** Scoped intro and scroll reveals, word-by-word About emphasis, a drawing career timeline, and staggered pipeline stages. Effects clean up on unmount and respect reduced motion. Section navigation uses native browser scrolling, with active-section highlighting and browser-history support.
- **Desktop vs mobile.** The decorative 3D scene starts automatically on desktop after a short intro delay, with a lightweight animated diagram appearing first. Use **Pause 3D** to return to the diagram. Mobile and reduced-motion visitors receive the full portfolio without the WebGL bundle. Rendering pauses when the hero leaves the viewport.
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


See `LICENSE` (Personal Portfolio License v1.0). See **Origin** for attribution.

## SEO maintenance

Run `npm run build` and `npm run check:seo` before deployment. The sitemap includes the homepage only because the portfolio is one page; section anchors are internal links, not separate indexed URLs. Keep the Google verification meta tag in `index.html`. Structured data is generated from `src/data/content.ts`. The font is self-hosted through `@fontsource-variable/geist`.

See [the SEO delivery report](docs/seo-report.md) and [the backlink plan](docs/backlink-strategy.md).

## UI restoration (1 October 2026)

The current revision restores scoped intro/scroll motion and automatic desktop
3D, redesigns the layout and project showcase, and adds automatic media-folder
discovery. See [the restoration and validation notes](docs/ui-restoration.md).
The navigation verification below describes the earlier revision.

## Navigation and UI verification (30 September 2026)

Section links use native scrolling with a shared handler for Home, About links, direct hashes and browser history. The optional 3D scene is contained within the hero and cannot change other sections. Content no longer depends on SplitText or ScrollSmoother reveals. The What I Do cards expose all text and tools without hover. Crawlable favicon files live in public/. See [UI verification](docs/ui-verification.md).
