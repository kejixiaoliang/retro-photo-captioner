import {
  AlignCenter,
  Download,
  ImagePlus,
  Minus,
  Plus,
  SlidersHorizontal,
  Type,
  Wand2
} from "lucide-react";
import { defaultText, filterPresetMetas, fontPresets } from "../lib/presets";
import type { ExportSettings, RenderSettings } from "../lib/types";

interface ControlPanelProps {
  settings: RenderSettings;
  exportSettings: ExportSettings;
  imageName: string | null;
  imageSize: string | null;
  status: string;
  canExport: boolean;
  onUpload: (file: File | null) => void;
  onSettingsChange: (settings: RenderSettings) => void;
  onExportSettingsChange: (settings: ExportSettings) => void;
  onExport: () => void;
}

export default function ControlPanel({
  settings,
  exportSettings,
  imageName,
  imageSize,
  status,
  canExport,
  onUpload,
  onSettingsChange,
  onExportSettingsChange,
  onExport
}: ControlPanelProps) {
  const updateSettings = (patch: Partial<RenderSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  return (
    <aside className="control-panel">
      <header className="tool-header">
        <div>
          <span className="eyebrow">Canvas 本地处理</span>
          <h1>复古纪念照框幅</h1>
        </div>
        <Wand2 aria-hidden="true" />
      </header>

      <section className="panel-section">
        <h2>
          <ImagePlus aria-hidden="true" />
          图片
        </h2>
        <label className="file-drop">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp"
            onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
          />
          <span>{imageName ?? "选择本地图片"}</span>
          <small>{imageSize ?? "PNG / JPG / WebP / BMP"}</small>
        </label>
        {status && <p className="status-text">{status}</p>}
      </section>

      <section className="panel-section">
        <h2>
          <SlidersHorizontal aria-hidden="true" />
          框幅
        </h2>
        <div className="segmented">
          <button
            className={settings.banner.position === "top" ? "active" : ""}
            onClick={() => updateSettings({ banner: { ...settings.banner, position: "top" } })}
            type="button"
          >
            上边缘
          </button>
          <button
            className={settings.banner.position === "bottom" ? "active" : ""}
            onClick={() => updateSettings({ banner: { ...settings.banner, position: "bottom" } })}
            type="button"
          >
            下边缘
          </button>
        </div>
        <RangeField
          label="横幅高度"
          value={settings.banner.height}
          min={60}
          max={260}
          step={2}
          unit="px"
          onChange={(height) => updateSettings({ banner: { ...settings.banner, height } })}
        />
        <label className="color-row">
          <span>深红色</span>
          <input
            type="color"
            value={settings.banner.color}
            onChange={(event) =>
              updateSettings({ banner: { ...settings.banner, color: event.target.value } })
            }
          />
          <code>{settings.banner.color}</code>
        </label>
      </section>

      <section className="panel-section">
        <h2>
          <Type aria-hidden="true" />
          文字
        </h2>
        <button
          className="preset-button"
          type="button"
          onClick={() => updateSettings({ text: { ...settings.text, content: defaultText } })}
        >
          填入预设文案
        </button>
        <textarea
          value={settings.text.content}
          onChange={(event) => updateSettings({ text: { ...settings.text, content: event.target.value } })}
          rows={4}
          spellCheck={false}
        />
        <label className="field">
          <span>字体样式</span>
          <select
            value={settings.text.fontPresetId}
            onChange={(event) =>
              updateSettings({
                text: { ...settings.text, fontPresetId: event.target.value as RenderSettings["text"]["fontPresetId"] }
              })
            }
          >
            {fontPresets.map((font) => (
              <option key={font.id} value={font.id}>
                {font.name} - {font.description}
              </option>
            ))}
          </select>
        </label>
        <div className="segmented compact">
          <button
            className={settings.text.effect === "aged-print" ? "active" : ""}
            type="button"
            onClick={() => updateSettings({ text: { ...settings.text, effect: "aged-print" } })}
          >
            斑驳印刷
          </button>
          <button
            className={settings.text.effect === "clean" ? "active" : ""}
            type="button"
            onClick={() => updateSettings({ text: { ...settings.text, effect: "clean" } })}
          >
            清晰文字
          </button>
        </div>
        <RangeField
          label="字号"
          value={settings.text.fontSize}
          min={16}
          max={76}
          step={1}
          unit="px"
          onChange={(fontSize) => updateSettings({ text: { ...settings.text, fontSize } })}
        />
        <RangeField
          label="行高"
          value={settings.text.lineHeight}
          min={0.9}
          max={1.8}
          step={0.02}
          onChange={(lineHeight) => updateSettings({ text: { ...settings.text, lineHeight } })}
        />
        <RangeField
          label="字距"
          value={settings.text.letterSpacing}
          min={0}
          max={8}
          step={0.1}
          unit="px"
          onChange={(letterSpacing) => updateSettings({ text: { ...settings.text, letterSpacing } })}
        />
        <RangeField
          label="上下微调"
          value={settings.text.verticalOffset}
          min={-60}
          max={60}
          step={1}
          unit="px"
          onChange={(verticalOffset) => updateSettings({ text: { ...settings.text, verticalOffset } })}
        />
        <label className="color-row">
          <span>文字颜色</span>
          <input
            type="color"
            value={settings.text.color}
            onChange={(event) => updateSettings({ text: { ...settings.text, color: event.target.value } })}
          />
          <code>{settings.text.color}</code>
        </label>
      </section>

      <section className="panel-section">
        <h2>
          <AlignCenter aria-hidden="true" />
          滤镜
        </h2>
        <label className="field">
          <span>复古类型</span>
          <select
            value={settings.filter.presetId}
            onChange={(event) =>
              updateSettings({
                filter: {
                  ...settings.filter,
                  presetId: event.target.value as RenderSettings["filter"]["presetId"]
                }
              })
            }
          >
            {filterPresetMetas.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} - {preset.description}
              </option>
            ))}
          </select>
        </label>
        <RangeField
          label="滤镜强度"
          value={settings.filter.strength}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(strength) => updateSettings({ filter: { ...settings.filter, strength } })}
        />
        <RangeField
          label="颗粒"
          value={settings.filter.grain}
          min={0}
          max={70}
          step={1}
          unit="%"
          onChange={(grain) => updateSettings({ filter: { ...settings.filter, grain } })}
        />
        <RangeField
          label="暗角"
          value={settings.filter.vignette}
          min={0}
          max={70}
          step={1}
          unit="%"
          onChange={(vignette) => updateSettings({ filter: { ...settings.filter, vignette } })}
        />
      </section>

      <section className="panel-section export-section">
        <h2>
          <Download aria-hidden="true" />
          导出
        </h2>
        <div className="segmented">
          <button
            className={exportSettings.format === "png" ? "active" : ""}
            onClick={() => onExportSettingsChange({ ...exportSettings, format: "png" })}
            type="button"
          >
            PNG
          </button>
          <button
            className={exportSettings.format === "jpeg" ? "active" : ""}
            onClick={() => onExportSettingsChange({ ...exportSettings, format: "jpeg" })}
            type="button"
          >
            JPEG
          </button>
        </div>
        {exportSettings.format === "jpeg" && (
          <RangeField
            label="JPEG 质量"
            value={Math.round(exportSettings.jpegQuality * 100)}
            min={55}
            max={100}
            step={1}
            unit="%"
            onChange={(quality) =>
              onExportSettingsChange({ ...exportSettings, jpegQuality: quality / 100 })
            }
          />
        )}
        <RangeField
          label="导出尺寸"
          value={Math.round(exportSettings.scale * 100)}
          min={40}
          max={100}
          step={5}
          unit="%"
          onChange={(scale) => onExportSettingsChange({ ...exportSettings, scale: scale / 100 })}
        />
        <button className="export-button" type="button" disabled={!canExport} onClick={onExport}>
          <Download aria-hidden="true" />
          下载成图
        </button>
      </section>
    </aside>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

function RangeField({ label, value, min, max, step, unit = "", onChange }: RangeFieldProps) {
  const clamp = (nextValue: number) => Math.max(min, Math.min(max, Number(nextValue.toFixed(4))));
  const displayValue = Number.isInteger(value) ? value : value.toFixed(2);

  return (
    <label className="range-field">
      <span>
        {label}
        <strong>
          {displayValue}
          {unit}
        </strong>
      </span>
      <div className="range-control">
        <button
          type="button"
          aria-label={`${label} 减少`}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus aria-hidden="true" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <button
          type="button"
          aria-label={`${label} 增加`}
          onClick={() => onChange(clamp(value + step))}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
    </label>
  );
}
