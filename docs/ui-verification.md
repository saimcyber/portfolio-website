# UI verification and fixes

Completed 1 October 2026 for https://saimzaib.tech/.

## Fixed

- Replaced the embedded favicon data URL with crawlable `/favicon.svg` and `/favicon-96.png` files; added a 180px Apple touch icon. The existing SZ branding is preserved.
- Removed the word Description under both Automate and Secure.
- Unified header and About-section links under native browser scrolling. Added a visible Home link, focus handling, direct hash support, and Back/Forward handling. Disabled competing automatic scroll restoration.
- Confined the optional 3D scene to the hero. Removed its control over About, services and career visibility and positioning. Off-screen rendering pauses; phone layouts show the lightweight diagram.
- Removed text reveals that could leave content invisible after resizing.
- Kept all What I Do descriptions and tools visible without hover or expansion.
- Added accessible mobile carousel controls and changed project selection to move only the carousel horizontally. Reduced-motion preferences are respected by carousel scrolling.
- Added a shell dialog label, input label, focus trap, Escape handling and focus restoration.
- Gave the fixed header an opaque background and hid the fixed social/resume rail after leaving the hero. Resume and social links remain in Contact.

## Checks performed in Chrome

| Flow | Result |
| --- | --- |
| Desktop About → Explore my cloud projects | Correct Work section, below fixed header |
| Desktop About → Tools I use | Correct Stack section, below fixed header |
| Desktop About → Contact me | Correct Contact section |
| Repeat those paths with 3D enabled | Scene remained in the hero; target content stayed visible |
| Home and browser Back/Forward | Returned to the expected section/home |
| Direct hash loads and refresh handling | Tested section targets; manual restoration added to eliminate competing browser restoration |
| 3D show/hide | Scene rendered without errors; actual pointer activation preserved scroll position |
| Resize enabled 3D from desktop to 390px | Canvas removed and diagram restored |
| Phone 390px | Homepage, About links and Contact checked; no horizontal overflow |
| Narrow phone 320px | Navigation, project target and controls checked; no horizontal overflow |
| Tablet 768px | No horizontal overflow; Career navigation reached 110px below viewport top |
| Carousel arrows and selection buttons | Advanced to AwareNet and selected AWS Cloud Automation; active indicator updated |
| Shell | Open, help command, Tab focus cycling and Escape close passed |
| Footprint | Browser data rendered; rate-limited network lookup showed its unavailable fallback |
| Favicon | PNG inspected visually; SZ mark is readable |

Build and SEO checks passed. Lint has no errors and two existing warnings in the unused Loading component and LoadingProvider Fast Refresh exports. Existing upstream Three.js/lottie build warnings remain.

## Limits and maintenance

These checks cover Chrome at desktop, tablet and phone viewport sizes; they are not a certification across every browser or physical device. No messages were sent through contact links. Precise-location permission was not granted during testing. The third-party network-location service returned 429 during one test; its fallback was verified.

Google chooses when to refresh the search-result favicon. The files must first be recrawled; immediate display cannot be guaranteed. See [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search).

The earlier PageSpeed scores in `seo-report.md` belong to the September 27 deployment, not a new measurement of this UI revision.

Final verification note: Chrome automation could not restart on 1 October because its sandbox helper failed before opening a tab. The interaction evidence above is from the completed local production-build tests on 30 September. The deployed revision is additionally checked over HTTP.

Production deployment: dpl_9xRPoGAx6dsJxvgujDLHHhZLFcea. Live HTTP checks passed for the new homepage build, all three favicon assets, robots.txt, sitemap.xml and the resume PDF (all HTTP 200).
