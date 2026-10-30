import { Sparkles } from "lucide-react";

interface PoetryReaderProps {
  stanzas?: string[][];
  body?: string[];
}

export function PoetryReader({ stanzas, body }: PoetryReaderProps) {
  // If stanzas array provided, render each stanza with preserved line breaks & authentic handwritten typography
  if (stanzas && stanzas.length > 0) {
    return (
      <div className="poetry-reader my-10 max-w-xl mx-auto space-y-8 sm:space-y-10 font-kalam">
        {stanzas.map((stanza, sIdx) => (
          <div
            key={sIdx}
            className="stanza pl-5 sm:pl-7 border-l-2 border-[#E8AF30]/60 space-y-2 transition-colors hover:border-[#E8AF30]"
          >
            {stanza.map((line, lIdx) => (
              <p
                key={lIdx}
                className="text-xl sm:text-2xl leading-relaxed sm:leading-loose text-[#3B3028] font-normal tracking-wide"
              >
                {line || "\u00A0"}
              </p>
            ))}
          </div>
        ))}

        {/* Delicate closing floral ornament */}
        <div className="pt-8 text-center" aria-hidden="true">
          <span className="inline-flex items-center gap-2 text-sm font-kalam text-[#718B55] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Finis • Verses in Bloom</span>
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
          </span>
        </div>
      </div>
    );
  }

  // Fallback for line-break formatted text in body
  return (
    <div className="poetry-reader my-10 max-w-xl mx-auto space-y-6 font-kalam">
      {body?.map((para, idx) => (
        <p
          key={idx}
          className="text-xl sm:text-2xl leading-relaxed text-[#3B3028] whitespace-pre-line pl-5 sm:pl-7 border-l-2 border-[#E8AF30]/60"
        >
          {para}
        </p>
      ))}
    </div>
  );
}
