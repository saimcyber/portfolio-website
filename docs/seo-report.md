# SEO delivery report

Site: https://saimzaib.tech/
Completed: 27 September 2026

## Search Console

Completed on 24 September 2026:

- Verified the URL-prefix property using the Google HTML meta tag. Keep that tag in `index.html`.
- Submitted `https://saimzaib.tech/sitemap.xml`. Its detail screen confirmed **Sitemap processed successfully**, with one discovered page.
- URL Inspection showed **URL is on Google** and **Page is indexed**.
- Requested indexing; Google confirmed the URL was added to its priority crawl queue.

The homepage was indexed when inspected. Visibility for particular searches is a ranking question; technical eligibility does not guarantee a position or immediate changes.

## Requested work

| Item | Delivered or verified |
| --- | --- |
| Sitemap | Retained and simplified the existing sitemap to the one real page, `/`. Section anchors are not separate pages. |
| robots.txt | Existing file permits crawling and points to the HTTPS sitemap; checked successfully. |
| noindex | No noindex tag or blocking response header was found. Explicit index/follow metadata added. |
| Canonical | Homepage canonical points to `https://saimzaib.tech/`. |
| Title and description | Relevant existing title/description preserved in initial HTML and covered by regression checks. |
| H1 and hierarchy | One H1; H2 section headings and H3 item headings. Decorative labels use paragraphs. |
| Image alternatives | Meaningful images have descriptive alternatives; decorative placeholders use empty alt. Image dimensions prevent layout shifts. |
| Schema | Build generates Person, WebSite and ProfilePage JSON-LD from actual portfolio content. Checked JSON and required relationships; no claim of Google rich-result eligibility. |
| Internal links | Added project, stack and contact links from About, section navigation and a skip link. |
| Broken links | Checked internal anchors/assets, resume and existing GitHub/LinkedIn destinations. Projects without supplied repository URLs remain plain cards. |
| Image compression | OG PNG reduced from 167,494 to 65,057 bytes (61%); placeholder WebP from 1,886 to 730 bytes (61%). Added a lightweight SVG hero preview. |
| Performance | Prerendered portfolio HTML, removed loading-screen dependency, self-hosted Geist, deferred WebGL until desktop users select Explore 3D scene, and configured asset caching. |
| Mobile | Checked narrow layouts, corrected wrapping, exposed skill content without hover, and excluded WebGL from mobile/reduced-motion initial loads. |
| HTTPS | Verified HTTP-to-HTTPS and www-to-apex 308 redirects plus existing HSTS. |
| Clean URLs | Canonical root URL, permanent `/index.html` redirect and no unnecessary invented routes. Unknown paths return 404. |
| OG image | Existing 1200 x 630 image retained and compressed; Open Graph/Twitter metadata and image alternatives checked. |
| Search Console | Verified, sitemap processed, indexed status confirmed, indexing requested. |
| Backlinks | Four-week plan and outreach draft in [backlink-strategy.md](backlink-strategy.md). No outreach or profile changes sent. |

## Performance evidence

[PageSpeed report, 27 September 2026](https://pagespeed.web.dev/analysis/https-saimzaib-tech/jxru1y9qre?form_factor=desktop), after the on-demand 3D change:

| Lab metric | Mobile | Desktop |
| --- | --- | --- |
| Performance | 97 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| Largest Contentful Paint | 1.8 s | 0.5 s |
| Total Blocking Time | 0 ms | 20 ms |
| Cumulative Layout Shift | 0 | 0 |

Desktop performance previously measured 60, with 12,580 ms Total Blocking Time from the automatic scene. An intermediate audit identified a prohibited aria-label added to the About paragraph by SplitText. Its paragraph configuration now leaves the readable text exposed without that attribute and uses opacity for the animation. The final audit above confirms accessibility returned to 100 on desktop. Configuration reference: [GSAP SplitText documentation](https://gsap.com/docs/v3/Plugins/SplitText/).

These are Lighthouse lab measurements, which vary between runs. PageSpeed reported no real-user data, so field Core Web Vitals and INP cannot yet be confirmed. Selecting the optional 3D scene still incurs WebGL work.

## Verification and maintenance

- Production build completed on Vercel: `dpl_FtqEHfq2mozwWbUKG7XHdgyuKpZ9`, aliased to `saimzaib.tech`.
- `npm run check:seo` passed for prerendered content, metadata, schema, heading order, internal anchors, assets, image attributes, sitemap and robots.
- Lint: zero errors, four existing warnings (Scene and Loading hook dependencies; Navbar and LoadingProvider Fast Refresh exports).
- Desktop scene activation checked in Chrome: canvas rendered and no browser errors.
- Mobile and desktop layouts inspected; viewport overrides reset after testing.
- Build retains a warning about a large Three.js chunk, now fetched on demand, and an upstream lottie eval warning.

Maintain `src/data/content.ts`, metadata in `index.html`, and the sitemap when adding real pages. Run `npm run build` and `npm run check:seo` before deployment. Recheck Search Console impressions and queries after Google recrawls; use the backlink plan to publish useful evidence for the listed projects.

The implementation was deployed through Vercel CLI. Source changes and this report are included in the accompanying Git commit. Push the commit through your usual workflow so a later Git-based deployment preserves these changes.