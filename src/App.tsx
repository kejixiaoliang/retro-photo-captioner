import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import PreviewCanvas from "./components/PreviewCanvas";
import { exportCanvas } from "./lib/renderCanvas";
import { initialExportSettings, initialRenderSettings } from "./lib/presets";
import type { ExportSettings, RenderSettings } from "./lib/types";

export default function App() {
  const [settings, setSettings] = useState<RenderSettings>(initialRenderSettings);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(initialExportSettings);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const imageSize = useMemo(() => {
    if (!image) return null;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    return `${width} x ${height}，导出高度 ${height + settings.banner.height}`;
  }, [image, settings.banner.height]);

  const handleUpload = useCallback(
    (file: File | null) => {
      if (!file) return;
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
        setStatus(pixels > 18_000_000 ? "图片较大，滤镜预览可能需要一点时间。" : "图片已载入。");
      };
      nextImage.onerror = () => {
        URL.revokeObjectURL(url);
        setStatus("图片读取失败，请换一张再试。");
      };
      nextImage.src = url;
    },
    [objectUrl]
  );

  const handleRendered = useCallback((canvas: HTMLCanvasElement | null) => {
    previewCanvasRef.current = canvas;
  }, []);

  const handlePreviewError = useCallback((message: string) => {
    setStatus(message);
  }, []);

  const handleExport = useCallback(async () => {
    if (!previewCanvasRef.current) {
      setStatus("请先上传图片。");
      return;
    }

    try {
      await exportCanvas(previewCanvasRef.current, exportSettings);
      setStatus("已生成下载文件。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "导出失败。");
    }
  }, [exportSettings]);

  return (
    <main className="app-shell">
      <ControlPanel
        settings={settings}
        exportSettings={exportSettings}
        imageName={imageName}
        imageSize={imageSize}
        status={status}
        canExport={Boolean(image)}
        onUpload={handleUpload}
        onSettingsChange={setSettings}
        onExportSettingsChange={setExportSettings}
        onExport={handleExport}
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
          />
        </div>
      </section>
    </main>
  );
}
