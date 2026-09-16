import { useEffect, useRef, useState } from "react";
import { DIR_FROM_KEY, SNAKE_CELL, SNAKE_TICK_MS, createSnake, queueDir, stepSnake, type SnakeState } from "@/lib/arcade/snake";

export function ReducedSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<SnakeState>(createSnake(20, 18));
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const draw = () => {
      const s = state.current;
      ctx.fillStyle = "#9bbc0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f380f";
      ctx.fillRect(s.food.x * SNAKE_CELL, s.food.y * SNAKE_CELL, SNAKE_CELL - 1, SNAKE_CELL - 1);
      s.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#0f380f" : "#306230";
        ctx.fillRect(seg.x * SNAKE_CELL, seg.y * SNAKE_CELL, SNAKE_CELL - 1, SNAKE_CELL - 1);
      });
      if (!s.alive) {
        ctx.fillText("GAME OVER · R", 8, canvas.height - 8);
      }
    };
    const loop = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;
      while (acc >= SNAKE_TICK_MS) {
        acc -= SNAKE_TICK_MS;
        state.current = stepSnake(state.current);
        setScore(state.current.score);
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        state.current = createSnake(20, 18);
        setScore(0);
        return;
      }
      const dir = DIR_FROM_KEY[event.key];
      if (dir) state.current = queueDir(state.current, dir);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div id="snake" className="mt-8">
      <p className="font-mono text-sm">SCORE {score}</p>
      <canvas ref={canvasRef} width={160} height={144} className="mt-2 border border-[#306230]" />
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4ead8]/50">Arrows / WASD · R restart</p>
    </div>
  );
}
