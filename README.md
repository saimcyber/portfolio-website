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

### Tech-stack spheres

The floating logo spheres read from `imageUrls` in
`src/components/TechStack.tsx`. Replacement images must be **square**
(they are mapped onto spheres), around 512x512, and have an **opaque
background** — the same texture is used as the emissive map, so transparent
regions glow incorrectly.

---

## Things to know

- **GSAP.** `ScrollSmoother` and `SplitText` are imported from the plain
  `gsap` package (v3.13+), which bundles every plugin for free since GSAP's
  April 2025 licensing change. No club membership or `gsap-trial` needed.
- **Desktop vs mobile.** The 1024px width breakpoint is a JavaScript one, not
  just CSS: below it the 3D character moves inside the landing section and the
  tech-stack canvas does not mount at all (`MainContainer.tsx`).
- **The only 3D asset** is `public/models/char_enviorment.hdr`, shared by the
  hero scene and the tech-stack canvas. Everything else is generated in code,
  so there are no model downloads. The original encrypted character GLB, its
  DRACO decoder and the bone data were removed with the character.
- **Loading** is gated on the HDR plus a first rendered frame plus a short
  floor duration, with an 8s failsafe in `Cluster/Scene.tsx` - without the
  floor the loader would finish instantly and the boot sequence would never be
  readable.
- **`@gsap/react`** is pinned in `package-lock.json` to the public npm registry
  rather than `npm.greensock.com`, which is unreachable from some networks.
  Same tarball, same integrity hash.

---

## License

See `LICENSE` (Personal Portfolio License v1.0), inherited from the original
project.
