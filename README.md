# Frame Layout Planner

A web app to **simulate how photos or artwork fit inside picture frames** with optional mat boards (passe-partout). Plan multi-photo layouts, spacing, and dimensions before printing or ordering frames.

## Features

- **Frame & mat** — Set outer frame size (or pick a paper size), frame thickness, and optional mat board with opening dimensions. Rotate frame/mat to switch portrait/landscape.
- **Fixed image sizes** — Define default photo dimensions (e.g. 90×60 mm). Images are never auto-resized; spacing is computed so the layout fits.
- **Single or multiple images** — Add several images; the app finds a grid that fits and distributes spacing evenly (margins and gaps). Image count is capped so nothing is cut off.
- **Per-image overrides** — Double-click a placeholder to set a custom size for that slot. With **one image**, changing its size in the modal also updates the default photo size in the left panel.
- **Row alignment** — Choose left, center, or right for rows (e.g. when the last row has fewer images).
- **Vertical position** — When you have multiple rows, use the vertical alignment icons to place the grid at top, center, or bottom of the opening.
- **Preview image** — In the double-click modal you can upload an image to show inside that placeholder. It is only for preview and is not stored permanently.
- **Spacing guides** — Enable “Show spacing guides” and hover between two images in the preview to see the gap size in mm.
- **Unit converter** — Convert mm to inches and back in the side panel.

## Tech stack

- React, TypeScript, Vite  
- Tailwind CSS  
- Zustand (state)  
- Lucide React (icons)  
- react-colorful (frame/mat colors)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`).

## Build

```bash
npm run build
```

Output is in `dist/`.

## Rules

- **No cutting** — Images always stay fully visible. The app limits how many images you can add so the layout fits.
- **Frame thickness** — Capped so the inner opening stays valid (e.g. max 80 mm, and never more than half of the smaller frame dimension).
- **Spacing** — Horizontal and vertical spacing (margins and gaps) are computed automatically from the container and image sizes.
