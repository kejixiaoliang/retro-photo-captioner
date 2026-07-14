import { describe, expect, it } from "vitest";
import { fitTextToBanner, splitTextForFit } from "./textFit";

describe("text fitting", () => {
  it("keeps manual line breaks intact", () => {
    expect(splitTextForFit("第一行\n第二行")).toEqual(["第一行", "第二行"]);
  });

  it("reduces font size for long text", () => {
    const result = fitTextToBanner({
      lines: ["这是一行非常非常长的纪念照文字，需要自动缩小到横幅内部"],
      bannerWidth: 720,
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
