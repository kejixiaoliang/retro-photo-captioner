import { describe, expect, it } from "vitest";
import { blendFilterParams, filterPresets } from "./filters";

describe("filter presets", () => {
  it("returns neutral parameters at zero strength", () => {
    const params = blendFilterParams(filterPresets.realOldPhoto, 0);

    expect(params.saturation).toBe(1);
    expect(params.contrast).toBe(1);
    expect(params.warmth).toBe(0);
    expect(params.grayscale).toBe(0);
  });

  it("moves toward the preset at full strength", () => {
    const params = blendFilterParams(filterPresets.blackWhiteArchive, 100);

    expect(params.saturation).toBeLessThan(0.2);
    expect(params.grayscale).toBeGreaterThan(0.8);
    expect(params.grain).toBeGreaterThan(0);
  });
});
