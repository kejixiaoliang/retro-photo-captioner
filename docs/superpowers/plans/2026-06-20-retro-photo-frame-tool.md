# Retro Photo Frame Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React + TypeScript web app that lets users upload a photo, add a deep red top or bottom banner with retro Chinese text, apply vintage filters, and export PNG/JPEG locally.

**Architecture:** React owns editor state and controls. A focused Canvas renderer receives the source image plus typed settings and produces both live preview and full-resolution export. Presets, filter math, and type definitions live in separate small modules.

**Tech Stack:** Vite, React, TypeScript, Canvas 2D API, CSS, lucide-react.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `index.html`: Vite app entry.
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`: TypeScript and Vite config.
- Create `src/main.tsx`: React bootstrap.
- Create `src/App.tsx`: app-level state, layout, upload/export handlers.
- Create `src/components/ControlPanel.tsx`: all editor controls.
- Create `src/components/PreviewCanvas.tsx`: preview canvas lifecycle.
- Create `src/lib/types.ts`: shared settings and preset types.
- Create `src/lib/presets.ts`: text, banner, font, and filter presets.
- Create `src/lib/filters.ts`: image filter functions and grain/vignette overlays.
- Create `src/lib/renderCanvas.ts`: deterministic Canvas composition and export rendering.
- Create `src/styles/app.css`: complete editor styling.
- Create `public/fonts/README.md`: font placement and fallback notes for open-source Chinese fonts.

## Task 1: Scaffold The Vite App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`

- [ ] **Step 1: Create project config**

Create Vite React TypeScript configuration with scripts:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create app entry files**

Create `index.html` with `<div id="root"></div>` and load `/src/main.tsx`. Create `src/main.tsx` using `createRoot(document.getElementById('root')!).render(<App />)`.

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: `node_modules` and `package-lock.json` are created.

## Task 2: Define Types And Presets

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/presets.ts`
- Create: `public/fonts/README.md`

- [ ] **Step 1: Define render types**

Create explicit settings for banner, text, filters, export, and source image state. Use string union types for banner position, export format, font preset IDs, and filter preset IDs.

- [ ] **Step 2: Define defaults and presets**

Add the default commemorative text, deep red banner color, four font presets with CSS font-family fallback stacks, six filter presets, and initial settings.

- [ ] **Step 3: Document font bundling**

Add `public/fonts/README.md` explaining that bundled open-source Chinese fonts can be dropped there and wired through `@font-face`, while the first implementation uses system fallback stacks until font files are added.

## Task 3: Implement Canvas Rendering

**Files:**
- Create: `src/lib/filters.ts`
- Create: `src/lib/renderCanvas.ts`

- [ ] **Step 1: Implement filter math**

Create pixel-level filter helpers for saturation, contrast, warmth, sepia, fade, grayscale, deterministic grain, vignette, and light leak overlays. Each preset should blend by a 0-100 strength value.

- [ ] **Step 2: Implement full-resolution composition**

Create `renderCompositeCanvas(options)` that creates or reuses a canvas, sets width to `image.naturalWidth`, height to `image.naturalHeight + bannerHeight`, draws image and banner in the selected order, applies the selected filter to the photo area, and draws centered multi-line text.

- [ ] **Step 3: Implement export helper**

Create `exportCanvas(canvas, settings)` that uses `toBlob` for PNG/JPEG and downloads the result with a timestamped filename.

## Task 4: Build React UI

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/ControlPanel.tsx`
- Create: `src/components/PreviewCanvas.tsx`
- Create: `src/styles/app.css`

- [ ] **Step 1: Build app state**

Track source image, object URL, render settings, export settings, warning/error text, and preview status in `App.tsx`.

- [ ] **Step 2: Build control panel**

Add upload, preset text insertion, banner position, banner height, banner color, text area, font select, text size, text color, line height, letter spacing, vertical offset, filter preset, filter strength, grain, vignette, export format, JPEG quality, and export button.

- [ ] **Step 3: Build preview canvas**

Render the current composite whenever image or settings change. Keep preview scaled by CSS while canvas pixels remain full resolution.

- [ ] **Step 4: Style the editor**

Create a restrained two-column editor with compact controls, icon buttons where useful, stable dimensions, readable labels, and responsive behavior for narrow screens.

## Task 5: Verify The Tool

**Files:**
- Modify as needed based on verification.

- [ ] **Step 1: Run build**

Run: `npm run build`

Expected: TypeScript build and Vite production build pass.

- [ ] **Step 2: Run dev server**

Run: `npm run dev`

Expected: local URL prints and app loads.

- [ ] **Step 3: Manual verification**

Use the provided reference image or another local image to verify:

- top and bottom banners render,
- output canvas height equals original height plus banner height,
- multi-line text is centered,
- each filter preset visibly changes the photo,
- PNG and JPEG export both download,
- no controls overlap at desktop or narrow widths.

## Self-Review

- Spec coverage: The plan covers upload, banner placement and sizing, multi-line text, font presets and fallbacks, retro filters, full-resolution export, PNG/JPEG, and verification.
- Placeholder scan: No unresolved placeholders are left in the implementation tasks.
- Type consistency: The planned modules share the same settings model through `src/lib/types.ts`.

