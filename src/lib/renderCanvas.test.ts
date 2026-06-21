import { describe, expect, it } from "vitest";
import { getOutputSize, getPreviewScale, getScaledRenderSettings, splitTextLines } from "./renderCanvas";

describe("renderCanvas helpers", () => {
  it("adds banner height to the source image height without changing width", () => {
    expect(getOutputSize({ width: 800, height: 600 }, 120)).toEqual({
      width: 800,
      height: 720
    });
  });

  it("keeps user-authored line breaks and drops empty edge lines", () => {
    expect(splitTextLines("\n第一行\n第二行\n")).toEqual(["第一行", "第二行"]);
  });

  it("keeps preview scale at one when the source is below the preview cap", () => {
    expect(getPreviewScale({ width: 1200, height: 800 }, 1600)).toBe(1);
  });

  it("calculates a fractional preview scale when the source exceeds the preview cap", () => {
    expect(getPreviewScale({ width: 4000, height: 2600 }, 1600)).toBe(0.4);
  });

  it("scales banner and text settings for preview rendering", () => {
    const settings = getScaledRenderSettings(
      {
        banner: { position: "top", height: 120, color: "#780512" },
        text: {
          content: "测试文字",
          fontPresetId: "aged-song",
          fontSize: 40,
          color: "#fff7ee",
          lineHeight: 1.1,
          letterSpacing: 2,
          verticalOffset: 4,
          effect: "aged-print"
        },
        filter: { presetId: "period", strength: 50, grain: 10, vignette: 10 }
      },
      0.5
    );

    expect(settings.banner.height).toBe(60);
    expect(settings.text.fontSize).toBe(20);
    expect(settings.text.letterSpacing).toBe(1);
    expect(settings.text.verticalOffset).toBe(2);
  });
});
