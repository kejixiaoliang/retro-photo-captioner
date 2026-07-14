# Editor Quality Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the retro photo captioner from a working Canvas demo into a more reliable editor with browser-level verification, one-click text fitting, and production-ready style templates.

**Architecture:** Keep the existing React + TypeScript + Canvas structure, but add small focused modules instead of growing the current large files. Browser verification runs against the real Vite app with a generated local sample image. Template and text-fit logic stays deterministic and testable in `src/lib/`.

**Tech Stack:** Vite, React, TypeScript, Canvas 2D API, Vitest, Playwright, CSS, lucide-react.

## Global Constraints

- Keep the app static and local-first; no backend and no server-side image processing.
- Export must render from the original image dimensions, not from the scaled preview.
- The output canvas height must equal `sourceImageHeight + bannerHeight`.
- The original image must not be cropped in export.
- UI should stay a compact editing tool, not a marketing landing page.
- Avoid large unrelated refactors; split files only where the upgrade directly touches them.
- All user-facing Chinese copy must remain valid UTF-8.
- Verification commands for this phase are `npm run test`, `npm run build`, and `npm run verify:browser`.

---

## File Structure

- Modify `package.json`: add browser verification script and Playwright dependency if needed.
- Create `scripts/verify-browser.mjs`: start or connect to the built preview/dev server, exercise the editor, and save screenshots.
- Create `src/lib/textFit.ts`: deterministic text-size fitting for banner width, line count, line height, and letter spacing.
- Create `src/lib/textFit.test.ts`: unit tests for text fitting.
- Modify `src/lib/renderCanvas.ts`: export measuring helpers only if needed by `textFit.ts`.
- Create `src/lib/templates.ts`: named editor templates that return complete render/export setting patches.
- Create `src/lib/templates.test.ts`: template integrity tests.
- Modify `src/lib/types.ts`: add template IDs and optional template metadata types.
- Modify `src/lib/presets.ts`: keep defaults compatible with the new template model.
- Modify `src/components/ControlPanel.tsx`: add template selector and auto-fit action without changing the existing control grouping.
- Modify `src/App.tsx`: wire template application and text auto-fit into app state.
- Modify `src/styles/app.css`: polish compact template controls and keep mobile layout stable.
- Modify `README.md`: document verification and the new editor features.

---

### Task 1: Browser Verification Harness

**Files:**
- Modify: `package.json`
- Create: `scripts/verify-browser.mjs`
- Output: `docs/superpowers/artifacts/editor-quality-upgrade/desktop.png`
- Output: `docs/superpowers/artifacts/editor-quality-upgrade/mobile.png`

**Interfaces:**
- Consumes: existing `npm run dev` Vite server behavior.
- Produces: `npm run verify:browser`, which exits non-zero when the editor fails to load, the upload control is missing, the canvas is blank after image upload, or responsive screenshots cannot be captured.

- [x] **Step 1: Add the browser verification script entry**

Modify `package.json` scripts to include:

```json
"verify:browser": "node scripts/verify-browser.mjs"
```

Add Playwright as a dev-capable dependency only if it is not already available:

```json
"playwright": "latest"
```

- [x] **Step 2: Create a deterministic local sample image and browser check**

Create `scripts/verify-browser.mjs` with these responsibilities:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = path.join(root, "docs", "superpowers", "artifacts", "editor-quality-upgrade");
const port = 5177;
const url = `http://127.0.0.1:${port}`;

function startServer() {
  const child = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    cwd: root,
    shell: true,
    stdio: "pipe"
  });
  return child;
}

async function waitForServer(page) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 1500 });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw new Error(`Vite server did not respond at ${url}`);
}

async function makeSamplePng(page) {
  return page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create sample canvas context");
    const gradient = context.createLinearGradient(0, 0, 900, 600);
    gradient.addColorStop(0, "#d7c6a4");
    gradient.addColorStop(1, "#314f56");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 900, 600);
    context.fillStyle = "#f1e6cf";
    context.fillRect(100, 120, 230, 320);
    context.fillStyle = "#9b2738";
    context.fillRect(520, 160, 210, 260);
    context.fillStyle = "#24353b";
    context.font = "700 48px sans-serif";
    context.fillText("TEST", 360, 320);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
}

async function uploadSample(page) {
  const bytes = await makeSamplePng(page);
  const input = page.locator("input[type=file]");
  await input.setInputFiles({
    name: "browser-verify-sample.png",
    mimeType: "image/png",
    buffer: Buffer.from(bytes)
  });
  await page.locator("canvas.preview-canvas").waitFor({ state: "visible", timeout: 10_000 });
  const hasPixels = await page.locator("canvas.preview-canvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    if (!context || canvas.width === 0 || canvas.height === 0) return false;
    const data = context.getImageData(0, 0, Math.min(20, canvas.width), Math.min(20, canvas.height)).data;
    return Array.from(data).some((value) => value !== 0);
  });
  if (!hasPixels) throw new Error("Preview canvas rendered blank pixels");
}

async function main() {
  await mkdir(artifactDir, { recursive: true });
  const server = startServer();
  const browser = await chromium.launch();
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 980 } });
    await waitForServer(desktop);
    await uploadSample(desktop);
    await desktop.screenshot({ path: path.join(artifactDir, "desktop.png"), fullPage: true });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 920 } });
    await mobile.goto(url, { waitUntil: "domcontentloaded" });
    await uploadSample(mobile);
    await mobile.screenshot({ path: path.join(artifactDir, "mobile.png"), fullPage: true });
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [x] **Step 3: Run verification and confirm the expected failure if Playwright is missing**

Run: `npm run verify:browser`

Expected before dependency install if Playwright is absent: FAIL with module resolution error for `playwright`.

- [x] **Step 4: Install dependencies if needed**

Run: `npm install`

Expected: `package-lock.json` updates and `playwright` is available.

- [x] **Step 5: Run the browser verification**

Run: `npm run verify:browser`

Expected: PASS and screenshots exist at:

```text
docs/superpowers/artifacts/editor-quality-upgrade/desktop.png
docs/superpowers/artifacts/editor-quality-upgrade/mobile.png
```

---

### Task 2: Deterministic Text Auto-Fit

**Files:**
- Create: `src/lib/textFit.ts`
- Create: `src/lib/textFit.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/ControlPanel.tsx`

**Interfaces:**
- Produces: `fitTextToBanner(options: TextFitOptions): TextFitResult`
- Consumes: `RenderSettings`, source image width, banner height, text content, font preset, line height, and letter spacing.

- [x] **Step 1: Write text-fit tests**

Create `src/lib/textFit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fitTextToBanner, splitTextForFit } from "./textFit";

describe("text fitting", () => {
  it("keeps manual line breaks intact", () => {
    expect(splitTextForFit("第一行\n第二行")).toEqual(["第一行", "第二行"]);
  });

  it("reduces font size for long text", () => {
    const result = fitTextToBanner({
      lines: ["这是一行非常非常长的纪念照文字，需要自动缩小到横幅内部"],
      bannerWidth: 480,
      bannerHeight: 96,
      currentFontSize: 42,
      minFontSize: 16,
      maxFontSize: 76,
      lineHeight: 1.18,
      letterSpacing: 1.2,
      averageCharWidthRatio: 0.95
    });

    expect(result.fontSize).toBeLessThan(42);
    expect(result.fits).toBe(true);
  });

  it("keeps a readable minimum when text is too dense", () => {
    const result = fitTextToBanner({
      lines: ["第一行很长很长很长很长", "第二行也很长很长很长很长", "第三行继续很长很长很长很长"],
      bannerWidth: 320,
      bannerHeight: 70,
      currentFontSize: 44,
      minFontSize: 16,
      maxFontSize: 76,
      lineHeight: 1.2,
      letterSpacing: 1,
      averageCharWidthRatio: 0.95
    });

    expect(result.fontSize).toBe(16);
    expect(result.fits).toBe(false);
  });
});
```

- [x] **Step 2: Run the failing test**

Run: `npm run test -- src/lib/textFit.test.ts`

Expected: FAIL because `src/lib/textFit.ts` does not exist yet.

- [x] **Step 3: Implement `textFit.ts`**

Create `src/lib/textFit.ts`:

```ts
export interface TextFitOptions {
  lines: string[];
  bannerWidth: number;
  bannerHeight: number;
  currentFontSize: number;
  minFontSize: number;
  maxFontSize: number;
  lineHeight: number;
  letterSpacing: number;
  averageCharWidthRatio: number;
}

export interface TextFitResult {
  fontSize: number;
  fits: boolean;
}

export function splitTextForFit(content: string): string[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  while (lines[0] === "") lines.shift();
  while (lines[lines.length - 1] === "") lines.pop();
  return lines.length > 0 ? lines : [""];
}

export function fitTextToBanner(options: TextFitOptions): TextFitResult {
  const safeWidth = Math.max(1, options.bannerWidth * 0.9);
  const safeHeight = Math.max(1, options.bannerHeight * 0.76);
  const lineCount = Math.max(1, options.lines.length);
  const longestLine = options.lines.reduce((max, line) => Math.max(max, Array.from(line).length), 0);
  const widthLimitedSize =
    longestLine <= 1
      ? options.maxFontSize
      : (safeWidth - options.letterSpacing * Math.max(0, longestLine - 1)) /
        (longestLine * options.averageCharWidthRatio);
  const heightLimitedSize = safeHeight / (lineCount * options.lineHeight);
  const rawSize = Math.min(options.currentFontSize, options.maxFontSize, widthLimitedSize, heightLimitedSize);
  const fontSize = Math.max(options.minFontSize, Math.floor(rawSize));
  return {
    fontSize,
    fits: fontSize <= rawSize
  };
}
```

- [x] **Step 4: Add auto-fit UI contract**

Modify `ControlPanelProps` in `src/components/ControlPanel.tsx`:

```ts
onAutoFitText: () => void;
```

Add a button near the text controls:

```tsx
<button className="preset-button" type="button" onClick={onAutoFitText}>
  一键适配横幅
</button>
```

- [x] **Step 5: Wire auto-fit in `App.tsx`**

Import:

```ts
import { fitTextToBanner, splitTextForFit } from "./lib/textFit";
```

Add:

```ts
const handleAutoFitText = useCallback(() => {
  if (!image) {
    setStatus("请先上传图片，再自动适配文字。");
    return;
  }

  const result = fitTextToBanner({
    lines: splitTextForFit(settings.text.content),
    bannerWidth: image.naturalWidth || image.width,
    bannerHeight: settings.banner.height,
    currentFontSize: settings.text.fontSize,
    minFontSize: 16,
    maxFontSize: 76,
    lineHeight: settings.text.lineHeight,
    letterSpacing: settings.text.letterSpacing,
    averageCharWidthRatio: 0.95
  });

  setSettings({
    ...settings,
    text: {
      ...settings.text,
      fontSize: result.fontSize
    }
  });
  setStatus(result.fits ? "文字已适配当前横幅。" : "文字较密，已调整到最小可读字号。");
}, [image, settings]);
```

Pass `onAutoFitText={handleAutoFitText}` to `ControlPanel`.

- [x] **Step 6: Verify**

Run: `npm run test`

Expected: all tests pass.

---

### Task 3: Style Templates

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/templates.ts`
- Create: `src/lib/templates.test.ts`
- Modify: `src/components/ControlPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/app.css`

**Interfaces:**
- Produces: `editorTemplates: EditorTemplate[]`
- Produces: `applyTemplateToSettings(settings: RenderSettings, templateId: EditorTemplateId): RenderSettings`

- [x] **Step 1: Add template types**

Modify `src/lib/types.ts`:

```ts
export type EditorTemplateId =
  | "commemorative"
  | "newspaper"
  | "travel"
  | "archive"
  | "redEra";

export interface EditorTemplate {
  id: EditorTemplateId;
  name: string;
  description: string;
  settings: RenderSettings;
}
```

- [x] **Step 2: Write template tests**

Create `src/lib/templates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { editorTemplates, applyTemplateToSettings } from "./templates";
import { initialRenderSettings } from "./presets";

describe("editor templates", () => {
  it("defines five user-facing templates", () => {
    expect(editorTemplates.map((template) => template.id)).toEqual([
      "commemorative",
      "newspaper",
      "travel",
      "archive",
      "redEra"
    ]);
  });

  it("returns a complete render settings object", () => {
    const next = applyTemplateToSettings(initialRenderSettings, "archive");

    expect(next.banner.height).toBeGreaterThan(0);
    expect(next.text.content.length).toBeGreaterThan(0);
    expect(next.filter.presetId).toBe("blackWhiteArchive");
  });

  it("preserves user text when applying a visual template", () => {
    const next = applyTemplateToSettings(
      {
        ...initialRenderSettings,
        text: { ...initialRenderSettings.text, content: "用户自己的文字" }
      },
      "travel"
    );

    expect(next.text.content).toBe("用户自己的文字");
  });
});
```

- [x] **Step 3: Implement templates**

Create `src/lib/templates.ts`:

```ts
import { initialRenderSettings } from "./presets";
import type { EditorTemplate, EditorTemplateId, RenderSettings } from "./types";

export const editorTemplates: EditorTemplate[] = [
  {
    id: "commemorative",
    name: "纪念合影",
    description: "深红横幅、宋体题字、正式纪念照质感",
    settings: initialRenderSettings
  },
  {
    id: "newspaper",
    name: "老报纸档案",
    description: "仿宋文字、轻微褪色、纸张颗粒",
    settings: {
      ...initialRenderSettings,
      banner: { position: "bottom", height: 120, color: "#6d1014" },
      text: { ...initialRenderSettings.text, fontPresetId: "old-fangsong", fontSize: 32 },
      filter: { presetId: "fadedAlbum", strength: 70, grain: 22, vignette: 12, applyToBanner: true }
    }
  },
  {
    id: "travel",
    name: "旅行留念",
    description: "楷体题字、暖色胶片、轻微漏光",
    settings: {
      ...initialRenderSettings,
      banner: { position: "bottom", height: 112, color: "#7b1518" },
      text: { ...initialRenderSettings.text, fontPresetId: "kai-travel", fontSize: 34 },
      filter: { presetId: "filmTravel", strength: 68, grain: 12, vignette: 10, applyToBanner: false }
    }
  },
  {
    id: "archive",
    name: "黑白档案",
    description: "黑白影调、档案颗粒、克制红幅",
    settings: {
      ...initialRenderSettings,
      banner: { position: "top", height: 104, color: "#4f0b10" },
      text: { ...initialRenderSettings.text, fontPresetId: "solemn-song", fontSize: 29 },
      filter: { presetId: "blackWhiteArchive", strength: 82, grain: 28, vignette: 26, applyToBanner: true }
    }
  },
  {
    id: "redEra",
    name: "红色年代",
    description: "浓红横幅、厚重暗角、年代纪念册气质",
    settings: {
      ...initialRenderSettings,
      banner: { position: "top", height: 126, color: "#8c0715" },
      text: { ...initialRenderSettings.text, fontPresetId: "aged-song", fontSize: 34 },
      filter: { presetId: "redEra", strength: 78, grain: 18, vignette: 30, applyToBanner: true }
    }
  }
];

export function applyTemplateToSettings(settings: RenderSettings, templateId: EditorTemplateId): RenderSettings {
  const template = editorTemplates.find((candidate) => candidate.id === templateId) ?? editorTemplates[0];
  return {
    ...template.settings,
    text: {
      ...template.settings.text,
      content: settings.text.content
    }
  };
}
```

- [x] **Step 4: Add template selector to controls**

Modify `ControlPanelProps`:

```ts
activeTemplateId: EditorTemplateId;
onTemplateChange: (templateId: EditorTemplateId) => void;
```

Add a template section above banner controls:

```tsx
<section className="panel-section">
  <h2>
    <Sparkles aria-hidden="true" />
    模板
  </h2>
  <div className="template-grid">
    {editorTemplates.map((template) => (
      <button
        key={template.id}
        className={activeTemplateId === template.id ? "active" : ""}
        type="button"
        onClick={() => onTemplateChange(template.id)}
      >
        <span>{template.name}</span>
        <small>{template.description}</small>
      </button>
    ))}
  </div>
</section>
```

- [x] **Step 5: Wire templates in `App.tsx`**

Add state:

```ts
const [activeTemplateId, setActiveTemplateId] = useState<EditorTemplateId>("commemorative");
```

Add handler:

```ts
const handleTemplateChange = useCallback((templateId: EditorTemplateId) => {
  setSettings((current) => applyTemplateToSettings(current, templateId));
  setActiveTemplateId(templateId);
  setStatus("模板已应用，原有文案已保留。");
}, []);
```

- [x] **Step 6: Style template grid**

Add to `src/styles/app.css`:

```css
.template-grid {
  display: grid;
  gap: 8px;
}

.template-grid button {
  display: grid;
  gap: 4px;
  min-height: 54px;
  padding: 9px 10px;
  border: 1px solid rgba(70, 55, 44, 0.16);
  border-radius: 7px;
  background: #fffaf1;
  color: #42302a;
  text-align: left;
}

.template-grid button.active {
  border-color: rgba(120, 5, 18, 0.7);
  background: #780512;
  color: #fff8ef;
}

.template-grid small {
  color: inherit;
  opacity: 0.74;
  font-size: 12px;
  line-height: 1.35;
}
```

- [x] **Step 7: Verify**

Run: `npm run test`

Expected: all tests pass.

---

### Task 4: README And Final Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: completed features from Tasks 1-3.
- Produces: project documentation that describes browser verification, templates, and auto-fit.

- [x] **Step 1: Update feature list**

Add these English feature bullets:

```md
- One-click text fitting for dense captions.
- Style templates for commemorative, newspaper, travel, archive, and red-era looks.
- Browser verification screenshots for desktop and mobile layouts.
```

Add matching Chinese bullets:

```md
- 一键适配较长横幅文字。
- 提供纪念合影、老报纸、旅行留念、黑白档案、红色年代等模板。
- 提供桌面端和移动端浏览器截图验证。
```

- [x] **Step 2: Document verification**

Add:

```md
### Verification

```bash
npm run test
npm run build
npm run verify:browser
```
```

- [x] **Step 3: Run full verification**

Run:

```bash
npm run test
npm run build
npm run verify:browser
```

Expected: all commands pass.

- [x] **Step 4: Review git diff**

Run: `git diff --stat`

Expected: changes are limited to the files listed in this plan.

---

## Self-Review

- Spec coverage: This plan covers the agreed first-stage upgrade: browser visual verification, text auto-fit, and templates.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: `EditorTemplateId`, `EditorTemplate`, `fitTextToBanner`, `splitTextForFit`, and script names are introduced before use.
- Scope check: The phase intentionally excludes batch processing, project saving, drag editing, and font bundling.
