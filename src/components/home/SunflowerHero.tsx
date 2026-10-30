"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import { AnimatedSunflower } from "./AnimatedSunflower";
import { FloatingPollen } from "./FloatingPollen";

interface SunflowerHeroProps {
  tagline?: string;
  welcomeMessage?: string;
}

export function SunflowerHero({ tagline, welcomeMessage }: SunflowerHeroProps) {
  return (
    <section className="relative min-h-[92vh] sm:min-h-[88vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#DCEFF8]/60 via-[#FFF3D9]/40 to-[#FFF9EC] border-b border-[#EADBCE]/60">
      {/* 1. Golden Glowing Sun & Sunlight Rays */}
      <div
        className="absolute top-6 right-6 sm:top-12 sm:right-20 pointer-events-none z-0"
        aria-hidden="true"
      >
        {/* Soft Radiating Aura */}
        <div className="absolute -inset-16 rounded-full bg-[#F4C542]/20 blur-3xl animate-[sun-glow_8s_ease-in-out_infinite]" />
        
        {/* Sun Core */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#E8AF30] via-[#F4C542] to-[#FFF8D6] shadow-[0_0_50px_rgba(244,197,66,0.55)]">
          {/* Subtle sun ray ring */}
          <div className="absolute -inset-4 rounded-full border border-dashed border-[#F4C542]/40 animate-[ray-shimmer_14s_linear_infinite]" />
        </div>
      </div>

      {/* 2. Delicate Translucent Sky Clouds */}
      <div className="absolute top-10 left-8 sm:left-24 pointer-events-none opacity-60 z-0" aria-hidden="true">
        <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
          <path
            d="M20 45 C15 35 25 20 45 22 C55 10 75 10 90 20 C105 12 125 15 130 28 C145 28 155 38 150 48 C145 56 130 56 120 52 C105 56 35 56 20 45 Z"
            fill="white"
            fillOpacity="0.75"
          />
        </svg>
      </div>

      <div className="absolute top-32 right-1/4 pointer-events-none opacity-40 hidden sm:block z-0" aria-hidden="true">
        <svg width="140" height="45" viewBox="0 0 140 45" fill="none">
          <path
            d="M15 35 C10 28 18 16 35 18 C42 8 58 8 70 16 C82 10 98 12 102 22 C114 22 122 30 118 38 C114 44 102 44 94 41 C82 44 27 44 15 35 Z"
            fill="white"
            fillOpacity="0.7"
          />
        </svg>
      </div>

      {/* 3. Floating Golden Pollen */}
      <FloatingPollen />

      {/* 4. Center Hero Text Content */}
      <Container className="relative z-20 pt-16 sm:pt-24 pb-8 sm:pb-12 text-center max-w-4xl mx-auto my-auto">
        <div className="space-y-6 sm:space-y-7">
          {/* Handwritten Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3D9]/90 border border-[#EADBCE] shadow-xs backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#E8AF30]" />
            <span className="text-sm font-patrick tracking-wider uppercase text-[#718B55]">
              A Quiet Handwritten Sanctuary
            </span>
          </div>

          {/* Main Title - Authentic, Expressive, Handwritten Caveat */}
          <h1 className="font-caveat text-6xl sm:text-8xl lg:text-9xl font-bold text-[#3B3028] leading-[1.02] drop-shadow-xs">
            Sunflower Reverie
          </h1>

          {/* Handwritten Literary Subtitle in Kalam */}
          <p className="font-kalam text-2xl sm:text-3xl text-[#6B584C] font-normal">
            &ldquo;{tagline || "Where thoughts bloom into words."}&rdquo;
          </p>

          {/* Welcoming Introduction in Nunito for Readability */}
          <p className="font-nunito text-base sm:text-lg text-[#3B3028]/90 max-w-2xl mx-auto leading-relaxed">
            {welcomeMessage ||
              "A little sanctuary for stories, poetry, reflections, and the beautiful things that words can hold. Freely written, quietly tended, and warmed by the gentle light of the morning sun."}
          </p>

          {/* Action Buttons in Patrick Hand */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/writings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Writings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#FFF9EC]/90 hover:bg-[#FFF3D9] text-[#3B3028] border-2 border-[#EADBCE] hover:border-[#E8AF30] font-patrick text-xl shadow-xs hover:shadow transition-all duration-300"
            >
              <BookOpen className="h-4 w-4 text-[#718B55]" />
              <span>Meet the Author</span>
            </Link>
          </div>
        </div>
      </Container>

      {/* 5. Garden Sunflower Layering (Foreground, Midground, Background) */}
      <div className="relative w-full h-44 sm:h-64 lg:h-76 pointer-events-none overflow-hidden z-10">
        {/* Soft garden ground mist gradient */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FFF9EC] via-[#FFF9EC]/70 to-transparent z-10" />

        {/* --- Background Flowers (Smaller, soft blur/depth) --- */}
        <div className="absolute -bottom-6 left-[8%] opacity-70 scale-75 hidden md:block">
          <AnimatedSunflower size="sm" delay={1.8} duration={8.5} swayAngle={2} tilt={-8} stemHeight={120} />
        </div>
        <div className="absolute -bottom-8 right-[12%] opacity-65 scale-75 hidden md:block">
          <AnimatedSunflower size="sm" delay={2.5} duration={7.8} swayAngle={-2.5} tilt={6} stemHeight={130} flip />
        </div>
        <div className="absolute -bottom-4 left-[30%] opacity-60 scale-60 hidden lg:block">
          <AnimatedSunflower size="sm" delay={0.8} duration={9} swayAngle={1.8} tilt={-3} stemHeight={110} />
        </div>
        <div className="absolute -bottom-6 right-[28%] opacity-60 scale-60 hidden lg:block">
          <AnimatedSunflower size="sm" delay={3} duration={8.2} swayAngle={-2} tilt={4} stemHeight={115} flip />
        </div>

        {/* --- Midground Flowers (Medium, framing the text gracefully) --- */}
        <div className="absolute -bottom-6 left-2 sm:left-[3%] scale-90 sm:scale-100">
          <AnimatedSunflower size="md" delay={0.2} duration={7.2} swayAngle={3.2} tilt={-5} stemHeight={180} />
        </div>
        <div className="absolute -bottom-8 right-2 sm:right-[3%] scale-90 sm:scale-100">
          <AnimatedSunflower size="md" delay={1.2} duration={6.8} swayAngle={-3} tilt={7} stemHeight={190} flip />
        </div>

        {/* --- Foreground Flowers (Large, anchoring the corners) --- */}
        <div className="absolute -bottom-10 -left-6 sm:left-[-1%] scale-95 sm:scale-110 lg:scale-125 z-10">
          <AnimatedSunflower size="lg" delay={0} duration={8} swayAngle={2.8} tilt={-2} stemHeight={240} />
        </div>
        <div className="absolute -bottom-12 -right-6 sm:right-[-1%] scale-95 sm:scale-110 lg:scale-125 z-10">
          <AnimatedSunflower size="lg" delay={1.5} duration={7.5} swayAngle={-3.2} tilt={3} stemHeight={250} flip />
        </div>
      </div>
    </section>
  );
}
