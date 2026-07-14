import { describe, expect, it } from "vitest";
import { getFirstImageFile } from "./imageFiles";

function makeFile(name: string, type: string) {
  return new File(["sample"], name, { type });
}

describe("image file extraction", () => {
  it("uses the first image from a file list", () => {
    const file = makeFile("photo.png", "image/png");

    expect(getFirstImageFile([makeFile("notes.txt", "text/plain"), file])).toBe(file);
  });

  it("returns null when no image file exists", () => {
    expect(getFirstImageFile([makeFile("notes.txt", "text/plain")])).toBeNull();
  });
});
