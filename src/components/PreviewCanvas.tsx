import { useEffect, useRef } from "react";
import { renderCompositeCanvas } from "../lib/renderCanvas";
import type { RenderSettings } from "../lib/types";

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  settings: RenderSettings;
  onRendered: (canvas: HTMLCanvasElement | null) => void;
  onError: (message: string) => void;
  onUploadFiles: (files: Iterable<File> | null | undefined, source: "choose" | "drop" | "paste") => void;
  previewScale: number;
}

export default function PreviewCanvas({
  image,
  settings,
  onRendered,
  onError,
  onUploadFiles,
  previewScale
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!image || !canvasRef.current) {
      onRendered(null);
      return;
    }

    let frame = 0;
    const timeout = window.setTimeout(() => {
      frame = window.requestAnimationFrame(() => {
        try {
          const canvas = renderCompositeCanvas({
            canvas: canvasRef.current ?? undefined,
            image,
            settings,
            outputScale: previewScale
          });
          onRendered(canvas);
        } catch (error) {
          onRendered(null);
          onError(error instanceof Error ? error.message : "预览渲染失败");
        }
      });
    }, 70);

    return () => {
      window.clearTimeout(timeout);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [image, settings, onError, onRendered, previewScale]);

  if (!image) {
    return (
      <label
        className="empty-preview"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          onUploadFiles(event.dataTransfer.files, "drop");
        }}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/bmp"
          onChange={(event) => onUploadFiles(event.target.files, "choose")}
        />
        <div>
          <span>上传一张照片</span>
          <strong>点击选择、拖拽到这里，或按 Ctrl+V 粘贴图片</strong>
        </div>
      </label>
    );
  }

  return <canvas ref={canvasRef} className="preview-canvas" aria-label="复古纪念照预览" />;
}
