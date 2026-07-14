import { initialRenderSettings } from "./presets";
import type { EditorTemplate, EditorTemplateId, RenderSettings } from "./types";

export const editorTemplates: EditorTemplate[] = [
  {
    id: "commemorative",
    name: "纪念合影",
    description: "深红横幅、宋体题字、正式纪念照质感",
    settings: initialRenderSettings
  },
  {
    id: "newspaper",
    name: "老报纸档案",
    description: "仿宋文字、轻微褪色、纸张颗粒",
    settings: {
      ...initialRenderSettings,
      banner: { position: "bottom", height: 120, color: "#6d1014" },
      text: { ...initialRenderSettings.text, fontPresetId: "old-fangsong", fontSize: 32 },
      filter: { presetId: "fadedAlbum", strength: 70, grain: 22, vignette: 12, applyToBanner: true }
    }
  },
  {
    id: "travel",
    name: "旅行留念",
    description: "楷体题字、暖色胶片、轻微漏光",
    settings: {
      ...initialRenderSettings,
      banner: { position: "bottom", height: 112, color: "#7b1518" },
      text: { ...initialRenderSettings.text, fontPresetId: "kai-travel", fontSize: 34 },
      filter: { presetId: "filmTravel", strength: 68, grain: 12, vignette: 10, applyToBanner: false }
    }
  },
  {
    id: "archive",
    name: "黑白档案",
    description: "黑白影调、档案颗粒、克制红幅",
    settings: {
      ...initialRenderSettings,
      banner: { position: "top", height: 104, color: "#4f0b10" },
      text: { ...initialRenderSettings.text, fontPresetId: "solemn-song", fontSize: 29 },
      filter: { presetId: "blackWhiteArchive", strength: 82, grain: 28, vignette: 26, applyToBanner: true }
    }
  },
  {
    id: "redEra",
    name: "红色年代",
    description: "浓红横幅、厚重暗角、年代纪念册气质",
    settings: {
      ...initialRenderSettings,
      banner: { position: "top", height: 126, color: "#8c0715" },
      text: { ...initialRenderSettings.text, fontPresetId: "aged-song", fontSize: 34 },
      filter: { presetId: "redEra", strength: 78, grain: 18, vignette: 30, applyToBanner: true }
    }
  }
];

export function applyTemplateToSettings(settings: RenderSettings, templateId: EditorTemplateId): RenderSettings {
  const template = editorTemplates.find((candidate) => candidate.id === templateId) ?? editorTemplates[0];

  return {
    ...template.settings,
    text: {
      ...template.settings.text,
      content: settings.text.content
    }
  };
}
