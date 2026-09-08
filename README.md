# Saim Zaib — Portfolio

Personal portfolio site for **Saim Zaib**, DevOps & Cloud Engineer based in
Islamabad, Pakistan.

Built with React, TypeScript, Vite, GSAP and Three.js.

---

## Credits

All content is my own, and the hero 3D
scene, the loading screen and the interactive shell were built from scratch to
replace the original character, mini-game and layout accents.

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
- **Desktop vs mobile.** The 1024px width breakpoint is a JavaScript one, not
  just CSS: below it the 3D hero moves inside the landing section
  (`MainContainer.tsx`). The tech-stack section used to be gated on the same
  check and is now rendered on every viewport.
- **There are no 3D assets left.** The hero scene builds its environment from
  `<Lightformer>`s and its geometry in code, so nothing is downloaded. The
  original encrypted character GLB, its DRACO decoder and the bone data went
  with the character; `char_enviorment.hdr` went with the tech-stack canvas.
- **Loading** is gated on the scene mounting plus a first rendered frame plus a
  short floor duration, with an 8s failsafe in `Cluster/Scene.tsx` - without the
  floor the loader would finish instantly and the boot sequence would never be
  readable.
- **The tech-stack section used to be the heaviest thing on the site**: a
  Rapier physics canvas at ~2.2MB raw / ~854KB gzipped, ~89% of it the physics
  engine's WebAssembly binary inlined as base64. It was replaced by a static
  pipeline diagram, which removed that chunk entirely and let
  `@react-three/rapier` and `three-stdlib` be dropped. The remaining 3D cost is
  the hero scene alone.
- **Deployment headers** live in `vercel.json` — long-lived immutable caching
  for `/assets` and `/images`, plus `nosniff`, `Referrer-Policy`,
  `X-Frame-Options` and a `Permissions-Policy` that keeps `geolocation` enabled
  for the opt-in button in the Digital Footprint section.
- **`@gsap/react`** is pinned in `package-lock.json` to the public npm registry
  rather than `npm.greensock.com`, which is unreachable from some networks.
  Same tarball, same integrity hash.

---

## License

See `LICENSE` (Personal Portfolio License v1.0)
