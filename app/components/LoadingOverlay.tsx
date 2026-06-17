"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingOverlay() {
  const [showLoader, setShowLoader] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const hideTimer = window.setTimeout(() => {
      const loader = loaderRef.current;
      const loaderContent = loaderContentRef.current;

      if (!loader || !loaderContent) {
        setShowLoader(false);
        document.body.style.overflow = "";
        return;
      }

      gsap
        .timeline({
          onComplete: () => {
            setShowLoader(false);
            document.body.style.overflow = "";
          },
        })
        .to(loaderContent, {
          y: -28,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
        })
        .to(
          loader,
          {
            yPercent: -110,
            rotate: -2,
            borderBottomLeftRadius: "55vw",
            borderBottomRightRadius: "55vw",
            duration: 0.95,
            ease: "expo.inOut",
          },
          "-=0.08"
        );
    }, 1000);

    return () => {
      window.clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!showLoader) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-9999 flex origin-top items-center justify-center overflow-hidden bg-linear-to-br from-red-950 via-red-800 to-red-700 text-[#f7eee7]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.18),transparent_34%)]" />
      <div
        ref={loaderContentRef}
        className="relative flex flex-col items-center gap-5 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.6em] text-[#f7eee7]/70">
          Loading
        </p>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-[#f7eee7]/20">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#f7eee7]/90" />
        </div>
      </div>
    </div>
  );
}
