interface PollenParticle {
  id: number;
  left: number; // percentage
  top: number; // percentage
  size: number;
  duration: number;
  delay: number;
  blur: number;
  opacity: number;
}

const PARTICLES: PollenParticle[] = [
  { id: 1, left: 12, top: 40, size: 5, duration: 9, delay: 0, blur: 0, opacity: 0.65 },
  { id: 2, left: 24, top: 65, size: 7, duration: 11, delay: 1.5, blur: 1, opacity: 0.5 },
  { id: 3, left: 35, top: 25, size: 4, duration: 8, delay: 3, blur: 0, opacity: 0.7 },
  { id: 4, left: 48, top: 75, size: 6, duration: 10, delay: 0.5, blur: 0.5, opacity: 0.6 },
  { id: 5, left: 62, top: 30, size: 8, duration: 12, delay: 2, blur: 1.5, opacity: 0.4 },
  { id: 6, left: 74, top: 55, size: 4, duration: 7.5, delay: 4, blur: 0, opacity: 0.65 },
  { id: 7, left: 86, top: 35, size: 6, duration: 9.5, delay: 1, blur: 0.5, opacity: 0.55 },
  { id: 8, left: 18, top: 80, size: 5, duration: 10.5, delay: 2.5, blur: 0, opacity: 0.7 },
  { id: 9, left: 80, top: 70, size: 6, duration: 8.5, delay: 3.5, blur: 1, opacity: 0.45 },
  { id: 10, left: 52, top: 50, size: 4, duration: 11.5, delay: 4.5, blur: 0, opacity: 0.6 },
];

export function FloatingPollen() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-gradient-to-t from-[#E8AF30] to-[#F4C542]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: "0 0 6px rgba(244, 197, 66, 0.6)",
          }}
        />
      ))}
    </div>
  );
}
