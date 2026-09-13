import type { HolofoilMediaRecord } from "../schemas/types.ts";

export type CanvasSurfaceHandle = {
  draw: () => void;
  dispose: () => void;
};

/** 2D canvas adapter. Draws poster or a video element; never infers destinations. */
export function mountCanvasSurface(
  canvas: HTMLCanvasElement,
  media: HolofoilMediaRecord | null,
  video?: HTMLVideoElement | null,
): CanvasSurfaceHandle {
  const ctx = canvas.getContext("2d");
  let raf = 0;
  let image: HTMLImageElement | null = null;
  if (media?.poster && typeof Image !== "undefined") {
    image = new Image();
    image.src = media.poster;
  }
  const draw = () => {
    if (!ctx) return;
    ctx.fillStyle = "#16181d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const readyVideo = video && video.readyState >= 2 ? video : null;
    const readyImage = image && image.complete ? image : null;
    const source = readyVideo ?? readyImage;
    if (source) {
      try {
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      } catch {
        /* decode not ready */
      }
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  return {
    draw,
    dispose: () => {
      cancelAnimationFrame(raf);
      image = null;
    },
  };
}
