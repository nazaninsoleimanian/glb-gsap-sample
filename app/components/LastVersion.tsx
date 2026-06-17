"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Bounds, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MotocycleHelmet from "./MotocycleHelmet";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const helmetGalleryItems = [
  {
    src: "/helmet-1.jpg",
    label: "Helmet archive",
    className: "left-[6vw] top-[10vh] h-[28vh] w-[20vw]",
  },
  {
    src: "/helmet-2.jpg",
    label: "Miami GP, 2024",
    className: "left-[32vw] top-[24vh] h-[56vh] w-[38vw]",
  },
  {
    src: "/helmet-3.jpg",
    label: "Race detail",
    className: "left-[78vw] top-[8vh] h-[24vh] w-[18vw]",
  },
  {
    src: "/helmet-4.jpg",
    label: "FIA prize giving, 2024",
    className: "left-[104vw] top-[46vh] h-[34vh] w-[27vw]",
  },
  {
    src: "/helmet-5.jpg",
    label: "Design study",
    className: "left-[142vw] top-[14vh] h-[52vh] w-[34vw]",
  },
  {
    src: "/helmet-11.jpg",
    label: "Final archive",
    className: "left-[196vw] top-[16vh] h-[54vh] w-[34vw]",
  },
];

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderContentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const headerLogoRef = useRef<HTMLSpanElement>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const firstLineRef = useRef<HTMLDivElement>(null);
  const secondLineRef = useRef<HTMLDivElement>(null);

  const textRef = useRef<HTMLParagraphElement>(null);

  const gallerySectionRef = useRef<HTMLElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const galleryWrapperRef = useRef<HTMLDivElement>(null);

  const motorcyclistSectionRef = useRef<HTMLElement>(null);
  const motorcyclistLeftRef = useRef<HTMLDivElement>(null);
  const motorcyclistRightRef = useRef<HTMLDivElement>(null);

  const motorcyclistHeroSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    // const lenis = new Lenis({
    //   lerp: 0.08,
    //   smoothWheel: true,
    // });

    // lenis.on("scroll", ScrollTrigger.update);

    // gsap.ticker.add((time) => {
    //   lenis.raf(time * 1000);
    // });

    // gsap.ticker.lagSmoothing(0);

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // ------------------------
    // Hero Animation
    // ------------------------


    const hideTimer = window.setTimeout(() => {
      const loader = loaderRef.current;
      const loaderContent = loaderContentRef.current;

      if (!loader || !loaderContent) {
        setShowLoader(false);
        document.body.style.overflow = "";
        return;
      }

      gsap.timeline({
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
        .to(loader, {
          yPercent: -110,
          rotate: -2,
          borderBottomLeftRadius: "55vw",
          borderBottomRightRadius: "55vw",
          duration: 0.95,
          ease: "expo.inOut",
        }, "-=0.08");
    }, 2000);

    return () => {
      window.clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const canvasShell = canvasShellRef.current;
    const firstLine = firstLineRef.current;
    const secondLine = secondLineRef.current;

    const gallerySection = gallerySectionRef.current;
    const galleryContainer = galleryContainerRef.current;
    const galleryWrapper = galleryWrapperRef.current;

    const motorcyclistSection = motorcyclistSectionRef.current;
    const motorcyclistLeft = motorcyclistLeftRef.current;
    const motorcyclistRight = motorcyclistRightRef.current;
    const motorcyclistHeroSection = motorcyclistHeroSectionRef.current;

    if (!hero || !canvasShell || !firstLine || !secondLine || !gallerySection ||
      !galleryContainer ||
      !galleryWrapper ||
      !motorcyclistSection ||
      !motorcyclistLeft ||
      !motorcyclistRight ||
      !motorcyclistHeroSection) return;

    const ctx = gsap.context(() => {
      //----------------------------------------
      // Hero
      //----------------------------------------

      gsap.set(".canvas-inner", {
        scale: 1,
        transformOrigin: "center center",
      });

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
      gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=1200",
          scrub: 2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
        },
      }).to(".canvas-inner", {
        scale: 0.45,
        borderRadius: 36,
        ease: "none",
      });

      // ScrollTrigger.create({
      //   trigger: hero,
      //   start: "top top",
      //   end: "+=1",
      //   onLeave: () => setIsHeaderCompact(true),
      //   onEnterBack: () => setIsHeaderCompact(false),
      // });

      //----------------------------------------
      // Gallery
      //----------------------------------------

      gsap.set(galleryContainer, {
        xPercent: 100,
      });

      gsap.to(galleryContainer, {
        xPercent: 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gallerySection,
          start: "top bottom",
          end: "top top",
          scrub: 1,
        },
      });

      const totalScroll =
        galleryWrapper.scrollWidth - window.innerWidth;

      gsap.to(galleryWrapper, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: gallerySection,
          start: "top top",
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: true,
          anticipatePin: 0,
        },
      });

      //----------------------------------------
      // Motorcyclist Split Images
      //----------------------------------------

      gsap.set(motorcyclistLeft, {
        xPercent: -60,
      });
      gsap.set(motorcyclistRight, {
        xPercent: 60,
      });

      gsap.to(motorcyclistLeft, {
        xPercent: -14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: motorcyclistSection,
          start: "top 80%",
          end: "center center",
          scrub: 1.2,
        },
      });

      gsap.to(motorcyclistRight, {
        xPercent: 14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: motorcyclistSection,
          start: "top 80%",
          end: "center center",
          scrub: 1.2,
        },
      });
    });

    gsap.fromTo(
      ".word",
      {
        color: "#999999",
        opacity: 0.2,
        y: 40,
      },
      {
        color: "#000000",
        opacity: 1,
        y: 0,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
          end: "bottom center",
          scrub: 1,
        },
      }
    );

    //----------------------------------------
    // Motorcyclist Hero
    //----------------------------------------

    gsap.set(motorcyclistHeroSection, {
      yPercent: 100,
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: motorcyclistSection,
        start: "top top",
        end: "+=100%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    }).to(motorcyclistHeroSection, {
      yPercent: 0,
      ease: "none",
    });

    // ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true); // force recalculation
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main className="min-h-screen w-screen overflow-x-hidden font-sans">
      {showLoader && (
        <div
          ref={loaderRef}
          className="fixed inset-0 z-[9999] flex origin-top items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-red-800 to-red-700 text-[#f7eee7]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.18),transparent_34%)]" />
          <div ref={loaderContentRef} className="relative flex flex-col items-center gap-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.6em] text-[#f7eee7]/70">
              Loading
            </p>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-[#f7eee7]/20">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#f7eee7]/90" />
            </div>
          </div>
        </div>
      )}
      {/* <header className="pointer-events-none fixed inset-0 z-[120]">
        <span
          ref={headerLogoRef}
          className={`absolute inline-block whitespace-nowrap font-black uppercase leading-none tracking-tight transition-[left,top,transform,font-size,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [contain:paint] [will-change:transform] ${isHeaderCompact
              ? "left-6 top-4 translate-x-0 translate-y-0 text-xl text-[#3d0607]"
              : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(2.6rem,8vw,7.5rem)] text-[#5f0c0efc]"
            }`}
        >
          advanced analytics
        </span>
      </header> */}
      <section ref={heroRef} className="relative h-screen w-screen">
        <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 overflow-hidden text-center text-[clamp(2.5rem,9vw,9rem)] font-black uppercase leading-none tracking-[-0.02em]">
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
                    </Bounds>
                    <Environment preset="city" />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
        <p
          ref={textRef}
          className="max-w-6xl px-20 text-center text-[clamp(2rem,5vw,5rem)] font-bold leading-tight tracking-tight"
        >
          {"Investing in a quality motorcycle helmet is an investment in safety, durability, and peace of mind. "
            .split(" ")
            .map((word, index) => (
              <span
                key={index}
                className="word inline-block mr-4 text-black/20"
              >
                {word}
              </span>
            ))}
        </p>
      </section>
      <section
        ref={gallerySectionRef}
        className="relative h-screen w-screen overflow-hidden"
      >
        <div
          ref={galleryContainerRef}
          className="absolute inset-0"
        >
          <div
            ref={galleryWrapperRef}
            className="relative h-screen"
            style={{ width: "240svw" }}
          >
            {helmetGalleryItems.map((item, i) => (
              <div
                key={i}
                className={`absolute ${item.className} ring-4 ring-black/60 rounded-4xl overflow-hidden hover:grayscale duration-300`}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="object-cover duration-300 hover:scale-105"
                />
                <span className="absolute bottom-4 left-4 text-white text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        ref={motorcyclistSectionRef}
        className="relative h-screen w-screen overflow-hidden"
      >
        <div
          ref={motorcyclistLeftRef}
          className="absolute left-0 top-1/2 h-[100vh] w-[30vw] -translate-y-1/2 will-change-transform"
        >
          <Image
            src="/Motorcyclist-2.webp"
            alt="Motorcyclist fleece side profile"
            fill
            sizes="30vw"
            className="object-contain min-w-[430px]"
          />

          <div className="text-black absolute left-[20vw] md:left-[35vw] top-1/2 text-center">
            <span className="text-3xl font-bold text-[#537807] block">Motorcyclist</span>
            <span className="text-3xl block">Motorcycle Helmet</span>
          </div>

        </div>

        <div
          ref={motorcyclistRightRef}
          className="absolute right-0 top-1/2 h-[100vh] w-[30vw] -translate-y-1/2 will-change-transform"
        >
          <Image
            src="/Motorcyclist-1.webp"
            alt="Motorcyclist helmet side profile"
            fill
            sizes="30vw"
            className="object-contain min-w-[430px]"
          />
          <div className="text-black absolute md:right-[30vw] right-[25vw] top-1/2 text-center">
            <span className="text-3xl font-bold text-red-800 block">Motorcyclist</span>
            <span className="text-3xl block">Motorcycle Helmet</span>
          </div>
        </div>
        <div
          ref={motorcyclistHeroSectionRef}
          className="pointer-events-none absolute inset-0 z-30 will-change-transform"
        >
          <Image
            src="/Motorcyclist-hero.webp"
            alt="Motorcyclist hero"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
}
