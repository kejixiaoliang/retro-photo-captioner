import { describe, expect, it } from "vitest";
import { defaultText } from "./presets";

describe("text presets", () => {
  it("uses the requested commemorative caption copy", () => {
    expect(defaultText).toBe(
      "公元二零二六年，某某某、某某某于某某地方合影留念\n某某某（左）、某某某（右）"
    );
  });
});
