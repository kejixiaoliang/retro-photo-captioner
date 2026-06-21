export type BannerPosition = "top" | "bottom";
export type ExportFormat = "png" | "jpeg";
export type FontPresetId =
  | "aged-song"
  | "solemn-song"
  | "old-fangsong"
  | "kai-travel"
  | "handwritten"
  | "system";
export type TextEffect = "clean" | "aged-print";
export type FilterPresetId =
  | "period"
  | "realOldPhoto"
  | "filmTravel"
  | "blackWhiteArchive"
  | "fadedAlbum"
  | "redEra";

export interface Size {
  width: number;
  height: number;
}

export interface BannerSettings {
  position: BannerPosition;
  height: number;
  color: string;
}

export interface TextSettings {
  content: string;
  fontPresetId: FontPresetId;
  fontSize: number;
  color: string;
  lineHeight: number;
  letterSpacing: number;
  verticalOffset: number;
  effect: TextEffect;
}

export interface FilterSettings {
  presetId: FilterPresetId;
  strength: number;
  grain: number;
  vignette: number;
}

export interface ExportSettings {
  format: ExportFormat;
  jpegQuality: number;
  scale: number;
}

export interface RenderSettings {
  banner: BannerSettings;
  text: TextSettings;
  filter: FilterSettings;
}

export interface FontPreset {
  id: FontPresetId;
  name: string;
  description: string;
  family: string;
}

export interface FilterPresetMeta {
  id: FilterPresetId;
  name: string;
  description: string;
}
