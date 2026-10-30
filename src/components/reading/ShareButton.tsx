"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    
    // Try native share API if supported and on mobile
    if (typeof navigator !== "undefined" && navigator.share && /mobile/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Fallback to clipboard copy
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback prompt
        window.prompt("Copy link to publication:", url);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#6B584C] bg-[#FFF3D9] hover:bg-[#F4C542]/30 border border-[#EADBCE] hover:border-[#E8AF30] transition-colors focus-visible:outline-2 focus-visible:outline-[#E8AF30]"
      aria-label="Share or copy publication link"
      title="Share or copy link"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#718B55]" />
          <span className="text-[#718B55] font-semibold">Link copied to clipboard!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-[#E8AF30]" />
          <span>Share Reading</span>
          <Copy className="w-3 h-3 text-[#6B584C]/70 ml-0.5" />
        </>
      )}
    </button>
  );
}

