"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Mail, Rss, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";

export function Footer() {
  const pathname = usePathname();

  // Hide footer inside Author Dashboard workspace
  if (pathname?.startsWith("/author/dashboard")) {
    return null;
  }

  return (
    <footer className="mt-auto bg-[#FFF3D9] border-t border-[#EADBCE] text-[#3B3028] pt-16 pb-12 transition-colors">
      <Container className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#EADBCE]">
          {/* Brand & Manifesto Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#E8AF30]/20 border border-[#E8AF30] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#E8AF30]" />
              </div>
              <span className="font-caveat text-3xl font-bold tracking-tight text-[#3B3028]">
                Sunflower Reverie
              </span>
            </div>

            <p className="font-kalam text-sm text-[#6B584C] leading-relaxed max-w-sm">
              &ldquo;Where thoughts bloom into words.&rdquo; A cheerful literary publishing sanctuary
              inspired by sunflowers, warm sunshine, and quiet positivity.
            </p>

            <p className="font-nunito text-xs text-[#718B55] font-bold">
              Free to read, tended with patience and light.
            </p>
          </div>

          {/* Navigation Column 1 */}
          <div className="space-y-3">
            <h4 className="font-patrick text-xl font-bold text-[#3B3028] tracking-wide">
              The Sanctuary
            </h4>
            <ul className="space-y-2 text-base text-[#6B584C] font-patrick">
              <li>
                <Link href="/" className="hover:text-[#3B3028] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3B3028] transition-colors">
                  Meet the Authors
                </Link>
              </li>
              <li>
                <Link href="/writings" className="hover:text-[#3B3028] transition-colors">
                  Explore Writings
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="space-y-3">
            <h4 className="font-patrick text-xl font-bold text-[#3B3028] tracking-wide">
              Folios &amp; Categories
            </h4>
            <ul className="space-y-2 text-base text-[#6B584C] font-patrick">
              <li>
                <Link href="/blogs" className="hover:text-[#3B3028] transition-colors">
                  Blogs &amp; Dispatches
                </Link>
              </li>
              <li>
                <Link href="/poetry" className="hover:text-[#3B3028] transition-colors">
                  Poetry &amp; Cadence
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[#3B3028] transition-colors">
                  The Garden Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social Placeholders */}
          <div className="space-y-3">
            <h4 className="font-patrick text-xl font-bold text-[#3B3028] tracking-wide">
              Correspondence
            </h4>
            <p className="font-nunito text-xs text-[#6B584C] leading-relaxed">
              For literary inquiries, letters to the authors, or gentle greetings:
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-[#3B3028] hover:text-[#E8AF30] transition-colors font-patrick">
              <Mail className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>letters@sunflowerreverie.com</span>
            </div>

            {/* Social media placeholders */}
            <div className="pt-2">
              <span className="text-[11px] font-nunito uppercase tracking-widest text-[#718B55] font-bold block mb-2">
                Follow the Bloom
              </span>
              <div className="flex items-center gap-3 text-sm text-[#6B584C] font-patrick">
                <span className="hover:text-[#3B3028] cursor-pointer transition-colors">Substack</span>
                <span>•</span>
                <span className="hover:text-[#3B3028] cursor-pointer transition-colors">Goodreads</span>
                <span>•</span>
                <span className="hover:text-[#3B3028] cursor-pointer transition-colors flex items-center gap-1">
                  <Rss className="w-3 h-3 text-[#E8AF30]" /> RSS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B584C] font-nunito">
          <p className="flex items-center gap-1 font-medium">
            <span>&copy; 2026 Sunflower Reverie. All rights reserved.</span>
          </p>
          <p className="flex items-center gap-1 text-[11px] text-[#718B55] font-bold">
            <span>Crafted with gentle words &amp; golden sunshine</span>
            <Heart className="w-3.5 h-3.5 text-[#F4C542] fill-[#F4C542]" />
          </p>
        </div>
      </Container>
    </footer>
  );
}
