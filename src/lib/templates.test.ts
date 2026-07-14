import { describe, expect, it } from "vitest";
import { editorTemplates, applyTemplateToSettings } from "./templates";
import { initialRenderSettings } from "./presets";

describe("editor templates", () => {
  it("defines five user-facing templates", () => {
    expect(editorTemplates.map((template) => template.id)).toEqual([
      "commemorative",
      "newspaper",
      "travel",
      "archive",
      "redEra"
    ]);
  });

  it("returns a complete render settings object", () => {
    const next = applyTemplateToSettings(initialRenderSettings, "archive");

    expect(next.banner.height).toBeGreaterThan(0);
    expect(next.text.content.length).toBeGreaterThan(0);
    expect(next.filter.presetId).toBe("blackWhiteArchive");
  });

  it("preserves user text when applying a visual template", () => {
    const next = applyTemplateToSettings(
      {
        ...initialRenderSettings,
        text: { ...initialRenderSettings.text, content: "用户自己的文字" }
      },
      "travel"
    );

    expect(next.text.content).toBe("用户自己的文字");
  });
});
