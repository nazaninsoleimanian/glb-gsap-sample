"use client";

import { Suspense, useEffect, useRef } from "react";
import { Bounds, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MotocycleHelmet from "./components/MotocycleHelmet";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const firstLineRef = useRef<HTMLDivElement>(null);
  const secondLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvasShell = canvasShellRef.current;
    const firstLine = firstLineRef.current;
    const secondLine = secondLineRef.current;

    if (!hero || !canvasShell || !firstLine || !secondLine) return;

    const ctx = gsap.context(() => {
      gsap.set(".canvas-inner", {
        scale: 1,
        transformOrigin: "center center",
      });
      gsap.set(firstLine, { xPercent: 0, opacity: 1 });
      gsap.set(secondLine, { xPercent: -50, opacity: 1 });

      gsap.fromTo(firstLine, {
        xPercent: 0,
      }, {
        xPercent: -50,
        duration: 40,
        ease: "none",
        repeat: -1,
      });

      gsap.fromTo(secondLine, {
        xPercent: -50,
      }, {
        xPercent: 0,
        duration: 40,
        ease: "none",
        repeat: -1,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=2200",
          scrub: 2.2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      timeline.to(".canvas-inner", {
        scale: 0.45,
        borderRadius: 36,
        ease: "power3.inOut",
      }, 0);

    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen w-screen overflow-x-hidden font-sans">
      <section ref={heroRef} className="relative h-screen w-screen">
        <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 overflow-hidden text-center text-[clamp(3.5rem,12vw,12rem)] font-black uppercase leading-none tracking-[-0.02em]">
            <div className="marquee w-full overflow-hidden">
              <div ref={firstLineRef} className="flex w-max whitespace-nowrap">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="flex-none px-6 text-red-800/80">
                    Expert Safety Hazard Analysis
                  </span>
                ))}
              </div>
            </div>
            <div className="marquee w-full overflow-hidden">
              <div ref={secondLineRef} className="flex w-max whitespace-nowrap">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="flex-none px-6 text-[#2f2d2d]/80">
                    Expert Safety Hazard Analysis
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            ref={canvasShellRef}
            className="relative z-10 w-screen h-screen overflow-hidden shadow-2xl"
          >
            <div className="canvas-inner origin-center w-full h-full relative">
              <video
                className="absolute inset-0 z-0 h-full w-full object-cover"
                src="/6914317_Motion_Graphics_Motion_Graphic_3840x2160.mp4"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
              />
              <div className="absolute inset-0 z-0 bg-black/20"></div>
              <div className="absolute inset-0">
                <Canvas
                  className="w-full h-full"
                  camera={{ position: [0, 0, 3.35], fov: 36 }}
                  resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
                  shadows
                >
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 5, 5]} intensity={2} />
                  <Suspense fallback={null}>
                    <Bounds fit clip observe={false} margin={1.40}>
                      <MotocycleHelmet />
                      {/* <MotocycleHelmet revealBase={0.32} /> */}
                    </Bounds>
                    <Environment preset="city" />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative h-screen w-screen">

      </section>
    </main>
  );
}
