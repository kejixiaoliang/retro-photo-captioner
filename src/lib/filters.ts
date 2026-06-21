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
  blackLift: number;
  highlightRollOff: number;
  paperTint: number;
  scratches: number;
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
  lightLeak: 0,
  blackLift: 0,
  highlightRollOff: 0,
  paperTint: 0,
  scratches: 0
};

export const filterPresets: Record<FilterPresetId, FilterParams> = {
  period: {
    saturation: 0.9,
    contrast: 1.04,
    brightness: 0.99,
    warmth: 7,
    sepia: 0.05,
    fade: 0.03,
    grayscale: 0,
    grain: 0.045,
    vignette: 0.1,
    lightLeak: 0,
    blackLift: 0.04,
    highlightRollOff: 0.06,
    paperTint: 0.06,
    scratches: 0.02
  },
  realOldPhoto: {
    saturation: 0.72,
    contrast: 0.9,
    brightness: 1.03,
    warmth: 22,
    sepia: 0.25,
    fade: 0.16,
    grayscale: 0.03,
    grain: 0.09,
    vignette: 0.22,
    lightLeak: 0.03,
    blackLift: 0.11,
    highlightRollOff: 0.16,
    paperTint: 0.2,
    scratches: 0.16
  },
  filmTravel: {
    saturation: 0.94,
    contrast: 1.02,
    brightness: 1.03,
    warmth: 14,
    sepia: 0.06,
    fade: 0.04,
    grayscale: 0,
    grain: 0.04,
    vignette: 0.07,
    lightLeak: 0.12,
    blackLift: 0.03,
    highlightRollOff: 0.05,
    paperTint: 0.04,
    scratches: 0.01
  },
  blackWhiteArchive: {
    saturation: 0.05,
    contrast: 1.02,
    brightness: 0.98,
    warmth: 0,
    sepia: 0.02,
    fade: 0.1,
    grayscale: 0.9,
    grain: 0.08,
    vignette: 0.18,
    lightLeak: 0,
    blackLift: 0.1,
    highlightRollOff: 0.12,
    paperTint: 0.08,
    scratches: 0.08
  },
  fadedAlbum: {
    saturation: 0.76,
    contrast: 0.84,
    brightness: 1.04,
    warmth: 12,
    sepia: 0.12,
    fade: 0.22,
    grayscale: 0.02,
    grain: 0.05,
    vignette: 0.09,
    lightLeak: 0.05,
    blackLift: 0.13,
    highlightRollOff: 0.18,
    paperTint: 0.18,
    scratches: 0.06
  },
  redEra: {
    saturation: 0.82,
    contrast: 1.08,
    brightness: 0.98,
    warmth: 10,
    sepia: 0.08,
    fade: 0.04,
    grayscale: 0,
    grain: 0.06,
    vignette: 0.18,
    lightLeak: 0,
    blackLift: 0.04,
    highlightRollOff: 0.07,
    paperTint: 0.07,
    scratches: 0.04
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
    lightLeak: blend(neutralParams.lightLeak, preset.lightLeak),
    blackLift: blend(neutralParams.blackLift, preset.blackLift),
    highlightRollOff: blend(neutralParams.highlightRollOff, preset.highlightRollOff),
    paperTint: blend(neutralParams.paperTint, preset.paperTint),
    scratches: blend(neutralParams.scratches, preset.scratches)
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
  params.grain = Math.max(params.grain, grainBoost / 520);
  params.vignette = Math.max(params.vignette, vignetteBoost / 160);

  const imageData = context.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    let red = data[index];
    let green = data[index + 1];
    let blue = data[index + 2];

    let luminance = red * 0.299 + green * 0.587 + blue * 0.114;
    red = luminance + (red - luminance) * params.saturation;
    green = luminance + (green - luminance) * params.saturation;
    blue = luminance + (blue - luminance) * params.saturation;

    red = applyFilmicTone(red, params);
    green = applyFilmicTone(green, params);
    blue = applyFilmicTone(blue, params);

    red = (red - 128) * params.contrast + 128;
    green = (green - 128) * params.contrast + 128;
    blue = (blue - 128) * params.contrast + 128;

    luminance = red * 0.299 + green * 0.587 + blue * 0.114;
    const midtone = 1 - Math.abs(luminance / 255 - 0.52) * 1.7;
    const warmAmount = params.warmth * Math.max(0, midtone);
    red = red * params.brightness + warmAmount;
    green = green * params.brightness + warmAmount * 0.28;
    blue = blue * params.brightness - warmAmount * 0.18;

    const sepiaRed = red * 0.393 + green * 0.769 + blue * 0.189;
    const sepiaGreen = red * 0.349 + green * 0.686 + blue * 0.168;
    const sepiaBlue = red * 0.272 + green * 0.534 + blue * 0.131;
    red = red + (sepiaRed - red) * params.sepia;
    green = green + (sepiaGreen - green) * params.sepia;
    blue = blue + (sepiaBlue - blue) * params.sepia;

    const paperRed = 238 + params.paperTint * 22;
    const paperGreen = 224 + params.paperTint * 14;
    const paperBlue = 194 - params.paperTint * 26;
    red = red + (paperRed - red) * params.fade;
    green = green + (paperGreen - green) * params.fade;
    blue = blue + (paperBlue - blue) * params.fade;

    const gray = red * 0.299 + green * 0.587 + blue * 0.114;
    red = red + (gray - red) * params.grayscale;
    green = green + (gray - green) * params.grayscale;
    blue = blue + (gray - blue) * params.grayscale;

    data[index] = clampColor(red);
    data[index + 1] = clampColor(green);
    data[index + 2] = clampColor(blue);
  }

  context.putImageData(imageData, x, y);
  drawPaperTint(context, x, y, width, height, params.paperTint);
  drawFineGrain(context, x, y, width, height, params.grain);
  drawDustAndScratches(context, x, y, width, height, params.scratches);
  drawVignette(context, x, y, width, height, params.vignette);
  drawLightLeak(context, x, y, width, height, params.lightLeak);
}

function applyFilmicTone(value: number, params: FilterParams) {
  const normalized = Math.max(0, Math.min(1, value / 255));
  const lifted = normalized + (1 - normalized) * params.blackLift * 0.55;
  const rolled = lifted - Math.max(0, lifted - 0.72) * params.highlightRollOff * 0.58;
  const curved = rolled * rolled * (3 - 2 * rolled);
  return curved * 255;
}

function noise01(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function clampColor(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function drawPaperTint(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;

  context.save();
  context.globalCompositeOperation = "soft-light";
  context.fillStyle = `rgba(232, 203, 150, ${Math.min(0.18, amount * 0.5)})`;
  context.fillRect(x, y, width, height);
  context.restore();
}

function drawFineGrain(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;

  const grainCanvas = document.createElement("canvas");
  const grainScale = 0.45;
  grainCanvas.width = Math.max(1, Math.round(width * grainScale));
  grainCanvas.height = Math.max(1, Math.round(height * grainScale));
  const grainContext = grainCanvas.getContext("2d");
  if (!grainContext) return;

  const imageData = grainContext.createImageData(grainCanvas.width, grainCanvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const pixel = index / 4;
    const px = pixel % grainCanvas.width;
    const py = Math.floor(pixel / grainCanvas.width);
    const value = 118 + (noise01(px, py) - 0.5) * 74;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  }
  grainContext.putImageData(imageData, 0, 0);

  context.save();
  context.globalAlpha = Math.min(0.14, amount * 0.7);
  context.globalCompositeOperation = "overlay";
  context.imageSmoothingEnabled = false;
  context.drawImage(grainCanvas, x, y, width, height);
  context.restore();
}

function drawDustAndScratches(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;

  context.save();
  context.globalAlpha = Math.min(0.2, amount * 0.9);
  context.globalCompositeOperation = "screen";
  context.strokeStyle = "rgba(255, 239, 207, 0.9)";
  context.lineWidth = Math.max(0.6, width / 1800);

  const scratchCount = Math.round(2 + amount * 16);
  for (let index = 0; index < scratchCount; index += 1) {
    const sx = x + noise01(index * 17, 4) * width;
    const sy = y + noise01(index * 11, 8) * height;
    const length = height * (0.12 + noise01(index * 23, 9) * 0.32);
    context.beginPath();
    context.moveTo(sx, sy);
    context.bezierCurveTo(
      sx + width * 0.006,
      sy + length * 0.3,
      sx - width * 0.004,
      sy + length * 0.7,
      sx + width * 0.002,
      sy + length
    );
    context.stroke();
  }

  context.fillStyle = "rgba(255, 242, 219, 0.75)";
  const dustCount = Math.round(amount * 120);
  for (let index = 0; index < dustCount; index += 1) {
    const dx = x + noise01(index * 31, 2) * width;
    const dy = y + noise01(index * 37, 3) * height;
    const radius = 0.35 + noise01(index * 41, 5) * 1.2;
    context.beginPath();
    context.arc(dx, dy, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
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
