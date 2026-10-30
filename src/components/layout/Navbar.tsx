"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/common/Container";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blogs", href: "/blogs" },
  { label: "Poetry", href: "/poetry" },
  { label: "Journal", href: "/journal" },
  { label: "Writings", href: "/writings" },
];

/**
 * Custom SVG Sunflower Brand Emblem
 */
function SunflowerEmblem({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(20, 20)">
        {/* Petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <path
            key={angle}
            d="M0 0 C-3 -6 -2 -16 0 -18 C2 -16 3 -6 0 0 Z"
            fill="#F4C542"
            stroke="#E8AF30"
            strokeWidth="0.8"
            transform={`rotate(${angle})`}
          />
        ))}
        {/* Seed Center */}
        <circle r="7.5" fill="#3B3028" stroke="#E8AF30" strokeWidth="1" />
        <circle r="4" fill="#503C2C" stroke="#F4C542" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
      </g>
    </svg>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Do not display website header inside Author Dashboard workspace
  if (pathname?.startsWith("/author/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FFF9EC]/95 backdrop-blur-md border-b border-[#EADBCE]/70 shadow-xs transition-colors">
      <Container className="flex h-18 items-center justify-between">
        {/* Brand Logo - Handwritten Caveat Brand Emblem */}
        <Link
          href="/"
          className="flex items-center gap-3 text-[#3B3028] hover:text-[#E8AF30] transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8AF30] rounded-sm"
          aria-label="Sunflower Reverie Homepage"
        >
          <div className="p-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] group-hover:border-[#E8AF30] group-hover:scale-105 transition-transform duration-300">
            <SunflowerEmblem className="w-6 h-6 animate-[spin_24s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <span className="font-caveat text-2xl sm:text-3xl font-bold tracking-tight leading-none text-[#3B3028]">
              Sunflower Reverie
            </span>
            <span className="text-xs font-patrick tracking-wider text-[#718B55] mt-0.5">
              Literary Publishing
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Patrick Hand */}
        <nav aria-label="Primary Navigation" className="hidden md:block">
          <ul className="flex items-center gap-1.5 lg:gap-3 text-lg font-patrick">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`relative px-4 py-1.5 rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#E8AF30] ${
                      isActive
                        ? "text-[#3B3028] font-bold bg-[#FFF3D9] border border-[#EADBCE]"
                        : "text-[#6B584C] hover:text-[#3B3028] hover:bg-[#FFF3D9]/60"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#E8AF30]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Menu Hamburger Button */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="p-2 rounded-lg text-[#3B3028] hover:bg-[#FFF3D9] border border-[#EADBCE] focus-visible:outline-2 focus-visible:outline-[#E8AF30] transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b border-[#EADBCE] bg-[#FFF9EC] px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-200"
          id="mobile-navigation"
        >
          <nav aria-label="Mobile Navigation">
            <ul className="flex flex-col space-y-2 font-patrick text-xl">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[#FFF3D9] text-[#3B3028] font-bold border border-[#EADBCE]"
                          : "text-[#6B584C] hover:bg-[#FFF3D9]/60 hover:text-[#3B3028]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#E8AF30]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
