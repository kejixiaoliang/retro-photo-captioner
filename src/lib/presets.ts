import type { ExportSettings, FilterPresetMeta, FontPreset, RenderSettings } from "./types";

export const defaultText =
  "公元二零二六年，某某某同志、某某某同志游黄山\n某某某（左）、某某某（右）";

export const fontPresets: FontPreset[] = [
  {
    id: "solemn-song",
    name: "庄重宋刻",
    description: "正式纪念照标题风格",
    family: "\"Noto Serif SC\", \"Source Han Serif SC\", \"SimSun\", serif"
  },
  {
    id: "old-fangsong",
    name: "旧报仿宋",
    description: "旧报纸和档案标题感",
    family: "\"FangSong\", \"STFangsong\", \"Noto Serif SC\", serif"
  },
  {
    id: "kai-travel",
    name: "楷体题字",
    description: "更温和的旅行留念感",
    family: "\"KaiTi\", \"STKaiti\", \"LXGW WenKai\", cursive"
  },
  {
    id: "handwritten",
    name: "手写旧照",
    description: "生活化的旧照题字感",
    family: "\"Ma Shan Zheng\", \"Zhi Mang Xing\", \"KaiTi\", cursive"
  },
  {
    id: "system",
    name: "系统兜底",
    description: "优先使用本机中文字体",
    family: "\"SimSun\", \"FangSong\", \"KaiTi\", serif"
  }
];

export const filterPresetMetas: FilterPresetMeta[] = [
  { id: "period", name: "年代纪念照", description: "正式、厚重、轻微褪色" },
  { id: "realOldPhoto", name: "真实老照片", description: "泛黄、颗粒、暗角" },
  { id: "filmTravel", name: "胶片旅行照", description: "温暖、柔和、轻漏光" },
  { id: "blackWhiteArchive", name: "黑白档案照", description: "灰阶、颗粒、发灰" },
  { id: "fadedAlbum", name: "褪色相册", description: "低对比、浅色旧相纸" },
  { id: "redEra", name: "红色年代感", description: "浓红横幅、纪念册气质" }
];

export const initialRenderSettings: RenderSettings = {
  banner: {
    position: "top",
    height: 110,
    color: "#780512"
  },
  text: {
    content: defaultText,
    fontPresetId: "solemn-song",
    fontSize: 30,
    color: "#fff7ee",
    lineHeight: 1.18,
    letterSpacing: 1.2,
    verticalOffset: 0
  },
  filter: {
    presetId: "period",
    strength: 55,
    grain: 14,
    vignette: 18
  }
};

export const initialExportSettings: ExportSettings = {
  format: "png",
  jpegQuality: 0.92
};

export function getFontPreset(id: string): FontPreset {
  return fontPresets.find((font) => font.id === id) ?? fontPresets[0];
}
