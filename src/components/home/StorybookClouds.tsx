"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

export function StorybookClouds() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Cloud 1: Upper Left Fluffy Cloud (Wide & Stately) */}
      <motion.div
        className="absolute top-6 left-3 sm:left-12 lg:left-20 opacity-90 drop-shadow-xs"
        initial={{ x: 0 }}
        animate={shouldReduceMotion ? { x: 0 } : { x: [0, 22, 0] }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg width="210" height="75" viewBox="0 0 210 75" fill="none">
          <defs>
            <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E4F2F7" />
            </linearGradient>
          </defs>
          {/* Cloud Body Shape */}
          <path
            d="M 35 62 C 22 62 10 52 10 38 C 10 26 20 18 32 18 C 38 8 54 2 72 2 C 92 2 110 12 116 24 C 124 16 138 14 150 20 C 162 26 166 36 164 44 C 176 44 188 50 188 62 C 188 70 176 72 165 72 L 35 72 Z"
            fill="url(#cloudGrad1)"
          />
          {/* Subtle sun-kissed top highlight */}
          <path
            d="M 40 18 C 45 10 58 6 72 6 C 88 6 102 14 110 24"
            stroke="#FFFDF5"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </motion.div>

      {/* Cloud 2: Upper Right Floating Cloud (Near Golden Sun) */}
      <motion.div
        className="absolute top-10 right-8 sm:right-28 lg:right-40 opacity-85 drop-shadow-xs"
        initial={{ x: 0 }}
        animate={shouldReduceMotion ? { x: 0 } : { x: [0, -18, 0] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <svg width="170" height="60" viewBox="0 0 170 60" fill="none">
          <defs>
            <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#FFFDF7" />
              <stop offset="100%" stopColor="#E6F2F6" />
            </linearGradient>
          </defs>
          <path
            d="M 28 50 C 16 50 8 42 8 30 C 8 20 16 14 26 14 C 32 6 46 2 60 2 C 78 2 92 10 98 20 C 105 14 118 13 128 18 C 138 23 140 32 138 38 C 148 38 156 44 156 52 C 156 58 146 60 138 60 L 28 60 Z"
            fill="url(#cloudGrad2)"
          />
          {/* Warm Sunlight Rim */}
          <path
            d="M 32 14 C 38 7 48 4 60 4 C 74 4 86 10 92 18"
            stroke="#FFE8A3"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </motion.div>

      {/* Cloud 3: Mid-Left Floating Cloud (Delicate, Soft Depth) */}
      <motion.div
        className="absolute top-36 left-4 sm:left-10 lg:left-16 opacity-75 hidden sm:block"
        initial={{ x: 0 }}
        animate={shouldReduceMotion ? { x: 0 } : { x: [0, 15, 0] }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <svg width="140" height="50" viewBox="0 0 140 50" fill="none">
          <path
            d="M 22 42 C 12 42 6 35 6 25 C 6 17 13 12 21 12 C 26 5 38 2 50 2 C 64 2 76 9 80 17 C 86 12 96 11 104 15 C 112 19 114 26 112 31 C 120 31 126 36 126 42 C 126 47 118 48 112 48 L 22 48 Z"
            fill="#FFFFFF"
            fillOpacity="0.88"
          />
        </svg>
      </motion.div>

      {/* Cloud 4: Mid-Right Distant Cloud */}
      <motion.div
        className="absolute top-44 right-6 sm:right-12 lg:right-24 opacity-60 hidden md:block"
        initial={{ x: 0 }}
        animate={shouldReduceMotion ? { x: 0 } : { x: [0, -14, 0] }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3.5,
        }}
      >
        <svg width="120" height="42" viewBox="0 0 120 42" fill="none">
          <path
            d="M 18 36 C 10 36 4 30 4 22 C 4 15 10 10 17 10 C 21 4 31 2 40 2 C 52 2 62 8 66 15 C 71 11 79 10 86 13 C 92 17 94 23 92 27 C 98 27 104 31 104 36 L 18 36 Z"
            fill="#FFFFFF"
            fillOpacity="0.8"
          />
        </svg>
      </motion.div>
    </div>
  );
}
