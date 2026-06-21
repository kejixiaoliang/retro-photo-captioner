import { applyPhotoFilter } from "./filters";
import { getFontPreset } from "./presets";
import type { ExportSettings, RenderSettings, Size } from "./types";

export interface RenderCompositeOptions {
  canvas?: HTMLCanvasElement;
  image: HTMLImageElement;
  settings: RenderSettings;
  outputScale?: number;
}

export function getOutputSize(source: Size, bannerHeight: number): Size {
  return {
    width: source.width,
    height: source.height + bannerHeight
  };
}

export function getPreviewScale(source: Size, maxWidth: number): number {
  if (source.width <= maxWidth) return 1;
  return Number((maxWidth / source.width).toFixed(4));
}

export function getScaledRenderSettings(settings: RenderSettings, scale: number): RenderSettings {
  if (scale === 1) return settings;

  return {
    banner: {
      ...settings.banner,
      height: Math.max(1, Math.round(settings.banner.height * scale))
    },
    text: {
      ...settings.text,
      fontSize: Math.max(1, Math.round(settings.text.fontSize * scale)),
      letterSpacing: settings.text.letterSpacing * scale,
      verticalOffset: settings.text.verticalOffset * scale
    },
    filter: settings.filter
  };
}

export function splitTextLines(content: string): string[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  while (lines[0] === "") lines.shift();
  while (lines[lines.length - 1] === "") lines.pop();
  return lines.length > 0 ? lines : [""];
}

export function renderCompositeCanvas({ canvas, image, settings, outputScale = 1 }: RenderCompositeOptions) {
  const target = canvas ?? document.createElement("canvas");
  const sourceSize = {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
  const safeScale = Math.max(0.1, Math.min(1, outputScale));
  const scaledSettings = getScaledRenderSettings(settings, safeScale);
  const scaledSourceSize = {
    width: Math.round(sourceSize.width * safeScale),
    height: Math.round(sourceSize.height * safeScale)
  };
  const outputSize = getOutputSize(scaledSourceSize, scaledSettings.banner.height);
  target.width = outputSize.width;
  target.height = outputSize.height;

  const context = target.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.clearRect(0, 0, target.width, target.height);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const imageY = scaledSettings.banner.position === "top" ? scaledSettings.banner.height : 0;
  context.drawImage(image, 0, imageY, scaledSourceSize.width, scaledSourceSize.height);
  const bannerY = scaledSettings.banner.position === "top" ? 0 : scaledSourceSize.height;
  drawBanner(context, target.width, bannerY, scaledSettings);

  if (scaledSettings.filter.applyToBanner) {
    applyPhotoFilter(
      context,
      0,
      0,
      target.width,
      target.height,
      scaledSettings.filter.presetId,
      scaledSettings.filter.strength,
      scaledSettings.filter.grain,
      scaledSettings.filter.vignette
    );
  } else {
    applyPhotoFilter(
      context,
      0,
      imageY,
      scaledSourceSize.width,
      scaledSourceSize.height,
      scaledSettings.filter.presetId,
      scaledSettings.filter.strength,
      scaledSettings.filter.grain,
      scaledSettings.filter.vignette
    );
  }

  return target;
}

export async function exportCanvas(canvas: HTMLCanvasElement, settings: ExportSettings) {
  const mimeType = settings.format === "png" ? "image/png" : "image/jpeg";
  const quality = settings.format === "jpeg" ? settings.jpegQuality : undefined;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) resolve(value);
        else reject(new Error("Unable to export canvas."));
      },
      mimeType,
      quality
    );
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.href = url;
  link.download = `retro-photo-${stamp}.${settings.format === "png" ? "png" : "jpg"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function drawBanner(
  context: CanvasRenderingContext2D,
  width: number,
  y: number,
  settings: RenderSettings
) {
  const { banner, text } = settings;
  context.save();
  context.fillStyle = banner.color;
  context.fillRect(0, y, width, banner.height);

  const lines = splitTextLines(text.content);
  const fontPreset = getFontPreset(text.fontPresetId);
  const lineHeightPx = text.fontSize * text.lineHeight;
  const blockHeight = lineHeightPx * lines.length;
  const startY = y + banner.height / 2 - blockHeight / 2 + text.fontSize * 0.84 + text.verticalOffset;

  context.fillStyle = text.color;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.font = `700 ${text.fontSize}px ${fontPreset.family}`;
  context.shadowColor = "rgba(38, 0, 0, 0.45)";
  context.shadowBlur = text.effect === "aged-print" ? 0.8 : 1.6;
  context.shadowOffsetY = 1;

  lines.forEach((line, index) => {
    if (text.effect === "aged-print") {
      drawAgedTextLine(
        context,
        line,
        width / 2,
        startY + index * lineHeightPx,
        text.letterSpacing,
        banner.color
      );
    } else {
      drawCenteredTextLine(context, line, width / 2, startY + index * lineHeightPx, text.letterSpacing);
    }
  });

  context.restore();
}

function drawAgedTextLine(
  context: CanvasRenderingContext2D,
  line: string,
  centerX: number,
  baselineY: number,
  letterSpacing: number,
  bannerColor: string
) {
  const fontSize = getFontSizeFromCanvasFont(context.font);
  context.save();
  context.lineJoin = "round";
  context.miterLimit = 2;
  context.strokeStyle = "rgba(58, 0, 0, 0.72)";
  context.lineWidth = Math.max(1, fontSize * 0.055);
  drawTextWithMode(context, line, centerX, baselineY, letterSpacing, "stroke");
  drawAgedTextMask(context, line, centerX, baselineY, letterSpacing, fontSize, bannerColor);
  context.restore();
}

function getFontSizeFromCanvasFont(font: string) {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 24;
}

function drawTextWithMode(
  context: CanvasRenderingContext2D,
  line: string,
  centerX: number,
  baselineY: number,
  letterSpacing: number,
  mode: "fill" | "stroke"
) {
  if (letterSpacing === 0 || line.length <= 1) {
    if (mode === "fill") context.fillText(line, centerX, baselineY);
    else context.strokeText(line, centerX, baselineY);
    return;
  }

  const chars = Array.from(line);
  const textWidth =
    chars.reduce((total, char) => total + context.measureText(char).width, 0) +
    letterSpacing * (chars.length - 1);
  let x = centerX - textWidth / 2;
  chars.forEach((char) => {
    if (mode === "fill") context.fillText(char, x, baselineY);
    else context.strokeText(char, x, baselineY);
    x += context.measureText(char).width + letterSpacing;
  });
}

function drawAgedTextMask(
  context: CanvasRenderingContext2D,
  line: string,
  centerX: number,
  baselineY: number,
  letterSpacing: number,
  fontSize: number,
  bannerColor: string
) {
  const width = measureTextLine(context, line, letterSpacing);
  const padding = Math.ceil(fontSize * 0.36);
  const maskWidth = Math.ceil(width + padding * 2);
  const maskHeight = Math.ceil(fontSize * 1.45);
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = Math.max(1, maskWidth);
  maskCanvas.height = Math.max(1, maskHeight);
  const maskContext = maskCanvas.getContext("2d");
  if (!maskContext) return;

  maskContext.font = context.font;
  maskContext.textBaseline = "alphabetic";
  maskContext.textAlign = "left";
  maskContext.lineJoin = "round";
  maskContext.miterLimit = 2;
  maskContext.strokeStyle = "rgba(255, 246, 230, 0.95)";
  maskContext.lineWidth = Math.max(1, fontSize * 0.025);
  maskContext.fillStyle = context.fillStyle;

  const localBaseline = padding + fontSize * 0.92;
  drawTextLineAt(maskContext, line, padding, localBaseline, letterSpacing, "stroke");
  drawTextLineAt(maskContext, line, padding, localBaseline, letterSpacing, "fill");

  erodeTextMask(maskContext, maskWidth, maskHeight, line, fontSize);

  const drawX = centerX - width / 2 - padding;
  const drawY = baselineY - localBaseline;

  context.save();
  context.globalAlpha = 0.97;
  context.drawImage(maskCanvas, drawX, drawY);
  context.globalAlpha = 0.2;
  context.fillStyle = "rgba(255, 255, 255, 0.95)";
  context.globalCompositeOperation = "screen";
  context.drawImage(maskCanvas, drawX - 0.7, drawY - 0.4);
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 0.18;
  context.fillStyle = bannerColor;
  drawTextLineAt(context, line, centerX - width / 2 + 0.5, baselineY + 0.8, letterSpacing, "fill");
  context.restore();
}

function erodeTextMask(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  line: string,
  fontSize: number
) {
  context.save();
  context.globalCompositeOperation = "destination-out";

  const seedBase = Array.from(line).reduce((total, char) => total + char.charCodeAt(0), 0);
  context.fillStyle = "rgba(0, 0, 0, 0.92)";
  const chipCount = Math.max(24, Math.round(line.length * 5.6));
  for (let index = 0; index < chipCount; index += 1) {
    const seed = seedBase + index * 73;
    const x = pseudo(seed, 1) * width;
    const y = pseudo(seed, 2) * height;
    const chipWidth = fontSize * (0.018 + pseudo(seed, 3) * 0.095);
    const chipHeight = fontSize * (0.018 + pseudo(seed, 4) * 0.08);
    context.fillRect(x, y, Math.max(1, chipWidth), Math.max(1, chipHeight));
  }

  context.strokeStyle = "rgba(0, 0, 0, 0.82)";
  context.lineWidth = Math.max(1, fontSize * 0.035);
  context.lineCap = "round";
  const crackCount = Math.max(4, Math.round(line.length * 0.85));
  for (let index = 0; index < crackCount; index += 1) {
    const seed = seedBase + 500 + index * 89;
    const startX = pseudo(seed, 1) * width;
    const startY = pseudo(seed, 2) * height;
    const length = fontSize * (0.36 + pseudo(seed, 3) * 0.9);
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(startX + length * (pseudo(seed, 4) - 0.5), startY + length * 0.2);
    context.lineTo(startX + length * (pseudo(seed, 5) - 0.5), startY + length * 0.42);
    context.stroke();
  }

  context.restore();
}

function drawTextLineAt(
  context: CanvasRenderingContext2D,
  line: string,
  x: number,
  baselineY: number,
  letterSpacing: number,
  mode: "fill" | "stroke"
) {
  if (letterSpacing === 0 || line.length <= 1) {
    if (mode === "fill") context.fillText(line, x, baselineY);
    else context.strokeText(line, x, baselineY);
    return;
  }

  let cursorX = x;
  Array.from(line).forEach((char) => {
    if (mode === "fill") context.fillText(char, cursorX, baselineY);
    else context.strokeText(char, cursorX, baselineY);
    cursorX += context.measureText(char).width + letterSpacing;
  });
}

function measureTextLine(context: CanvasRenderingContext2D, line: string, letterSpacing: number) {
  const chars = Array.from(line);
  return (
    chars.reduce((total, char) => total + context.measureText(char).width, 0) +
    letterSpacing * Math.max(0, chars.length - 1)
  );
}

function pseudo(seed: number, salt: number) {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawCenteredTextLine(
  context: CanvasRenderingContext2D,
  line: string,
  centerX: number,
  baselineY: number,
  letterSpacing: number
) {
  if (letterSpacing === 0 || line.length <= 1) {
    context.fillText(line, centerX, baselineY);
    return;
  }

  const chars = Array.from(line);
  const textWidth = measureTextLine(context, line, letterSpacing);
  let x = centerX - textWidth / 2;
  chars.forEach((char) => {
    context.fillText(char, x, baselineY);
    x += context.measureText(char).width + letterSpacing;
  });
}
