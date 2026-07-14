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
