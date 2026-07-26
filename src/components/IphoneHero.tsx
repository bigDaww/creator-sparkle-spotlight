import { useEffect, useRef, useState } from "react";

// Replace this URL to swap the phone video. Nothing else needs to change.
export const DEFAULT_PHONE_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Fallback poster shown while loading or if the video fails to load.
const DEFAULT_PHONE_POSTER =
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80";

type IphoneHeroProps = {
  videoSrc?: string;
  posterSrc?: string;
  className?: string;
};

export function IphoneHero({
  videoSrc = DEFAULT_PHONE_VIDEO_SRC,
  posterSrc = DEFAULT_PHONE_POSTER,
  className = "",
}: IphoneHeroProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: py * -12, y: px * 14 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto w-[280px] md:w-[320px] animate-float-slow ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* Glow halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-primary/25 blur-3xl animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-accent/20 blur-[80px]"
      />

      {/* Phone body */}
      <div
        className="relative aspect-[9/19] w-full rounded-[3rem] border border-white/10 bg-neutral-950 p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset] transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Side buttons */}
        <span aria-hidden className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l bg-neutral-800" />
        <span aria-hidden className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l bg-neutral-800" />
        <span aria-hidden className="absolute -left-[3px] top-56 h-14 w-[3px] rounded-l bg-neutral-800" />
        <span aria-hidden className="absolute -right-[3px] top-40 h-20 w-[3px] rounded-r bg-neutral-800" />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] bg-black">
          {/* Dynamic Island */}
          <div
            aria-hidden
            className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          />

          {!videoFailed ? (
            <video
              key={videoSrc}
              className="h-full w-full object-cover"
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <img
              src={posterSrc}
              alt="Phone preview"
              className="h-full w-full object-cover"
            />
          )}

          {/* Screen sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10"
          />
        </div>
      </div>
    </div>
  );
}

export default IphoneHero;