import { useEffect, useRef } from "react";
import { renderCompositeCanvas } from "../lib/renderCanvas";
import type { RenderSettings } from "../lib/types";

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  settings: RenderSettings;
  onRendered: (canvas: HTMLCanvasElement | null) => void;
  onError: (message: string) => void;
  previewScale: number;
}

export default function PreviewCanvas({ image, settings, onRendered, onError, previewScale }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!image || !canvasRef.current) {
      onRendered(null);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
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

    return () => window.cancelAnimationFrame(frame);
  }, [image, settings, onError, onRendered, previewScale]);

  if (!image) {
    return (
      <div className="empty-preview">
        <div>
          <span>上传一张照片</span>
          <strong>红幅、文字和旧照滤镜会在这里实时合成</strong>
        </div>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="preview-canvas" aria-label="复古纪念照预览" />;
}
