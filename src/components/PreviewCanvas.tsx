import { useEffect, useRef } from "react";
import { renderCompositeCanvas } from "../lib/renderCanvas";
import type { RenderSettings } from "../lib/types";

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  settings: RenderSettings;
  onRendered: (canvas: HTMLCanvasElement | null) => void;
  onError: (message: string) => void;
}

export default function PreviewCanvas({ image, settings, onRendered, onError }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!image || !canvasRef.current) {
      onRendered(null);
      return;
    }

    try {
      const canvas = renderCompositeCanvas({
        canvas: canvasRef.current,
        image,
        settings
      });
      onRendered(canvas);
    } catch (error) {
      onRendered(null);
      onError(error instanceof Error ? error.message : "预览渲染失败");
    }
  }, [image, settings, onError, onRendered]);

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
