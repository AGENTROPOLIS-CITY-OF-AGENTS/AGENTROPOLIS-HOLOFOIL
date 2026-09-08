import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/holofoil/motion";

export function CampusHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div className="relative overflow-hidden bg-bg">
      {reduced ? (
        <img
          src="/campus-hero.jpg"
          alt="AGENTROPOLIS HOLOFOIL Origin Engine campus"
          width={1200}
          height={752}
          className="block h-auto w-full"
        />
      ) : (
        <video
          ref={videoRef}
          className="block h-auto w-full"
          poster="/campus-hero.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label="Origin Engine campus flythrough"
        >
          <source src="/campus-hero.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
