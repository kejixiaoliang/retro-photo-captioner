# Retro Photo Captioner

**Language:** [English](#english) | [中文](#中文)

---

## English

Retro Photo Captioner is a local-first web editor for creating Chinese retro commemorative photos. It helps you upload a photo, add a deep-red caption banner, apply period-style photo filters, and export a finished PNG or JPEG directly in the browser.

The project is designed as a practical editing tool rather than a landing page: all controls are visible, the preview updates in real time, and image processing stays on your device.

[Switch to 中文](#中文)

### Highlights

- Local browser-only image processing powered by Canvas.
- Click, drag-and-drop, or paste an image into the upload panel or empty preview area.
- Top or bottom red banner without cropping the original photo.
- Editable multi-line Chinese caption text.
- Default caption preset for commemorative group photos.
- One-click text fitting for dense captions.
- Retro font presets with system fallbacks.
- Style templates: commemorative, newspaper, travel, archive, and red-era looks.
- Vintage filter controls for strength, grain, vignette, and banner coverage.
- PNG and JPEG export, including JPEG quality control.
- Browser verification screenshots for empty, desktop, and mobile states.

### Product Flow

1. Upload a local image from the side panel or the empty preview area.
2. Choose a visual template or tune the banner, typography, and filters manually.
3. Edit the caption text and use one-click fitting when the text is too dense.
4. Preview the composed photo in real time.
5. Export the final result as PNG or JPEG.

### Default Caption

```text
公元二零二六年，某某某、某某某于某某地方合影留念
某某某（左）、某某某（右）
```

### Tech Stack

- Vite
- React
- TypeScript
- Canvas 2D API
- Vitest
- Playwright
- lucide-react

### Project Structure

```text
src/
  App.tsx
  components/
    ControlPanel.tsx
    PreviewCanvas.tsx
  lib/
    filters.ts
    imageFiles.ts
    presets.ts
    renderCanvas.ts
    templates.ts
    textFit.ts
    types.ts
  styles/
    app.css
scripts/
  verify-browser.mjs
docs/
  superpowers/
    artifacts/
    plans/
public/
  fonts/
```

### Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

### Verification

Run unit tests:

```bash
npm run test
```

Run the production build:

```bash
npm run build
```

Run browser verification:

```bash
npm run verify:browser
```

The browser verification script opens the app, captures the empty upload state, uploads a generated sample image through the empty preview area, verifies that the canvas renders non-empty pixels, and saves desktop and mobile screenshots.

### Verification Artifacts

Generated screenshots are saved under:

```text
docs/superpowers/artifacts/editor-quality-upgrade/
```

Current artifacts:

- `empty.png`
- `desktop.png`
- `mobile.png`

### Notes

- No backend is required.
- Uploaded photos are processed locally in the browser.
- The exported canvas preserves the original image width and adds banner height without cropping the image.
- Font files can be added later under `public/fonts/` and wired through `@font-face`.

---

## 中文

复古纪念照框幅工具是一个本地优先的网页编辑器，用来快速制作中文复古纪念照。你可以上传一张照片，添加深红色纪念横幅，输入中文题字，套用老照片滤镜，并直接在浏览器中导出 PNG 或 JPEG 成图。

这个项目的定位不是展示型落地页，而是一个实用编辑工具：核心控件直接可见，预览实时更新，所有图片处理都在本机浏览器里完成。

[Switch to English](#english)

### 功能亮点

- 使用 Canvas 在浏览器本地完成图片处理。
- 支持从左侧上传区或右侧空预览区点击上传、拖拽上传、Ctrl+V 粘贴上传。
- 支持在原图上方或下方添加深红色横幅，不裁切原图。
- 支持编辑多行中文纪念文字。
- 内置合影留念默认文案。
- 支持一键适配较长横幅文字。
- 提供复古字体预设，并保留系统字体兜底。
- 提供纪念合影、老报纸档案、旅行留念、黑白档案、红色年代等模板。
- 支持调节滤镜强度、颗粒、暗角，以及是否覆盖横幅。
- 支持导出 PNG 和 JPEG，并可调节 JPEG 质量。
- 提供空状态、桌面端、移动端浏览器截图验证。

### 使用流程

1. 从左侧上传区或右侧空预览区上传本地图片。
2. 选择一个视觉模板，或手动调节横幅、字体和滤镜。
3. 编辑纪念文字，文字较密时使用一键适配。
4. 在右侧实时预览合成效果。
5. 将最终成图导出为 PNG 或 JPEG。

### 默认文案

```text
公元二零二六年，某某某、某某某于某某地方合影留念
某某某（左）、某某某（右）
```

### 技术栈

- Vite
- React
- TypeScript
- Canvas 2D API
- Vitest
- Playwright
- lucide-react

### 项目结构

```text
src/
  App.tsx
  components/
    ControlPanel.tsx
    PreviewCanvas.tsx
  lib/
    filters.ts
    imageFiles.ts
    presets.ts
    renderCanvas.ts
    templates.ts
    textFit.ts
    types.ts
  styles/
    app.css
scripts/
  verify-browser.mjs
docs/
  superpowers/
    artifacts/
    plans/
public/
  fonts/
```

### 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

### 验证命令

运行单元测试：

```bash
npm run test
```

运行生产构建：

```bash
npm run build
```

运行浏览器验证：

```bash
npm run verify:browser
```

浏览器验证脚本会打开应用，截取空上传状态，通过右侧空预览区上传一张脚本生成的样图，确认 Canvas 渲染出非空像素，并保存桌面端和移动端截图。

### 验证产物

截图会保存在：

```text
docs/superpowers/artifacts/editor-quality-upgrade/
```

当前产物：

- `empty.png`
- `desktop.png`
- `mobile.png`

### 说明

- 项目不需要后端服务。
- 上传图片只在浏览器本地处理。
- 导出画布会保留原图宽度，并在高度方向增加横幅区域，不裁切原图。
- 后续可以将授权可用的中文字体文件放入 `public/fonts/`，再通过 `@font-face` 接入。
