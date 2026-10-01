# Portfolio UI restoration — 1 October 2026

This revision restores motion and redesigns the portfolio while keeping its
prerendered content, metadata, schema, sitemap and accessible section links.
It is a local revision; this session did not deploy it.

## Experience

- Larger typographic hero with rotating automate/secure wording, floating
  fallback illustration, procedural 3D starting automatically on desktop,
  primary project/contact actions and a functional scroll cue.
- Scoped GSAP intro, section reveals, readable word emphasis, career line
  drawing and pipeline stage choreography. Reduced-motion visitors get static,
  fully visible content. The hero animation/render loop pauses off screen.
- Shared spacing, typography, restrained purple/green accents, translucent
  fixed navigation, active-section highlighting and page progress.
- Project selection with per-project diagrams and automatically discovered
  images/videos. Images preserve their proportions and enlarge in a native
  dialog; videos use native controls and stop when leaving their project.
- Cleaner service cards, career timeline, stack and contact presentation.

## Media workflow

Paste pictures/videos into the matching folder under `public/projects/`.
Use `cover.*` for the first item and numbered descriptive file names for the
remaining order/captions. No React or content edits are needed. The dev server
refreshes on media changes; production requires rebuilding/redeploying.
See [media instructions](../public/projects/README.md).

## Verification

Chrome checks covered 1440×900, 768×1024, 390×844 and 320×740 viewport sizes.
The production build was served locally at `http://127.0.0.1:4173/`.

| Check | Evidence |
|---|---|
| Production render/hydration | No captured console errors or warnings on load |
| Responsive layout | No document horizontal overflow at tested widths |
| Desktop 3D | Canvas starts automatically; Pause/Enable control available |
| Phone layout | Canvas absent; diagram and all sections present |
| Reduced motion | Desktop canvas absent; About words fully opaque; CSS loops stop |
| Direct anchors | About, Work, Stack and Career land approximately 110px below the viewport top |
| History | Contact → Back returns to Stack at its previous anchor |
| Project selection | AwareNet and AWS selection replaces active panel; next control retains focus |
| Media discovery | Two temporary SVG images discovered live; cover ordered first; space-containing filename loads |
| Enlarged image | Loaded image; Escape closes dialog, restores focus, unlocks scrolling |
| Video | Temporary recorded WebM decoded (readyState 4), played to 0.403s; controls present; autoplay off |
| Leaving video project | Video paused and its source removed while project is inactive |
| Portfolio shell | Open, help command, Escape dismissal and trigger focus restoration work |
| SEO | Existing prerender, metadata, schema, headings, anchors and local asset checks pass |
| Media unit check | Empty folders, nested images/video, ordering, captions and URL encoding pass |

Temporary media fixtures were removed before the final production build.
The project folders are ready for the user's own screenshots and recordings.

Build succeeds. Lint has no errors and one existing Fast Refresh warning in
`LoadingProvider.tsx`. Upstream Three.js/lottie eval and large-chunk warnings
remain; the 3D chunks remain separate from the initial content bundle.

The existing Digital Footprint location provider returned HTTP 429 during
testing; its unavailable fallback rendered. Precise location was not requested.
Contact links were inspected without sending messages. These are Chrome
viewport tests, not tests on physical devices or every browser. Earlier
Lighthouse scores describe the older deployment, not this revision.

## Opening-screen fit follow-up

Removed the hero's 730/800px minimum heights and fixed 560px visual height that
could push its calls to action below short screens. The hero now uses `100svh`,
height-aware typography and spacing, and a visual sized to the available space.
Phone layouts share the screen between the introduction and flexible diagram.
Compact landscape layouts preserve the copy and buttons. Intrinsic minimum
sizing allows content to grow when accessibility settings need additional room.
Intro motion travel scales with height so it does not push the buttons below
the screen during the entrance animation.

The shell shortcut occupies the unused brand row on phones; desktop footer
copy reserves space for it. This keeps the scroll cue and footer unobstructed.

Measured these viewport sizes: 1920×1080, 1440×900, 1366×660, 1280×600,
1024×768, 768×1024, 767×639, 390×844, 375×667, 320×568, 844×390 and 568×320.
At all twelve sizes, the hero height matched the viewport height, both buttons
were fully within the screen, the introduction cleared the fixed header, and
there was no horizontal page overflow or shell/scroll-cue overlap. A fresh
568×320 load also kept the buttons inside the screen during the intro.
