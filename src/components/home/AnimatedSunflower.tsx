"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

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
  leafCount?: 1 | 2;
}

export function AnimatedSunflower({
  size = "md",
  className = "",
  delay = 0,
  duration = 7,
  swayAngle = 3,
  tilt = 0,
  withStem = true,
  stemHeight,
  flip = false,
  leafCount = 2,
}: AnimatedSunflowerProps) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "_");

  // Dimension presets
  const sizeMap = {
    sm: { flower: 80, totalW: 120, defaultStem: 110 },
    md: { flower: 120, totalW: 170, defaultStem: 160 },
    lg: { flower: 170, totalW: 240, defaultStem: 220 },
    xl: { flower: 220, totalW: 310, defaultStem: 280 },
  };

  const preset = sizeMap[size];
  const flower = preset.flower;
  const actualStemHeight = stemHeight ?? preset.defaultStem;
  const totalW = preset.totalW;
  const totalH = withStem ? flower + actualStemHeight : flower;
  const flowerCenterY = flower / 2 + 10;
  const flowerCenterX = totalW / 2;

  // Petal generation (24 outer, 24 inner offset by 7.5 deg)
  const outerPetals = Array.from({ length: 24 }).map((_, i) => i * 15);
  const innerPetals = Array.from({ length: 24 }).map((_, i) => i * 15 + 7.5);

  const centerDiskGradId = `centerDiskGrad_${id}`;
  const outerPetalGradId = `outerPetalGrad_${id}`;
  const innerPetalGradId = `innerPetalGrad_${id}`;
  const stemGradId = `stemGrad_${id}`;
  const leafGradId = `leafGrad_${id}`;

  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`inline-block select-none pointer-events-none ${className}`}
      initial={{ rotate: tilt }}
      animate={
        shouldReduceMotion
          ? { rotate: tilt }
          : {
              rotate: [tilt, tilt + swayAngle, tilt, tilt - swayAngle * 0.7, tilt],
            }
      }
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
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-xs"
      >
        <defs>
          {/* Radial gradient for central disk */}
          <radialGradient
            id={centerDiskGradId}
            cx="50%"
            cy="50%"
            r="50%"
            fx="42%"
            fy="42%"
          >
            <stop offset="0%" stopColor="#5B4533" />
            <stop offset="65%" stopColor="#3E3025" />
            <stop offset="90%" stopColor="#2A2018" />
            <stop offset="100%" stopColor="#E8AF30" />
          </radialGradient>

          {/* Linear gradient for outer golden petals */}
          <linearGradient id={outerPetalGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE17A" />
            <stop offset="45%" stopColor="#F7C948" />
            <stop offset="100%" stopColor="#D99419" />
          </linearGradient>

          {/* Linear gradient for inner vibrant petals */}
          <linearGradient id={innerPetalGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF199" />
            <stop offset="50%" stopColor="#F7C948" />
            <stop offset="100%" stopColor="#E8AF30" />
          </linearGradient>

          {/* Stem gradient */}
          <linearGradient id={stemGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#55753C" />
            <stop offset="50%" stopColor="#6E9B58" />
            <stop offset="100%" stopColor="#89B16E" />
          </linearGradient>

          {/* Leaf gradient */}
          <linearGradient id={leafGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86AC66" />
            <stop offset="50%" stopColor="#6E9B58" />
            <stop offset="100%" stopColor="#4E7134" />
          </linearGradient>
        </defs>

        {withStem && (
          <g id="stem-and-leaves">
            {/* Natural curved stem reaching all the way to totalH */}
            <path
              d={`M ${flowerCenterX} ${flowerCenterY + 8} Q ${flowerCenterX - 10} ${
                flowerCenterY + actualStemHeight * 0.5
              } ${flowerCenterX + 4} ${totalH}`}
              stroke={`url(#${stemGradId})`}
              strokeWidth={Math.max(6, flower * 0.055)}
              strokeLinecap="round"
            />
            {/* Inner stem soft highlight line */}
            <path
              d={`M ${flowerCenterX + 1} ${flowerCenterY + 12} Q ${flowerCenterX - 8} ${
                flowerCenterY + actualStemHeight * 0.5
              } ${flowerCenterX + 5} ${totalH}`}
              stroke="#A1C784"
              strokeWidth={Math.max(2, flower * 0.018)}
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Left Leaf (Broad botanical curve with leaf veins) */}
            <g
              transform={`translate(${flowerCenterX - flower * 0.18}, ${
                flowerCenterY + actualStemHeight * 0.38
              }) rotate(-24)`}
            >
              <path
                d={`M 0 8 C -${flower * 0.22} -${flower * 0.12} -${flower * 0.32} ${flower * 0.14} 0 ${
                  flower * 0.32
                } C ${flower * 0.32} ${flower * 0.14} ${flower * 0.22} -${flower * 0.12} 0 8 Z`}
                fill={`url(#${leafGradId})`}
                stroke="#4E7134"
                strokeWidth="1.2"
              />
              {/* Central and side leaf veins */}
              <path
                d={`M 0 10 L 0 ${flower * 0.3}`}
                stroke="#A1C784"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d={`M 0 ${flower * 0.15} Q -${flower * 0.08} ${flower * 0.12} -${flower * 0.14} ${
                  flower * 0.1
                }`}
                stroke="#A1C784"
                strokeWidth="0.8"
                fill="none"
              />
              <path
                d={`M 0 ${flower * 0.22} Q -${flower * 0.09} ${flower * 0.2} -${flower * 0.16} ${
                  flower * 0.18
                }`}
                stroke="#A1C784"
                strokeWidth="0.8"
                fill="none"
              />
              <path
                d={`M 0 ${flower * 0.15} Q ${flower * 0.08} ${flower * 0.12} ${flower * 0.14} ${
                  flower * 0.1
                }`}
                stroke="#A1C784"
                strokeWidth="0.8"
                fill="none"
              />
              <path
                d={`M 0 ${flower * 0.22} Q ${flower * 0.09} ${flower * 0.2} ${flower * 0.16} ${
                  flower * 0.18
                }`}
                stroke="#A1C784"
                strokeWidth="0.8"
                fill="none"
              />
            </g>

            {/* Right Leaf (Optional second leaf) */}
            {leafCount >= 2 && (
              <g
                transform={`translate(${flowerCenterX + flower * 0.16}, ${
                  flowerCenterY + actualStemHeight * 0.62
                }) rotate(26)`}
              >
                <path
                  d={`M 0 6 C -${flower * 0.18} -${flower * 0.1} -${flower * 0.28} ${
                    flower * 0.12
                  } 0 ${flower * 0.28} C ${flower * 0.28} ${flower * 0.12} ${flower * 0.18} -${
                    flower * 0.1
                  } 0 6 Z`}
                  fill={`url(#${leafGradId})`}
                  stroke="#4E7134"
                  strokeWidth="1.2"
                />
                <path
                  d={`M 0 8 L 0 ${flower * 0.26}`}
                  stroke="#A1C784"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d={`M 0 ${flower * 0.13} Q ${flower * 0.07} ${flower * 0.1} ${flower * 0.12} ${
                    flower * 0.09
                  }`}
                  stroke="#A1C784"
                  strokeWidth="0.8"
                  fill="none"
                />
                <path
                  d={`M 0 ${flower * 0.19} Q ${flower * 0.08} ${flower * 0.17} ${flower * 0.14} ${
                    flower * 0.15
                  }`}
                  stroke="#A1C784"
                  strokeWidth="0.8"
                  fill="none"
                />
              </g>
            )}
          </g>
        )}

        {/* Sunflower Head (Fully centered at flowerCenterX, flowerCenterY) */}
        <g transform={`translate(${flowerCenterX}, ${flowerCenterY})`}>
          {/* Calyx green backing */}
          <circle r={flower * 0.38} fill="#55753C" />

          {/* Outer Golden Petals */}
          {outerPetals.map((angle) => (
            <g key={`outer-${angle}`} transform={`rotate(${angle})`}>
              <path
                d={`M 0 0 C -${flower * 0.08} -${flower * 0.18} -${flower * 0.06} -${
                  flower * 0.46
                } 0 -${flower * 0.49} C ${flower * 0.06} -${flower * 0.46} ${flower * 0.08} -${
                  flower * 0.18
                } 0 0 Z`}
                fill={`url(#${outerPetalGradId})`}
                stroke="#D99419"
                strokeWidth="0.6"
              />
            </g>
          ))}

          {/* Inner Golden Petals (Offset by 7.5 deg for full, dense bloom) */}
          {innerPetals.map((angle) => (
            <g key={`inner-${angle}`} transform={`rotate(${angle})`}>
              <path
                d={`M 0 0 C -${flower * 0.07} -${flower * 0.15} -${flower * 0.05} -${
                  flower * 0.42
                } 0 -${flower * 0.45} C ${flower * 0.05} -${flower * 0.42} ${flower * 0.07} -${
                  flower * 0.15
                } 0 0 Z`}
                fill={`url(#${innerPetalGradId})`}
                stroke="#E8AF30"
                strokeWidth="0.6"
              />
            </g>
          ))}

          {/* Floret rim accent ring */}
          <circle
            r={flower * 0.23}
            fill="none"
            stroke="#D48612"
            strokeWidth="2.4"
            strokeDasharray="2 3"
            opacity="0.85"
          />

          {/* Central Seed Disk */}
          <circle
            r={flower * 0.21}
            fill={`url(#${centerDiskGradId})`}
            stroke="#2E231A"
            strokeWidth="1.2"
          />

          {/* Fibonacci spiral seed dots */}
          <circle
            r={flower * 0.14}
            fill="none"
            stroke="#F7C948"
            strokeWidth="1.5"
            strokeDasharray="2 3.5"
            opacity="0.55"
          />
          <circle
            r={flower * 0.08}
            fill="none"
            stroke="#FFE39A"
            strokeWidth="1.2"
            strokeDasharray="1.5 3"
            opacity="0.65"
          />
          <circle r={flower * 0.03} fill="#47372C" />
        </g>
      </svg>
    </motion.div>
  );
}
