"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import { AnimatedSunflower } from "./AnimatedSunflower";
import { GardenGround } from "./GardenGround";
import { StorybookClouds } from "./StorybookClouds";
import { FloatingPollen } from "./FloatingPollen";

interface SunflowerHeroProps {
  tagline?: string;
  welcomeMessage?: string;
}

export function SunflowerHero({ tagline, welcomeMessage }: SunflowerHeroProps) {
  return (
    <section className="relative min-h-[96vh] sm:min-h-[94vh] lg:min-h-[92vh] flex flex-col justify-between overflow-x-clip bg-gradient-to-b from-[#DDF3FA] via-[#EBF7FC] via-50% to-[#FAF5E8] border-b border-[#EADBCE]/60">
      {/* 1. Golden Glowing Sun & Warm Sunlight Rays */}
      <div
        className="absolute top-6 right-6 sm:top-10 sm:right-16 lg:top-14 lg:right-28 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {/* Soft Radiating Warmth Aura */}
        <div className="absolute -inset-16 sm:-inset-24 rounded-full bg-[#FFE39A]/35 blur-3xl animate-[sun-glow_8s_ease-in-out_infinite]" />
        <div className="absolute -inset-8 sm:-inset-12 rounded-full bg-[#F7C948]/20 blur-xl" />

        {/* Golden Sun Core */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-tr from-[#E8AF30] via-[#F7C948] to-[#FFF9E6] shadow-[0_0_45px_rgba(247,201,72,0.55)]">
          {/* Delicate rotating sun ray ring */}
          <div className="absolute -inset-3 sm:-inset-4 rounded-full border border-dashed border-[#F7C948]/45 animate-[ray-shimmer_16s_linear_infinite]" />
        </div>
      </div>

      {/* 2. Storybook Clouds drifting gently across the upper sky */}
      <StorybookClouds />

      {/* 3. Floating Golden Sunlight Pollen */}
      <FloatingPollen />

      {/* 4. Center Hero Text Content (Positioned proudly under the open blue sky) */}
      <Container className="relative z-20 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 text-center max-w-4xl mx-auto my-auto">
        <div className="space-y-5 sm:space-y-6">
          {/* Handwritten Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 border border-[#CFE4ED] shadow-xs backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#E8AF30]" />
            <span className="text-sm font-patrick tracking-wider uppercase text-[#547E3D] font-bold">
              A Quiet Handwritten Sanctuary
            </span>
          </div>

          {/* Main Title - Authentic, Expressive, Handwritten Caveat */}
          <h1 className="font-caveat text-6xl sm:text-8xl lg:text-9xl font-bold text-[#47372C] leading-[1.02] drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]">
            Sunflower Reverie
          </h1>

          {/* Handwritten Literary Subtitle in Kalam */}
          <p className="font-kalam text-2xl sm:text-3xl text-[#5C483A] font-medium max-w-2xl mx-auto">
            &ldquo;{tagline || "Where thoughts bloom into words."}&rdquo;
          </p>

          {/* Welcoming Introduction in Nunito for Readability */}
          <p className="font-nunito text-base sm:text-lg text-[#47372C]/90 max-w-2xl mx-auto leading-relaxed">
            {welcomeMessage ||
              "A little sanctuary for stories, poetry, reflections, and the beautiful things that words can hold. Freely written, quietly tended, and warmed by the gentle light of the morning sun."}
          </p>

          {/* Action Buttons in Patrick Hand */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/writings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#F7C948] hover:bg-[#F9D462] text-[#3B3028] font-patrick text-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 border border-[#E8AF30]/40"
            >
              <span>Explore Writings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white/90 hover:bg-[#FFF8EA] text-[#3B3028] border-2 border-[#D5E6EC] hover:border-[#F7C948] font-patrick text-xl font-bold shadow-xs hover:shadow transition-all duration-300"
            >
              <BookOpen className="h-4 w-4 text-[#547E3D]" />
              <span>Meet the Author</span>
            </Link>
          </div>
        </div>
      </Container>

      {/* 5. Sunflower Garden Ground Scene (Rooted in the lush landscape) */}
      <div className="relative w-full overflow-x-clip pointer-events-none select-none z-10 mt-auto">
        {/* --- Left Garden Bed Sunflowers (Firmly rooted, no edge clipping) --- */}
        {/* Tall Stately Hero Sunflower */}
        <div className="absolute bottom-6 sm:bottom-12 md:bottom-14 left-0 sm:left-6 md:left-12 lg:left-16 z-20 scale-65 sm:scale-90 md:scale-100 lg:scale-105 origin-bottom-left">
          <AnimatedSunflower
            size="lg"
            stemHeight={230}
            tilt={-3}
            swayAngle={2.6}
            duration={8}
            delay={0}
          />
        </div>

        {/* Mid-height Companion Sunflower */}
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-20 sm:left-28 md:left-40 lg:left-52 z-15 scale-75 sm:scale-85 md:scale-95 origin-bottom-left hidden sm:block">
          <AnimatedSunflower
            size="md"
            stemHeight={170}
            tilt={4}
            swayAngle={-3}
            duration={7.2}
            delay={1.2}
            flip
          />
        </div>

        {/* Distant Young Sunflower */}
        <div className="absolute bottom-18 sm:bottom-22 md:bottom-26 left-32 sm:left-52 md:left-68 lg:left-84 z-10 scale-75 sm:scale-80 md:scale-85 origin-bottom-left hidden md:block opacity-90">
          <AnimatedSunflower
            size="sm"
            stemHeight={120}
            tilt={-2}
            swayAngle={2}
            duration={8.8}
            delay={2.4}
            leafCount={1}
          />
        </div>

        {/* --- Right Garden Bed Sunflowers (Firmly rooted, mirrored facing inward) --- */}
        {/* Tall Radiant Hero Sunflower */}
        <div className="absolute bottom-6 sm:bottom-12 md:bottom-14 right-0 sm:right-6 md:right-12 lg:right-16 z-20 scale-65 sm:scale-90 md:scale-100 lg:scale-105 origin-bottom-right">
          <AnimatedSunflower
            size="lg"
            stemHeight={240}
            tilt={3}
            swayAngle={-2.8}
            duration={8.4}
            delay={1.5}
            flip
          />
        </div>

        {/* Mid-height Companion Sunflower */}
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 right-20 sm:right-28 md:right-40 lg:right-52 z-15 scale-75 sm:scale-85 md:scale-95 origin-bottom-right hidden sm:block">
          <AnimatedSunflower
            size="md"
            stemHeight={175}
            tilt={-4}
            swayAngle={3}
            duration={6.8}
            delay={0.8}
          />
        </div>

        {/* Distant Young Sunflower */}
        <div className="absolute bottom-18 sm:bottom-22 md:bottom-26 right-32 sm:right-52 md:right-68 lg:right-84 z-10 scale-75 sm:scale-80 md:scale-85 origin-bottom-right hidden md:block opacity-90">
          <AnimatedSunflower
            size="sm"
            stemHeight={125}
            tilt={3}
            swayAngle={-2.2}
            duration={9.2}
            delay={3.1}
            flip
            leafCount={1}
          />
        </div>

        {/* --- Distant Horizon Sunflowers (Small background blooms peeking over rolling hills) --- */}
        <div className="absolute bottom-24 sm:bottom-28 left-[35%] z-5 scale-60 origin-bottom hidden lg:block opacity-70">
          <AnimatedSunflower
            size="sm"
            stemHeight={90}
            tilt={-3}
            swayAngle={1.8}
            duration={9.5}
            delay={1.8}
            leafCount={1}
          />
        </div>
        <div className="absolute bottom-24 sm:bottom-28 right-[35%] z-5 scale-60 origin-bottom hidden lg:block opacity-70">
          <AnimatedSunflower
            size="sm"
            stemHeight={95}
            tilt={2}
            swayAngle={-1.8}
            duration={8.6}
            delay={2.7}
            flip
            leafCount={1}
          />
        </div>

        {/* --- The Continuous Grassy Garden Landscape (Spanning 100% width) --- */}
        <GardenGround />
      </div>
    </section>
  );
}
