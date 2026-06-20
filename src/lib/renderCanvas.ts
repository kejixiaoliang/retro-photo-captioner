import { applyPhotoFilter } from "./filters";
import { getFontPreset } from "./presets";
import type { ExportSettings, RenderSettings, Size } from "./types";

export interface RenderCompositeOptions {
  canvas?: HTMLCanvasElement;
  image: HTMLImageElement;
  settings: RenderSettings;
}

export function getOutputSize(source: Size, bannerHeight: number): Size {
  return {
    width: source.width,
    height: source.height + bannerHeight
  };
}

export function splitTextLines(content: string): string[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  while (lines[0] === "") lines.shift();
  while (lines[lines.length - 1] === "") lines.pop();
  return lines.length > 0 ? lines : [""];
}

export function renderCompositeCanvas({ canvas, image, settings }: RenderCompositeOptions) {
  const target = canvas ?? document.createElement("canvas");
  const sourceSize = {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
  const outputSize = getOutputSize(sourceSize, settings.banner.height);
  target.width = outputSize.width;
  target.height = outputSize.height;

  const context = target.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.clearRect(0, 0, target.width, target.height);

  const imageY = settings.banner.position === "top" ? settings.banner.height : 0;
  context.drawImage(image, 0, imageY, sourceSize.width, sourceSize.height);
  applyPhotoFilter(
    context,
    0,
    imageY,
    sourceSize.width,
    sourceSize.height,
    settings.filter.presetId,
    settings.filter.strength,
    settings.filter.grain,
    settings.filter.vignette
  );

  const bannerY = settings.banner.position === "top" ? 0 : sourceSize.height;
  drawBanner(context, target.width, bannerY, settings);

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
  context.shadowBlur = 1.6;
  context.shadowOffsetY = 1;

  lines.forEach((line, index) => {
    drawCenteredTextLine(context, line, width / 2, startY + index * lineHeightPx, text.letterSpacing);
  });

  context.restore();
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
  const textWidth =
    chars.reduce((total, char) => total + context.measureText(char).width, 0) +
    letterSpacing * (chars.length - 1);
  let x = centerX - textWidth / 2;
  chars.forEach((char) => {
    context.fillText(char, x, baselineY);
    x += context.measureText(char).width + letterSpacing;
  });
}
