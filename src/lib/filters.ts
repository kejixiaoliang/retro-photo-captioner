import type { FilterPresetId } from "./types";

export interface FilterParams {
  saturation: number;
  contrast: number;
  brightness: number;
  warmth: number;
  sepia: number;
  fade: number;
  grayscale: number;
  grain: number;
  vignette: number;
  lightLeak: number;
}

const neutralParams: FilterParams = {
  saturation: 1,
  contrast: 1,
  brightness: 1,
  warmth: 0,
  sepia: 0,
  fade: 0,
  grayscale: 0,
  grain: 0,
  vignette: 0,
  lightLeak: 0
};

export const filterPresets: Record<FilterPresetId, FilterParams> = {
  period: {
    saturation: 0.82,
    contrast: 1.12,
    brightness: 0.98,
    warmth: 10,
    sepia: 0.08,
    fade: 0.05,
    grayscale: 0,
    grain: 0.12,
    vignette: 0.18,
    lightLeak: 0
  },
  realOldPhoto: {
    saturation: 0.56,
    contrast: 0.92,
    brightness: 1.04,
    warmth: 34,
    sepia: 0.42,
    fade: 0.18,
    grayscale: 0.05,
    grain: 0.28,
    vignette: 0.35,
    lightLeak: 0.05
  },
  filmTravel: {
    saturation: 0.9,
    contrast: 1.05,
    brightness: 1.04,
    warmth: 22,
    sepia: 0.12,
    fade: 0.08,
    grayscale: 0,
    grain: 0.1,
    vignette: 0.12,
    lightLeak: 0.22
  },
  blackWhiteArchive: {
    saturation: 0.05,
    contrast: 1.08,
    brightness: 0.96,
    warmth: 0,
    sepia: 0.02,
    fade: 0.14,
    grayscale: 0.92,
    grain: 0.24,
    vignette: 0.25,
    lightLeak: 0
  },
  fadedAlbum: {
    saturation: 0.62,
    contrast: 0.78,
    brightness: 1.08,
    warmth: 18,
    sepia: 0.18,
    fade: 0.28,
    grayscale: 0.02,
    grain: 0.14,
    vignette: 0.16,
    lightLeak: 0.08
  },
  redEra: {
    saturation: 0.72,
    contrast: 1.18,
    brightness: 0.96,
    warmth: 16,
    sepia: 0.16,
    fade: 0.04,
    grayscale: 0,
    grain: 0.18,
    vignette: 0.28,
    lightLeak: 0
  }
};

export function blendFilterParams(preset: FilterParams, strength: number): FilterParams {
  const amount = Math.max(0, Math.min(100, strength)) / 100;
  const blend = (neutral: number, target: number) => neutral + (target - neutral) * amount;

  return {
    saturation: blend(neutralParams.saturation, preset.saturation),
    contrast: blend(neutralParams.contrast, preset.contrast),
    brightness: blend(neutralParams.brightness, preset.brightness),
    warmth: blend(neutralParams.warmth, preset.warmth),
    sepia: blend(neutralParams.sepia, preset.sepia),
    fade: blend(neutralParams.fade, preset.fade),
    grayscale: blend(neutralParams.grayscale, preset.grayscale),
    grain: blend(neutralParams.grain, preset.grain),
    vignette: blend(neutralParams.vignette, preset.vignette),
    lightLeak: blend(neutralParams.lightLeak, preset.lightLeak)
  };
}

export function applyPhotoFilter(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  presetId: FilterPresetId,
  strength: number,
  grainBoost: number,
  vignetteBoost: number
) {
  const preset = filterPresets[presetId];
  const params = blendFilterParams(preset, strength);
  params.grain = Math.max(params.grain, grainBoost / 100);
  params.vignette = Math.max(params.vignette, vignetteBoost / 100);

  const imageData = context.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    let red = data[index];
    let green = data[index + 1];
    let blue = data[index + 2];

    const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
    red = luminance + (red - luminance) * params.saturation;
    green = luminance + (green - luminance) * params.saturation;
    blue = luminance + (blue - luminance) * params.saturation;

    red = (red - 128) * params.contrast + 128;
    green = (green - 128) * params.contrast + 128;
    blue = (blue - 128) * params.contrast + 128;

    red *= params.brightness;
    green *= params.brightness;
    blue *= params.brightness;

    red += params.warmth;
    green += params.warmth * 0.35;
    blue -= params.warmth * 0.2;

    const sepiaRed = red * 0.393 + green * 0.769 + blue * 0.189;
    const sepiaGreen = red * 0.349 + green * 0.686 + blue * 0.168;
    const sepiaBlue = red * 0.272 + green * 0.534 + blue * 0.131;
    red = red + (sepiaRed - red) * params.sepia;
    green = green + (sepiaGreen - green) * params.sepia;
    blue = blue + (sepiaBlue - blue) * params.sepia;

    red = red + (232 - red) * params.fade;
    green = green + (218 - green) * params.fade;
    blue = blue + (188 - blue) * params.fade;

    const gray = red * 0.299 + green * 0.587 + blue * 0.114;
    red = red + (gray - red) * params.grayscale;
    green = green + (gray - green) * params.grayscale;
    blue = blue + (gray - blue) * params.grayscale;

    const pixel = index / 4;
    const grain = ((Math.sin(pixel * 12.9898) * 43758.5453) % 1) * 255 - 127;
    red += grain * params.grain;
    green += grain * params.grain;
    blue += grain * params.grain;

    data[index] = clampColor(red);
    data[index + 1] = clampColor(green);
    data[index + 2] = clampColor(blue);
  }

  context.putImageData(imageData, x, y);
  drawVignette(context, x, y, width, height, params.vignette);
  drawLightLeak(context, x, y, width, height, params.lightLeak);
}

function clampColor(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function drawVignette(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;

  const gradient = context.createRadialGradient(
    x + width / 2,
    y + height / 2,
    Math.min(width, height) * 0.18,
    x + width / 2,
    y + height / 2,
    Math.max(width, height) * 0.72
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(34, 18, 10, ${Math.min(0.55, amount)})`);
  context.save();
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
  context.restore();
}

function drawLightLeak(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;

  const gradient = context.createLinearGradient(x, y, x + width * 0.4, y + height * 0.25);
  gradient.addColorStop(0, `rgba(255, 146, 72, ${amount * 0.38})`);
  gradient.addColorStop(1, "rgba(255, 146, 72, 0)");
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
  context.restore();
}
