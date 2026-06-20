# Retro Photo Frame Tool Design

## Goal

Build a pure frontend image processing web tool for creating retro Chinese commemorative photos. Users upload one image, add a deep red banner to the top or bottom edge, type multi-line Chinese text into that banner, apply vintage-style filters, and export the final image.

The tool is intentionally semi-automatic. It provides presets and defaults, but users control the final text, banner height, font style, text size, line breaks, and filter strength.

## Product Scope

### In Scope

- Upload a single local image.
- Add a banner above or below the original image.
- Keep the original image uncut and unscaled in the exported result.
- Increase the final canvas height by the banner height.
- Edit one multi-line text field.
- Provide one-click preset text inserted into the text field:

```text
公元二零二六年，某某某同志、某某某同志游黄山
某某某（左）、某某某（右）
```

- Adjust banner position, banner height, banner color, font, text size, text color, line height, letter spacing, and text vertical padding.
- Provide several built-in open-source Chinese font options with system font fallbacks.
- Provide multiple retro filter presets with a shared strength control.
- Export PNG or JPEG from the browser.

### Out of Scope For Version 1

- AI-generated copy.
- Face detection or automatic left/right person labeling.
- Batch processing.
- Project saving or history.
- Dragging text directly on the canvas.
- User-uploaded fonts.
- Server-side image processing.

## Framework

Use Vite, React, TypeScript, and the Canvas 2D API.

This keeps the app static and local-first. React manages UI state and control panels. Canvas performs deterministic preview and export rendering. TypeScript keeps render settings, presets, and filter definitions explicit.

Recommended dependencies:

- `vite`
- `react`
- `react-dom`
- `typescript`
- `lucide-react`

No backend is required.

## User Interface

The app uses a desktop-first two-column editor layout.

The left side is a control panel with grouped controls:

1. Image upload
2. Banner settings
3. Text settings
4. Style and filter settings
5. Export settings

The right side is a live preview area showing the composed image on a responsive canvas. The preview may be scaled down to fit the viewport, but export uses the full-resolution source image plus the selected banner height.

The interface should feel like a practical editing tool rather than a marketing landing page. It should prioritize clear controls, compact grouping, and immediate visual feedback.

## Rendering Model

The exported canvas dimensions are:

```text
outputWidth = sourceImageWidth
outputHeight = sourceImageHeight + bannerHeight
```

If the banner is on top:

1. Draw banner background at `y = 0`.
2. Draw centered multi-line text inside the banner.
3. Draw the original image at `y = bannerHeight`.

If the banner is on bottom:

1. Draw the original image at `y = 0`.
2. Draw banner background at `y = sourceImageHeight`.
3. Draw centered multi-line text inside the banner.

The original image is not cropped or resized in export.

## Text Model

Text is a single user-editable multi-line string. Users control line breaks manually. The renderer splits on newline characters and draws each line centered horizontally.

Text settings:

- Font preset
- Font size
- Text color
- Line height
- Letter spacing
- Vertical padding or vertical offset

The default text style should approximate the reference image: white or slightly warm off-white Chinese title text on a deep red banner, with a formal retro commemorative feeling.

## Font Presets

Version 1 should include built-in open-source Chinese fonts where licensing allows local bundling, plus system fallbacks.

Initial style categories:

- Solemn Song style: default, formal commemorative look.
- Old newspaper Fangsong style: archival and printed.
- Kai calligraphy style: warmer travel keepsake feeling.
- Handwritten old-photo style: more personal and casual.
- System fallback: Songti, Fangsong, Kaiti, serif.

Fonts should be loaded from `public/fonts/` using `@font-face`.

## Filter Presets

Each preset maps to internal parameters such as saturation, contrast, warmth, sepia, grain, vignette, fade, and red-banner treatment. A global strength slider blends the preset from neutral to full effect.

Initial presets:

- Period commemorative photo: default, formal, slightly desaturated, firmer contrast.
- Real old photo: yellowed, faded, grain, vignette.
- Film travel photo: warm, soft, light leak feeling.
- Black-and-white archive: grayscale, grain, slightly faded.
- Faded album: low contrast, washed color, old paper feeling.
- Red-era commemorative: stronger red banner and heavier commemorative mood.

## Export

Users can export:

- PNG for lossless output.
- JPEG with adjustable quality.

Export should render from the original image dimensions, not from the scaled preview.

## Error Handling

Handle these states clearly:

- No image uploaded.
- Unsupported file type.
- Image load failure.
- Font still loading.
- Very large image warning when canvas size may affect performance.

The app should keep the previous valid state when possible instead of clearing user work after minor errors.

## Testing And Verification

Minimum verification for version 1:

- Upload an image and confirm preview renders.
- Switch banner top and bottom.
- Confirm exported dimensions equal original image height plus banner height.
- Confirm multi-line text draws centered.
- Confirm each filter preset changes the image visibly.
- Confirm PNG and JPEG export both produce downloadable images.
- Run a production build.

If browser verification tooling is available, verify the live editor at desktop and mobile-ish widths and capture screenshots to confirm no text/control overlap.

## Proposed File Structure

```text
src/
  App.tsx
  components/
    ControlPanel.tsx
    PreviewCanvas.tsx
  lib/
    filters.ts
    presets.ts
    renderCanvas.ts
    types.ts
  styles/
    app.css
public/
  fonts/
docs/
  superpowers/
    specs/
      2026-06-20-retro-photo-frame-tool-design.md
```

