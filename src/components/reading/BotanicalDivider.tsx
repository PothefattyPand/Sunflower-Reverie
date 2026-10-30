import { Sparkles } from "lucide-react";

interface BotanicalDividerProps {
  className?: string;
}

export function BotanicalDivider({ className = "my-12" }: BotanicalDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-[#E8AF30]/70 select-none ${className}`} aria-hidden="true">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#EADBCE]" />
      <span className="w-1.5 h-1.5 rounded-full bg-[#E8AF30]" />
      <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
      <span className="w-1.5 h-1.5 rounded-full bg-[#E8AF30]" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#EADBCE]" />
    </div>
  );
}

