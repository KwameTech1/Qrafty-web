# Walkthrough video

Place your landing-page walkthrough video at:

- `public/videos/walkthrough.mp4`

This file is referenced by the landing page video section.

If you don’t have a real demo video yet, you can generate a realistic mockup walkthrough MP4 locally:

- Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-walkthrough.ps1`

This generator renders mobile-first UI mockups (Landing, Auth, Dashboard, QR Editor, Interactions, Inventory, Public Profile, Marketplace, Business Profile) to frames and stitches them into `walkthrough.mp4`.

If the script complains that `ffmpeg` is missing, install it with:

- `winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements`

If the script complains that Playwright/Chromium is missing, run:

- `npm install`
- `npx playwright install chromium`

Recommended export settings:

- Aspect ratio: 16:9
- Resolution: 1280×720 or 1920×1080
- Format: MP4 (H.264)
- Duration: 30–90 seconds
