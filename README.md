# Saim Zaib — Portfolio

Personal portfolio site for **Saim Zaib**, DevOps & Cloud Engineer based in
Islamabad, Pakistan.

Built with React, TypeScript, Vite, GSAP and Three.js.

---

## Credits

The page layout, scroll choreography and loading flow of this site started from
the open-source portfolio by **Moncy Yohannan**, used under its Personal
Portfolio License (see `LICENSE`). All content is my own, and the hero 3D
scene, the loading screen and the interactive shell were built from scratch to
replace the original character, mini-game and layout accents.

Original project: https://github.com/moncy-yohannan

---

## Running locally

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # type-check + production build to dist/
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

### Tech-stack cubes

The floating logo cubes read from `imageUrls` in
`src/components/TechStack.tsx`. Replacement images must be **square**
(they are mapped onto rounded cubes), around 512x512, and have an **opaque
background** — the same texture is used as the emissive map, so transparent
regions glow incorrectly.

There are 22 cubes and the texture list is cycled, so every entry in
`imageUrls` is guaranteed to appear two or three times. Adding a ninth texture
changes that distribution but not the cube count.

---

## Things to know

- **GSAP.** `ScrollSmoother` and `SplitText` are imported from the plain
  `gsap` package (v3.13+), which bundles every plugin for free since GSAP's
  April 2025 licensing change. No club membership or `gsap-trial` needed.
- **Desktop vs mobile.** The 1024px width breakpoint is a JavaScript one, not
  just CSS: below it the 3D character moves inside the landing section and the
  tech-stack canvas does not mount at all (`MainContainer.tsx`).
- **The only 3D asset** is `public/models/char_enviorment.hdr`, and only the
  tech-stack canvas still loads it — the hero scene builds its environment from
  `<Lightformer>`s instead. Everything else is generated in code, so there are
  no model downloads. The original encrypted character GLB, its DRACO decoder
  and the bone data were removed with the character.
- **Loading** is gated on the scene mounting plus a first rendered frame plus a
  short floor duration, with an 8s failsafe in `Cluster/Scene.tsx` - without the
  floor the loader would finish instantly and the boot sequence would never be
  readable.
- **The tech-stack canvas is the heaviest thing on the site** by a wide margin:
  ~2.2MB raw / ~854KB gzipped, of which about 89% is the Rapier physics engine's
  WebAssembly binary inlined as base64 by `@dimforge/rapier3d-compat`. It is
  lazy: desktop only, and not mounted until the visitor has scrolled a full
  viewport (`MainContainer.tsx`). Anything that reduces that chunk is the single
  biggest performance lever available.
- **Deployment headers** live in `vercel.json` — long-lived immutable caching
  for `/assets`, `/images` and `/models`, plus `nosniff`, `Referrer-Policy`,
  `X-Frame-Options` and a `Permissions-Policy` that keeps `geolocation` enabled
  for the opt-in button in the Digital Footprint section.
- **`@gsap/react`** is pinned in `package-lock.json` to the public npm registry
  rather than `npm.greensock.com`, which is unreachable from some networks.
  Same tarball, same integrity hash.

---

## License

See `LICENSE` (Personal Portfolio License v1.0), inherited from the original
project.
