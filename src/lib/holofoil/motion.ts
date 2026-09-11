export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotionFlag(): {
  reduced: boolean;
  subscribe: (cb: (next: boolean) => void) => () => void;
} {
  const reduced = prefersReducedMotion();
  return {
    reduced,
    subscribe: (cb) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = () => cb(mq.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    },
  };
}
