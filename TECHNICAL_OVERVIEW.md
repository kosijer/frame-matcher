# Technical overview

This document describes the technical side of the **Frame Layout Planner** project: structure, architecture, key modules, and how to work with the codebase when you return to it.

---

## 1. What the app does

- **Layout planner**: Simulate how photos fit inside a picture frame with optional mat (passe-partout). Set frame size, mat opening, and photo dimensions; the app computes a grid layout with even spacing. No cutting—images stay fully visible.
- **Frame search**: Optional AI-powered search for real frames on eBay UK and Amazon UK that match the current dimensions. Uses Gemini API with Google Search grounding. Result logic (four bands: exact/near frame, exact/near image, in-between, bigger) is defined in **docs/FRAME_SEARCH_REQUIREMENTS.md**.

---

## 2. Tech stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Runtime      | Browser (React), Node (Vite dev)    |
| UI           | React 18, TypeScript                |
| Build        | Vite 5                              |
| Styling      | Tailwind CSS                        |
| State        | Zustand (single store)              |
| Icons        | Lucide React                        |
| Colors       | react-colorful (frame/mat pickers)  |
| Frame search | Gemini API (REST), Google Search grounding |

No backend framework: the only “server” is Vite dev middleware that proxies frame search to Gemini.

---

## 3. Project structure

```
frame-generator/
├── index.html                 # Entry HTML
├── package.json
├── vite.config.ts             # Vite + find-frames API middleware
├── tsconfig.json              # TypeScript (root)
├── tsconfig.app.json          # App TS config
├── tailwind.config.js
├── postcss.config.js
├── .env                       # GEMINI_API_KEY (not committed)
├── .gitignore
├── README.md
├── TECHNICAL_OVERVIEW.md      # This file
│
├── server/                    # Server-side (runs in Node via Vite)
│   └── find-frames.ts         # Gemini API client + prompt + JSON parsing
│
└── src/
    ├── main.tsx               # React entry (StrictMode, App, index.css)
    ├── App.tsx                # Layout: header, sidebar, main section
    ├── index.css              # Tailwind imports
    ├── vite-env.d.ts
    │
    ├── store/
    │   └── useFrameStore.ts   # Zustand store: frame, mat, images, layout result
    │
    ├── types/
    │   └── types.ts           # ImageItem, GridLayoutResult, PaperSize, etc.
    │
    ├── constants/
    │   └── paperSizes.ts       # A/B/C paper sizes (mm), defaults
    │
    ├── algorithms/
    │   └── gridPacking.ts      # computeGridLayout (rows/cols, spacing)
    │
    ├── utils/
    │   ├── layoutMath.ts      # Row offsets, alignment helpers
    │   └── conversions.ts     # mm ↔ inches
    │
    ├── api/
    │   └── findFrames.ts      # Frontend: POST /api/find-frames, types
    │
    └── components/
        ├── FrameControls.tsx  # Sidebar: frame/mat/image controls, toggles
        ├── SizeSelector.tsx    # Paper size dropdown + custom dimensions
        ├── ColorPicker.tsx     # Frame/mat color
        ├── UnitConverter.tsx   # mm/in conversion
        ├── HelpTooltip.tsx
        ├── FramePreview.tsx    # Main canvas: frame + mat + image grid
        ├── ImageGrid.tsx       # Renders image placeholders
        ├── ImageItem.tsx       # Single placeholder (double-click modal)
        ├── SpacingGuideOverlays.tsx
        ├── LayoutInfo.tsx      # Numeric summary (frame, mat, grid, spacing)
        └── FrameSearch.tsx     # “Find matching frames” + results list
```

---

## 4. Application architecture

- **Entry**: `main.tsx` mounts `App` into `#root` and imports `index.css` (Tailwind).
- **App** (`App.tsx`):
  - On mount, runs `recalcLayout()` from the store once.
  - Layout: header; main flex with **aside** (controls) and **section** (preview + layout info + frame search).
- **State**: Single Zustand store `useFrameStore` in `src/store/useFrameStore.ts`. No router; no global API client beyond `fetch` in `findFrames.ts`.

---

## 5. State (Zustand store)

**File**: `src/store/useFrameStore.ts`

- **Frame**: `frameWidth`, `frameHeight` (mm), `frameThickness`, `frameColor`.
- **Mat**: `matEnabled`, `matOpeningWidth`, `matOpeningHeight`, `matColor`.
- **Images**: `defaultImageWidth`, `defaultImageHeight`, `imageCount`, `images` (array of `ImageItem` with id, width, height, x, y, overrideSize). Per-slot overrides via `setImageOverride` / `resetImageSize`.
- **Layout**: `rowAlignment`, `verticalAlignment`; `gridResult` (`GridLayoutResult` from `gridPacking`); `containerSize` (effective inner size used for layout).
- **UI**: `selectedPaperId`, `showMargins`, `showCenterAxis`, `showSpacingGuides`, `editingImageId`.

**Important actions**: `setFrameSize`, `setMatOpening`, `setDefaultImageSize`, `setImageCount`, `rotateLayout`, `rotateImageSize`, `clampImageCountToFit`, `recalcLayout`. Most setters that affect layout call `recalcLayout()` so the grid and positions stay in sync.

**Layout computation**: `recalcLayout()` uses `computeGridLayout()` from `src/algorithms/gridPacking.ts` to get rows/columns and spacing, then positions each image using `getRowOffsetByWidth` and vertical alignment. Container = mat opening if mat enabled, else frame inner (frame size minus 2× thickness).

---

## 6. Layout planner (core)

- **Algorithm**: `src/algorithms/gridPacking.ts` — `computeGridLayout(imageCount, containerW, containerH, imageWidth, imageHeight)`. Images are fixed size; spacing is computed so the grid fits. Returns `GridLayoutResult` (rows, columns, layout array, spacingH, spacingV, etc.).
- **Constants**: `src/constants/paperSizes.ts` — A/B/C paper sizes in mm, plus `DEFAULT_IMAGE_*`, `DEFAULT_FRAME_THICKNESS`, etc.
- **Types**: `src/types/types.ts` — `ImageItem`, `GridLayoutResult`, `RowAlignment`, `VerticalAlignment`, `PaperSize`, etc.
- **Preview**: `FramePreview` renders frame + mat + `ImageGrid`. `ImageGrid` maps over store `images` and places each with `ImageItem`; double-click opens modal for size override or preview image upload (preview only, not persisted).

---

## 7. Frame search (Gemini + grounding)

End-to-end flow:

1. **UI** (`src/components/FrameSearch.tsx`): “Find matching frames” button. Reads from store: `frameWidth`, `frameHeight`, `matEnabled`, `matOpening*`, `defaultImage*`. Builds payload and calls `fetchFindFrames(payload)`.
2. **Client API** (`src/api/findFrames.ts`): `fetchFindFrames(payload)` POSTs to `/api/find-frames` with `FindFramesPayload`. Returns `FrameSearchResult[]` (title, url, reason, optional widthMm, heightMm).
3. **Vite middleware** (`vite.config.ts`): Plugin `find-frames-api` registers a route `/api/find-frames` (POST only). Reads `process.env.GEMINI_API_KEY` (loaded via `loadEnv` in config). Parses body, validates `frameWidth`/`frameHeight`, builds params (including optional mat/photo dimensions), calls `findFrames(params, apiKey)`, responds with `{ results }` or `{ error }`.
4. **Server logic** (`server/find-frames.ts`): `findFrames(params, apiKey)`:
   - Builds a prompt: target frame size (mm), “photo must fit fully—no trimming”; priority: (1) exact size, (2) smaller frame that still fits photo, (3) next size up. Optional photo/mat context when provided.
   - Calls Gemini REST: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` with `tools: [{ google_search: {} }]` (grounding). No `responseMimeType` (not allowed with Search tool).
   - Parses response text: strip markdown code fences, extract JSON array via regex, parse. Each item: title, url, reason, optional widthMm, heightMm. Only items with valid `http` URL are kept; max 3 results.
   - Returns `FrameSearchResult[]`.

**Env**: `GEMINI_API_KEY` must be set (e.g. in `.env`). Vite’s `loadEnv(mode, process.cwd(), '')` + `Object.assign(process.env, env)` in `vite.config.ts` make it available to the middleware.

**Production**: The `/api/find-frames` route exists only in dev (Vite middleware). For production you’d need a separate backend or serverless function that implements the same request/response contract and calls Gemini.

---

## 8. Key files quick reference

| Purpose                    | File(s) |
| -------------------------- | ------- |
| App shell and layout       | `src/App.tsx` |
| Global state               | `src/store/useFrameStore.ts` |
| Grid layout algorithm      | `src/algorithms/gridPacking.ts` |
| Paper sizes and defaults   | `src/constants/paperSizes.ts` |
| Shared types               | `src/types/types.ts` |
| Frame search (client)      | `src/api/findFrames.ts`, `src/components/FrameSearch.tsx` |
| Frame search (server)      | `server/find-frames.ts`, `vite.config.ts` (middleware) |
| Dev server and env         | `vite.config.ts` |

---

## 9. Build and run

- **Install**: `npm install`
- **Dev**: `npm run dev` (Vite dev server; set `GEMINI_API_KEY` for frame search).
- **Build**: `npm run build` → `tsc -b` then Vite build; output in `dist/`.
- **Preview**: `npm run preview` (serves `dist/`; no `/api/find-frames`).

TypeScript: `tsconfig.json` + `tsconfig.app.json`; `src` is the app. The `server/` folder is imported from `vite.config.ts` and runs in Node when Vite starts (no separate TS build for server).

---

## 10. Configuration

- **Environment**: `.env` in project root; `GEMINI_API_KEY=...`. Not committed (in `.gitignore`). Loaded in Vite config and exposed to middleware as `process.env.GEMINI_API_KEY`.
- **Tailwind**: `tailwind.config.js`, `postcss.config.js`; content from `index.html` and `src/**/*.{ts,tsx}`.

---

This overview should be enough to re-orient in the project, find where each feature lives, and understand the technical choices (single store, Vite middleware for API, Gemini with Search grounding, no trimming in frame search).
