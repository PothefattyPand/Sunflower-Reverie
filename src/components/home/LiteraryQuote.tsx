import { Quote, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";

export function LiteraryQuote() {
  return (
    <section className="py-24 sm:py-32 bg-[#FFF3D9] border-b border-[#EADBCE]/80 relative overflow-hidden">
      {/* Subtle Botanical Watermark Motif */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5 select-none"
        aria-hidden="true"
      >
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="text-[#3B3028]">
          <circle cx="50" cy="50" r="30" />
        </svg>
      </div>

      <Container className="relative max-w-4xl text-center px-6">
        {/* Eyebrow marker */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-xs uppercase tracking-widest text-[#718B55] mb-8 shadow-xs font-patrick">
          <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
          <span>Section 4 • Literary Respite</span>
        </div>

        {/* Decorative Quote Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-[#FFF9EC] border border-[#EADBCE] flex items-center justify-center text-[#E8AF30] mb-8 shadow-xs">
          <Quote className="w-6 h-6 stroke-[1.5]" />
        </div>

        {/* Authentic Handwritten Literary Quote in Kalam */}
        <blockquote className="space-y-6">
          <p className="font-kalam text-2xl sm:text-3xl lg:text-4xl text-[#3B3028] leading-relaxed tracking-normal">
            &ldquo;Turn your face toward the morning sun, and the shadows fall behind you.
            Write not to impress the crowd, but to preserve the tender grace of being alive.&rdquo;
          </p>

          <footer className="pt-4 flex flex-col items-center space-y-1.5">
            <div className="h-1 w-16 bg-[#E8AF30] rounded-full mb-2" />
            <cite className="font-patrick text-base uppercase tracking-wider text-[#6B584C] font-semibold not-italic">
              Sample Literary Contemplation
            </cite>
            <span className="text-xs text-[#718B55] font-nunito">
              Demonstration text for the quiet reading sanctuary
            </span>
          </footer>
        </blockquote>
      </Container>
    </section>
  );
}
