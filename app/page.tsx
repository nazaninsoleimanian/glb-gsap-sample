"use client";

import { Suspense, useEffect, useRef } from "react";
import { Bounds, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MotocycleHelmet from "./components/MotocycleHelmet";
import Lenis from "lenis";
import LoadingOverlay from "./components/LoadingOverlay";

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
    className: "left-[196vw] top-[46vh] h-[45vh] w-[40vw]",
  },
];

export default function Home() {
  const headerLogoRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);
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
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    lenis.scrollTo(0, { immediate: true });
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const headerLogo = headerLogoRef.current;
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

    if (
      !hero ||
      !headerLogo ||
      !canvasShell ||
      !firstLine ||
      !secondLine ||
      !gallerySection ||
      !galleryContainer ||
      !galleryWrapper ||
      !motorcyclistSection ||
      !motorcyclistLeft ||
      !motorcyclistRight ||
      !motorcyclistHeroSection
    )
      return;

    const ctx = gsap.context(() => {
      //----------------------------------------
      // Hero
      //----------------------------------------

      gsap.set(".canvas-inner", {
        scale: 1,
        transformOrigin: "center center",
      });

      gsap.fromTo(
        firstLine,
        {
          xPercent: 0,
        },
        {
          xPercent: -50,
          duration: 40,
          ease: "none",
          repeat: -1,
        },
      );

      gsap.fromTo(
        secondLine,
        {
          xPercent: -50,
        },
        {
          xPercent: 0,
          duration: 40,
          ease: "none",
          repeat: -1,
        },
      );
      gsap
        .timeline({
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
        })
        .to(".canvas-inner", {
          scale: 0.45,
          borderRadius: 36,
          ease: "none",
        });

      //----------------------------------------
      // Header Logo
      //----------------------------------------
      gsap.set(headerLogo, {
        transformOrigin: "left top",
        willChange: "left, top, transform, font-size",
      });

      gsap.fromTo(
        headerLogo,
        {
          left: "60%",
          top: "60%",
          fontSize: "clamp(6rem, 11vw, 11rem)",
          xPercent: -60,
          yPercent: -60,
        },
        {
          left: "1.5rem",
          top: "1rem",
          fontSize: "2rem",
          xPercent: 0,
          yPercent: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: hero,
            start: "top-=10 top",
            end: "+=160",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );

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

      const totalScroll = galleryWrapper.scrollWidth - window.innerWidth;

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
          scrub: 2,
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
      },
    );

    //----------------------------------------
    // Motorcyclist Hero
    //----------------------------------------

    gsap.set(motorcyclistHeroSection, {
      yPercent: 100,
    });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: motorcyclistSection,
          start: "top top",
          end: "+=100%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      .to(motorcyclistHeroSection, {
        yPercent: 0,
        ease: "none",
      });

    const refreshFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LoadingOverlay />

      <header className="pointer-events-none fixed inset-0 z-120">
        <span
          ref={headerLogoRef}
          className="animated-logo-gradient absolute overflow-visible whitespace-nowrap px-3 py-1 text-center font-serif text-4xl font-black italic leading-none tracking-[-0.045em] [will-change:transform]"
        >
          Advanced Analytics Australia
        </span>
      </header>

      <main className="min-h-screen w-screen overflow-x-hidden font-serif">

        {/* ------------------     HERO SECTION     ---------------------- */}

        <section ref={heroRef} className="relative h-screen w-screen">
          <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 overflow-hidden text-center text-[clamp(2.5rem,9vw,9rem)] font-black uppercase leading-none tracking-[-0.02em]">
              <div className="marquee w-full overflow-hidden">
                <div ref={firstLineRef} className="flex w-max whitespace-nowrap">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className="flex-none bg-linear-to-r from-[#4b0305]/90 via-[#b91c1c] to-[#f97316]/90 bg-clip-text px-6 text-transparent drop-shadow-[0_14px_30px_rgba(127,29,29,0.35)]"
                    >
                      Expert Safety Hazard Analysis
                    </span>
                  ))}
                </div>
              </div>
              <div className="marquee w-full overflow-hidden">
                <div ref={secondLineRef} className="flex w-max whitespace-nowrap">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className="flex-none bg-linear-to-r from-[#111111]/85 via-[#4b5563] to-[#9ca3af]/80 bg-clip-text px-6 text-transparent drop-shadow-[0_14px_30px_rgba(0,0,0,0.25)]"
                    >
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
                    dpr={[1, 1.5]}
                    resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
                    shadows
                  >
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <Suspense fallback={null}>
                      <Bounds fit clip observe={false} margin={1.4}>
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

        {/* ------------------     TEXT SECTION     ---------------------- */}

        <section className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
          <div className="flex max-w-7xl flex-col items-center gap-8 px-8 text-center">
            <span className="text-sm font-black uppercase tracking-[0.55em] text-red-950/50">
              Protection Meets Performance
            </span>
            <h2 className="animated-gradient-title text-[clamp(3rem,9vw,9rem)] font-black uppercase leading-[0.85] tracking-[-0.07em] drop-shadow-[0_18px_45px_rgba(159,29,32,0.22)]">
              Engineered for impact
            </h2>
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
          </div>
        </section>

        {/* ------------------     GALLERY SECTION     ---------------------- */}

        <section
          ref={gallerySectionRef}
          className="relative h-screen w-screen overflow-hidden"
        >
          <div ref={galleryContainerRef} className="absolute inset-0">
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

        {/* ------------------     MOTORCYCLIST SECTION     ---------------------- */}

        <section
          ref={motorcyclistSectionRef}
          className="relative h-screen w-screen overflow-hidden"
        >
          <div
            ref={motorcyclistLeftRef}
            className="absolute left-0 top-1/2 h-screen w-[30vw] -translate-y-1/2 will-change-transform"
          >
            <Image
              src="/Motorcyclist-2.webp"
              alt="Motorcyclist fleece side profile"
              fill
              sizes="30vw"
              className="object-contain min-w-107.5"
            />

            <div className="text-black absolute left-[20vw] md:left-[35vw] top-1/2 text-center">
              <span className="text-3xl font-bold text-[#537807] block">
                Motorcyclist
              </span>
              <span className="text-3xl block">Motorcycle Helmet</span>
            </div>
          </div>

          <div
            ref={motorcyclistRightRef}
            className="absolute right-0 top-1/2 h-screen w-[30vw] -translate-y-1/2 will-change-transform"
          >
            <Image
              src="/Motorcyclist-1.webp"
              alt="Motorcyclist helmet side profile"
              fill
              sizes="30vw"
              className="object-contain min-w-107.5"
            />
            <div className="text-black absolute md:right-[30vw] right-[25vw] top-1/2 text-center">
              <span className="text-3xl font-bold text-red-800 block">
                Motorcyclist
              </span>
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
      </main></>
  );
}
