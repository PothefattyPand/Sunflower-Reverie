import { PortableText, PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/sanity/image";

interface SanityPortableTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  className?: string;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-nunito text-lg sm:text-xl text-[#3B3028]/95 leading-relaxed mb-6 whitespace-pre-line">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="font-caveat text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3B3028] mt-10 mb-4 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-caveat text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B3028] mt-8 mb-4 leading-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] mt-7 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-patrick text-xl sm:text-2xl font-bold text-[#3B3028] mt-6 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 pl-6 border-l-4 border-[#E8AF30] font-kalam text-xl sm:text-2xl text-[#6B584C] italic bg-[#FFF3D9]/40 py-4 pr-5 rounded-r-2xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 space-y-2 mb-6 font-nunito text-lg sm:text-xl text-[#3B3028]/95">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 space-y-2 mb-6 font-nunito text-lg sm:text-xl text-[#3B3028]/95">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-[#3B3028]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => (
      <span className="underline decoration-[#E8AF30] decoration-2 underline-offset-4">
        {children}
      </span>
    ),
    link: ({ value, children }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      const target = value?.blank || isExternal ? "_blank" : undefined;
      const rel = target === "_blank" ? "noopener noreferrer" : undefined;
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className="text-[#E8AF30] underline hover:text-[#d4991c] font-semibold transition-colors"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value) return null;
      const imageUrl = urlForImage(value)?.url();
      if (!imageUrl) return null;
      return (
        <figure className="my-8 rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#FFF3D9]/40 p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={value.alt || "Botanical illustration"}
            className="max-h-[520px] w-auto mx-auto rounded-xl object-contain shadow-xs"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="mt-3 font-kalam text-sm text-[#6B584C]">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export function SanityPortableText({ value, className = "" }: SanityPortableTextProps) {
  if (!value) return null;
  return (
    <div className={`sanity-portable-text ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}

