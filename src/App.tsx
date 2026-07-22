import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import PreviewCanvas from "./components/PreviewCanvas";
import { getFirstImageFile } from "./lib/imageFiles";
import { getCanvasDataUrl, getPreviewScale, renderCompositeCanvas } from "./lib/renderCanvas";
import { initialExportSettings, initialRenderSettings } from "./lib/presets";
import { applyTemplateToSettings } from "./lib/templates";
import { fitTextToBanner, splitTextForFit } from "./lib/textFit";
import type { EditorTemplateId, ExportSettings, RenderSettings } from "./lib/types";

const isMiniToolBuild = import.meta.env.MODE === "minitool";

export default function App() {
  const [settings, setSettings] = useState<RenderSettings>(initialRenderSettings);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(initialExportSettings);
  const [activeTemplateId, setActiveTemplateId] = useState<EditorTemplateId>("commemorative");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportFileName = useMemo(
    () => getExportFileName(imageName, exportSettings.format),
    [exportSettings.format, imageName]
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const imageSize = useMemo(() => {
    if (!image) return null;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const exportWidth = Math.round(width * exportSettings.scale);
    const exportHeight = Math.round((height + settings.banner.height) * exportSettings.scale);
    return `${width} x ${height}，导出 ${exportWidth} x ${exportHeight}`;
  }, [image, settings.banner.height, exportSettings.scale]);

  const previewScale = useMemo(() => {
    if (!image) return 1;
    return getPreviewScale(
      {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      },
      1200
    );
  }, [image]);

  const handleUpload = useCallback(
    (file: File | null, source: "choose" | "drop" | "paste" = "choose") => {
      if (!file) {
        if (source !== "choose") setStatus("没有找到可上传的图片。");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setStatus("请选择图片文件。");
        return;
      }

      const url = URL.createObjectURL(file);
      const nextImage = new Image();
      nextImage.onload = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setObjectUrl(url);
        setImage(nextImage);
        setImageName(file.name);

        const pixels = nextImage.naturalWidth * nextImage.naturalHeight;
        const sourceLabel = source === "drop" ? "拖拽" : source === "paste" ? "粘贴" : "选择";
        setStatus(
          pixels > 18_000_000
            ? `${sourceLabel}图片已载入，图片较大，滤镜预览可能需要一点时间。`
            : `${sourceLabel}图片已载入。`
        );
      };
      nextImage.onerror = () => {
        URL.revokeObjectURL(url);
        setStatus("图片读取失败，请换一张再试。");
      };
      nextImage.src = url;
    },
    [objectUrl]
  );

  const handleUploadFiles = useCallback(
    (files: Iterable<File> | null | undefined, source: "choose" | "drop" | "paste" = "choose") => {
      handleUpload(getFirstImageFile(files), source);
    },
    [handleUpload]
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const file = getFirstImageFile(event.clipboardData?.files);
      if (!file) return;
      event.preventDefault();
      handleUpload(file, "paste");
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleUpload]);

  const handleRendered = useCallback((canvas: HTMLCanvasElement | null) => {
    previewCanvasRef.current = canvas;
  }, []);

  const handlePreviewError = useCallback((message: string) => {
    setStatus(message);
  }, []);

  const handleTemplateChange = useCallback((templateId: EditorTemplateId) => {
    setSettings((current) => applyTemplateToSettings(current, templateId));
    setActiveTemplateId(templateId);
    setStatus("模板已应用，原有文案已保留。");
  }, []);

  const handleAutoFitText = useCallback(() => {
    if (!image) {
      setStatus("请先上传图片，再自动适配文字。");
      return;
    }

    const result = fitTextToBanner({
      lines: splitTextForFit(settings.text.content),
      bannerWidth: image.naturalWidth || image.width,
      bannerHeight: settings.banner.height,
      currentFontSize: settings.text.fontSize,
      minFontSize: 16,
      maxFontSize: 76,
      lineHeight: settings.text.lineHeight,
      letterSpacing: settings.text.letterSpacing,
      averageCharWidthRatio: 0.95
    });

    setSettings({
      ...settings,
      text: {
        ...settings.text,
        fontSize: result.fontSize
      }
    });
    setStatus(result.fits ? "文字已适配当前横幅。" : "文字较密，已调整到最小可读字号。");
  }, [image, settings]);

  const handleExport = useCallback(async () => {
    if (!image) {
      setStatus("请先上传图片。");
      return;
    }

    try {
      const outputCanvas = renderCompositeCanvas({
        image,
        settings,
        outputScale: exportSettings.scale
      });
      const dataUrl = getCanvasDataUrl(outputCanvas, exportSettings);
      setExportPreviewUrl(dataUrl);
      if (isMiniToolBuild) {
        setStatus("已生成成图预览。小工具容器不支持文件下载，请在预览中查看成图并截图保存。");
      } else {
        triggerDownload(dataUrl, exportFileName);
        setStatus("已生成成图，并开始下载。");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "导出失败。");
    }
  }, [exportFileName, exportSettings, image, settings]);

  return (
    <main className={`app-shell ${image ? "has-image" : "is-empty"}`}>
      <ControlPanel
        settings={settings}
        exportSettings={exportSettings}
        imageName={imageName}
        imageSize={imageSize}
        status={status}
        canExport={Boolean(image)}
        activeTemplateId={activeTemplateId}
        onUpload={handleUpload}
        onUploadFiles={handleUploadFiles}
        onSettingsChange={setSettings}
        onExportSettingsChange={setExportSettings}
        onTemplateChange={handleTemplateChange}
        onAutoFitText={handleAutoFitText}
        onExport={handleExport}
        exportPreviewUrl={exportPreviewUrl}
        exportFileName={exportFileName}
      />
      <section className="preview-stage" aria-label="实时预览">
        <div className="stage-topline">
          <span>实时预览</span>
          <strong>{imageSize ?? "等待图片"}</strong>
        </div>
        <div className="canvas-board">
          <PreviewCanvas
            image={image}
            settings={settings}
            onRendered={handleRendered}
            onError={handlePreviewError}
            onUploadFiles={handleUploadFiles}
            previewScale={previewScale}
          />
        </div>
      </section>
    </main>
  );
}

function getExportFileName(imageName: string | null, format: ExportSettings["format"]) {
  const extension = format === "jpeg" ? "jpg" : "png";
  const baseName = imageName?.replace(/\.[^.]+$/, "") || "retro-photo";
  const safeName = baseName
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${safeName || "retro-photo"}-framed.${extension}`;
}

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
