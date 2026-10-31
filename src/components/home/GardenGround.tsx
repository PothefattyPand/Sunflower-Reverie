"use client";

import React from "react";

export function GardenGround() {
  return (
    <div
      className="relative w-full overflow-hidden pointer-events-none select-none z-10"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-28 sm:h-36 md:h-44 lg:h-52 block"
      >
        <defs>
          {/* Distant meadow hill gradient */}
          <linearGradient id="distantHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A2C87E" />
            <stop offset="60%" stopColor="#8CB468" />
            <stop offset="100%" stopColor="#7DA659" />
          </linearGradient>

          {/* Midground rolling garden lawn gradient */}
          <linearGradient id="midHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7FB060" />
            <stop offset="45%" stopColor="#6E9B58" />
            <stop offset="100%" stopColor="#5B8746" />
          </linearGradient>

          {/* Foreground lush turf gradient */}
          <linearGradient id="frontTurfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64914A" />
            <stop offset="35%" stopColor="#537C39" />
            <stop offset="80%" stopColor="#41632B" />
            <stop offset="100%" stopColor="#FFF9EC" />
          </linearGradient>

          {/* Chamomile / Daisy Flower Definition */}
          <g id="chamomile">
            {/* 6 White Petals */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-6"
                rx="2.2"
                ry="4"
                fill="#FFFFFF"
                transform={`rotate(${deg})`}
              />
            ))}
            {/* Golden Core */}
            <circle cx="0" cy="0" r="3" fill="#F7C948" stroke="#E8AF30" strokeWidth="0.5" />
          </g>

          {/* Buttercup Flower Definition */}
          <g id="buttercup">
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx="0"
                cy="-5"
                r="3.5"
                fill="#F7C948"
                stroke="#E8AF30"
                strokeWidth="0.4"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="2.5" fill="#FFEAA0" />
            <circle cx="0" cy="0" r="1.2" fill="#D99419" />
          </g>

          {/* Grass Blade Tuft Definition */}
          <g id="grassTuft">
            <path
              d="M0,0 C-2,-12 -6,-20 -10,-26 C-7,-18 -3,-10 0,0 Z"
              fill="#7CB05E"
            />
            <path
              d="M0,0 C-1,-14 -2,-24 -3,-32 C0,-22 1,-12 0,0 Z"
              fill="#8EC16F"
            />
            <path
              d="M0,0 C1,-12 5,-22 9,-28 C6,-20 3,-10 0,0 Z"
              fill="#6E9B58"
            />
            <path
              d="M0,0 C2,-10 8,-17 14,-21 C10,-14 5,-7 0,0 Z"
              fill="#5B8746"
            />
          </g>
        </defs>

        {/* 1. Distant Rolling Hill (Soft gentle horizon curve) */}
        <path
          d="M 0 110 Q 240 70 540 85 T 1080 75 Q 1280 85 1440 80 L 1440 220 L 0 220 Z"
          fill="url(#distantHillGrad)"
          opacity="0.95"
        />

        {/* 2. Midground Rolling Lawn (Creating natural dips and crests) */}
        <path
          d="M 0 135 Q 280 95 620 115 T 1180 98 Q 1330 108 1440 105 L 1440 220 L 0 220 Z"
          fill="url(#midHillGrad)"
        />

        {/* 3. Foreground Lush Garden Turf Layer */}
        <path
          d="M 0 160 Q 260 128 580 145 T 1160 132 Q 1320 142 1440 140 L 1440 220 L 0 220 Z"
          fill="url(#frontTurfGrad)"
        />

        {/* 4. Organic Grass Tufts across the foreground ridge */}
        <g id="grassBladesGroup">
          {/* Left Flank Grass Tufts */}
          <use href="#grassTuft" transform="translate(40, 160) scale(0.85)" />
          <use href="#grassTuft" transform="translate(90, 152) scale(-1.1, 1.1)" />
          <use href="#grassTuft" transform="translate(140, 148) scale(0.95)" />
          <use href="#grassTuft" transform="translate(210, 142) scale(1)" />
          <use href="#grassTuft" transform="translate(290, 138) scale(-0.9, 0.9)" />
          <use href="#grassTuft" transform="translate(380, 142) scale(1.05)" />

          {/* Center Subtle Meadow Tufts (Kept lower & lighter for clear reading above) */}
          <use href="#grassTuft" transform="translate(480, 148) scale(0.7)" />
          <use href="#grassTuft" transform="translate(620, 150) scale(-0.65, 0.65)" />
          <use href="#grassTuft" transform="translate(740, 146) scale(0.7)" />
          <use href="#grassTuft" transform="translate(880, 144) scale(-0.75, 0.75)" />

          {/* Right Flank Grass Tufts */}
          <use href="#grassTuft" transform="translate(980, 138) scale(0.95)" />
          <use href="#grassTuft" transform="translate(1080, 134) scale(1.1)" />
          <use href="#grassTuft" transform="translate(1160, 138) scale(-0.9, 0.9)" />
          <use href="#grassTuft" transform="translate(1240, 144) scale(1.05)" />
          <use href="#grassTuft" transform="translate(1330, 146) scale(-0.95, 0.95)" />
          <use href="#grassTuft" transform="translate(1400, 152) scale(0.85)" />
        </g>

        {/* 5. Delicate Storybook Wildflowers scattered in the lawn */}
        <g id="wildflowersGroup">
          {/* Chamomile Blossoms */}
          <use href="#chamomile" transform="translate(75, 165) scale(0.9)" />
          <use href="#chamomile" transform="translate(175, 155) scale(1)" />
          <use href="#chamomile" transform="translate(320, 148) scale(0.8)" />
          <use href="#chamomile" transform="translate(520, 156) scale(0.7)" />
          <use href="#chamomile" transform="translate(820, 152) scale(0.75)" />
          <use href="#chamomile" transform="translate(1020, 146) scale(0.85)" />
          <use href="#chamomile" transform="translate(1210, 150) scale(0.95)" />
          <use href="#chamomile" transform="translate(1360, 158) scale(0.8)" />

          {/* Golden Buttercups */}
          <use href="#buttercup" transform="translate(115, 160) scale(0.85)" />
          <use href="#buttercup" transform="translate(250, 146) scale(0.9)" />
          <use href="#buttercup" transform="translate(420, 150) scale(0.75)" />
          <use href="#buttercup" transform="translate(680, 158) scale(0.65)" />
          <use href="#buttercup" transform="translate(920, 148) scale(0.7)" />
          <use href="#buttercup" transform="translate(1120, 142) scale(0.9)" />
          <use href="#buttercup" transform="translate(1280, 152) scale(0.85)" />
        </g>
      </svg>

      {/* Seamless Transition Gradient from Soil base to Section 1 (#FFF9EC) */}
      <div className="w-full h-8 sm:h-12 bg-gradient-to-b from-[#FFF9EC]/0 via-[#FFF9EC]/80 to-[#FFF9EC]" />
    </div>
  );
}
