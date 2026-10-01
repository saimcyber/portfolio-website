# Project media

Paste pictures or videos into the matching folder:

- `securekubeops-pipeline/` — SecureKubeOps Pipeline
- `awarenet-platform/` — AwareNet Platform
- `aws-cloud-automation/` — AWS Cloud Automation

The website discovers files automatically when the dev server or build runs.
While the dev server is running, adding or removing media refreshes the page.
For the deployed website, run a new build and deploy after adding files.

Use `cover.webp` (or cover.png, cover.jpg, etc.) for the first picture.
Other files sort by name: `01-dashboard.webp`, `02-pipeline.png`, `03-demo.mp4`.
The file name also becomes the gallery caption; descriptive names help.
Subfolders are supported. Spaces in file names are handled automatically.

Images: WebP, AVIF, PNG, JPG/JPEG, GIF, SVG.
Videos: MP4, WebM, MOV, M4V. MP4 (H.264) or WebM work most reliably in browsers.
Videos have playback controls and never autoplay. Keep demos short and compress large files.
Pictures preserve their proportions; approximately 16:10 looks best in the preview.

Empty folders show a project-specific architecture illustration. These are conceptual
diagrams, not screenshots of the project. A failed media file offers a readable fallback.
Optional repository/live links are edited in `src/data/content.ts`.
