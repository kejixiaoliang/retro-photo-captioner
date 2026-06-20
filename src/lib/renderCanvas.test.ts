import { describe, expect, it } from "vitest";
import { splitTextLines, getOutputSize } from "./renderCanvas";

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
});
