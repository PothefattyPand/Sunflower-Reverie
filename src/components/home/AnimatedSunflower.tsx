"use client";

import { motion } from "motion/react";

interface AnimatedSunflowerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  delay?: number;
  duration?: number;
  swayAngle?: number;
  tilt?: number;
  withStem?: boolean;
  stemHeight?: number;
  flip?: boolean;
}

export function AnimatedSunflower({
  size = "md",
  className = "",
  delay = 0,
  duration = 7,
  swayAngle = 3,
  tilt = 0,
  withStem = true,
  stemHeight = 160,
  flip = false,
}: AnimatedSunflowerProps) {
  // Dimension presets
  const sizeMap = {
    sm: { flower: 90, totalW: 130, totalH: withStem ? 180 : 90 },
    md: { flower: 140, totalW: 190, totalH: withStem ? 260 : 140 },
    lg: { flower: 200, totalW: 260, totalH: withStem ? 360 : 200 },
    xl: { flower: 280, totalW: 340, totalH: withStem ? 480 : 280 },
  };

  const dims = sizeMap[size];

  // Petal generation (24 outer, 24 inner offset by 7.5 deg)
  const outerPetals = Array.from({ length: 24 }).map((_, i) => i * 15);
  const innerPetals = Array.from({ length: 24 }).map((_, i) => i * 15 + 7.5);

  return (
    <motion.div
      className={`inline-block select-none pointer-events-none ${className}`}
      initial={{ rotate: tilt }}
      animate={{
        rotate: [tilt, tilt + swayAngle, tilt, tilt - swayAngle * 0.6, tilt],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{
        transformOrigin: withStem ? "bottom center" : "center center",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <svg
        width={dims.totalW}
        height={dims.totalH}
        viewBox={`0 0 ${dims.totalW} ${dims.totalH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* Radial gradient for central disk */}
          <radialGradient
            id="centerDiskGrad"
            cx="50%"
            cy="50%"
            r="50%"
            fx="40%"
            fy="40%"
          >
            <stop offset="0%" stopColor="#533E2D" />
            <stop offset="60%" stopColor="#3B3028" />
            <stop offset="90%" stopColor="#2A221C" />
            <stop offset="100%" stopColor="#E8AF30" />
          </radialGradient>

          {/* Linear gradient for outer golden petals */}
          <linearGradient id="outerPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F9D462" />
            <stop offset="40%" stopColor="#F4C542" />
            <stop offset="100%" stopColor="#D99419" />
          </linearGradient>

          {/* Linear gradient for inner vibrant petals */}
          <linearGradient id="innerPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFEA8A" />
            <stop offset="50%" stopColor="#F4C542" />
            <stop offset="100%" stopColor="#E8AF30" />
          </linearGradient>

          {/* Stem & leaf gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C7544" />
            <stop offset="50%" stopColor="#718B55" />
            <stop offset="100%" stopColor="#89A569" />
          </linearGradient>

          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84A164" />
            <stop offset="50%" stopColor="#718B55" />
            <stop offset="100%" stopColor="#556C3E" />
          </linearGradient>
        </defs>

        {withStem && (
          <g id="stem-and-leaves">
            {/* Natural curved stem */}
            <path
              d={`M ${dims.totalW / 2} ${dims.flower / 2 + 10} Q ${dims.totalW / 2 - 12} ${
                dims.flower / 2 + stemHeight * 0.5
              } ${dims.totalW / 2 + 6} ${dims.totalH}`}
              stroke="url(#stemGrad)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Inner stem highlight */}
            <path
              d={`M ${dims.totalW / 2 + 1} ${dims.flower / 2 + 15} Q ${dims.totalW / 2 - 10} ${
                dims.flower / 2 + stemHeight * 0.5
              } ${dims.totalW / 2 + 7} ${dims.totalH}`}
              stroke="#8BA96D"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Left Leaf */}
            <g transform={`translate(${dims.totalW / 2 - 32}, ${dims.flower / 2 + 55}) rotate(-22)`}>
              <path
                d="M0 10 C-30 -15 -45 20 0 45 C45 20 30 -15 0 10 Z"
                fill="url(#leafGrad)"
                stroke="#556C3E"
                strokeWidth="1.2"
              />
              {/* Leaf veins */}
              <path d="M0 12 L0 42" stroke="#9BB87F" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M0 22 Q-10 18 -18 16" stroke="#9BB87F" strokeWidth="0.8" fill="none" />
              <path d="M0 28 Q-12 26 -22 24" stroke="#9BB87F" strokeWidth="0.8" fill="none" />
              <path d="M0 22 Q10 18 18 16" stroke="#9BB87F" strokeWidth="0.8" fill="none" />
              <path d="M0 28 Q12 26 22 24" stroke="#9BB87F" strokeWidth="0.8" fill="none" />
            </g>

            {/* Right Leaf */}
            <g transform={`translate(${dims.totalW / 2 + 28}, ${dims.flower / 2 + 90}) rotate(30)`}>
              <path
                d="M0 8 C-25 -12 -38 16 0 38 C38 16 25 -12 0 8 Z"
                fill="url(#leafGrad)"
                stroke="#556C3E"
                strokeWidth="1.2"
              />
              <path d="M0 10 L0 36" stroke="#9BB87F" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M0 18 Q10 15 16 13" stroke="#9BB87F" strokeWidth="0.8" fill="none" />
              <path d="M0 24 Q10 22 18 20" stroke="#9BB87F" strokeWidth="0.8" fill="none" />
            </g>
          </g>
        )}

        {/* Flower Head */}
        <g transform={`translate(${dims.totalW / 2}, ${dims.flower / 2})`}>
          {/* Calyx base backing */}
          <circle r={dims.flower * 0.38} fill="#5C7544" />

          {/* Outer Petals */}
          {outerPetals.map((angle) => (
            <g key={`outer-${angle}`} transform={`rotate(${angle})`}>
              <path
                d={`M 0 0 C -${dims.flower * 0.08} -${dims.flower * 0.18} -${dims.flower * 0.06} -${
                  dims.flower * 0.46
                } 0 -${dims.flower * 0.49} C ${dims.flower * 0.06} -${dims.flower * 0.46} ${
                  dims.flower * 0.08
                } -${dims.flower * 0.18} 0 0 Z`}
                fill="url(#outerPetalGrad)"
                stroke="#D99419"
                strokeWidth="0.6"
              />
            </g>
          ))}

          {/* Inner Petals */}
          {innerPetals.map((angle) => (
            <g key={`inner-${angle}`} transform={`rotate(${angle})`}>
              <path
                d={`M 0 0 C -${dims.flower * 0.07} -${dims.flower * 0.15} -${dims.flower * 0.05} -${
                  dims.flower * 0.42
                } 0 -${dims.flower * 0.45} C ${dims.flower * 0.05} -${dims.flower * 0.42} ${
                  dims.flower * 0.07
                } -${dims.flower * 0.15} 0 0 Z`}
                fill="url(#innerPetalGrad)"
                stroke="#E8AF30"
                strokeWidth="0.6"
              />
            </g>
          ))}

          {/* Seed Rim Floret Ring */}
          <circle
            r={dims.flower * 0.23}
            fill="none"
            stroke="#C77C0E"
            strokeWidth="2.5"
            strokeDasharray="2 3"
            opacity="0.85"
          />

          {/* Central Seed Disk */}
          <circle
            r={dims.flower * 0.21}
            fill="url(#centerDiskGrad)"
            stroke="#2E251E"
            strokeWidth="1.2"
          />

          {/* Delicate Fibonacci spiral seed dots */}
          <circle
            r={dims.flower * 0.14}
            fill="none"
            stroke="#E8AF30"
            strokeWidth="1.5"
            strokeDasharray="2 4"
            opacity="0.5"
          />
          <circle
            r={dims.flower * 0.08}
            fill="none"
            stroke="#F4C542"
            strokeWidth="1.2"
            strokeDasharray="1.5 3"
            opacity="0.6"
          />
          <circle r={dims.flower * 0.03} fill="#533E2D" />
        </g>
      </svg>
    </motion.div>
  );
}

