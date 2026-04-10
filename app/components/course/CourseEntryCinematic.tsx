"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";

const shellSerif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";

export function CourseEntryCinematic({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (!active || typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onComplete();
    }, 2480);

    return () => window.clearTimeout(timeoutId);
  }, [active, onComplete]);

  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden bg-[#c7d5e4]">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: 2.45, ease: [0.22, 1, 0.36, 1], times: [0, 0.82, 1] }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.02, y: "0%" }}
          animate={{ scale: 1.12, y: "-15%" }}
          transition={{ duration: 2.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/course/peak.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: "center 32%",
              filter: "saturate(0.92) contrast(1.02)",
            }}
          />
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-[46%] z-[3] -translate-x-1/2 rounded-full border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.34em] text-[rgba(244,239,231,0.94)]"
          initial={{ opacity: 0.96, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -28, scale: 0.96 }}
          transition={{ duration: 0.68, ease: [0.4, 0, 0.2, 1], delay: 0.26 }}
          style={{
            background: "rgba(22,31,44,0.34)",
            borderColor: "rgba(228,236,242,0.16)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          THE SUMMIT
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 16%, rgba(255,249,239,0.3) 0%, rgba(255,249,239,0.16) 14%, transparent 38%),
              linear-gradient(180deg, rgba(237,242,247,0.12) 0%, rgba(15,27,40,0.08) 58%, rgba(7,14,24,0.24) 100%)
            `,
          }}
        />

        <motion.div
          className="absolute inset-x-0 top-0 h-full"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.56, 0.72] }}
          transition={{ duration: 1.75, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(180deg, rgba(214,224,236,0) 0%, rgba(220,228,239,0.1) 22%, rgba(12,23,37,0.26) 66%, rgba(9,16,27,0.5) 100%)",
          }}
        />

        <motion.div
          className="absolute inset-x-0 bottom-[-6%] h-[38vh]"
          initial={{ opacity: 0.42, y: 10 }}
          animate={{ opacity: [0.42, 0.82, 0.86], y: [10, 0, -8] }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "radial-gradient(ellipse at 16% 38%, rgba(255,255,255,0.9) 0%, rgba(243,246,249,0.72) 28%, transparent 58%), radial-gradient(ellipse at 84% 32%, rgba(255,255,255,0.86) 0%, rgba(244,247,251,0.68) 28%, transparent 58%), radial-gradient(ellipse at 50% 86%, rgba(223,230,239,0.72) 0%, rgba(220,229,240,0.42) 34%, transparent 66%)",
            filter: "blur(14px)",
          }}
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[72%]"
          initial={{ opacity: 0.12, y: 26 }}
          animate={{ opacity: [0.12, 0.62, 0.78], y: [26, 10, 0] }}
          transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1], delay: 0.48 }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="entry-face" x1="50%" y1="12%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="rgba(38,51,67,0.12)" />
                <stop offset="28%" stopColor="rgba(29,41,58,0.52)" />
                <stop offset="100%" stopColor="rgba(10,17,29,0.98)" />
              </linearGradient>
              <linearGradient id="entry-face-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(200,214,226,0.16)" />
                <stop offset="100%" stopColor="rgba(200,214,226,0.02)" />
              </linearGradient>
            </defs>
            <path
              d="M50 12 C45 18, 40 29, 35 44 C32 55, 31 67, 34 79 L44 100 L61 100 L58 74 C55 62, 55 48, 55 33 L55 16 C55 14, 53.5 12.5, 50 12 Z"
              fill="url(#entry-face)"
            />
            <path
              d="M50 12 C45 18, 40 29, 35 44 C32 55, 31 67, 34 79"
              fill="none"
              stroke="url(#entry-face-edge)"
              strokeWidth="0.36"
            />
            <path
              d="M55 16 C55 31, 55 47, 58 74 L61 100"
              fill="none"
              stroke="rgba(215,224,235,0.08)"
              strokeWidth="0.24"
            />
          </svg>

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="entry-route-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M36.8 92 C38 84, 38 78, 40.8 71 C45 63, 51 58, 56 52 C60 47, 60 40, 63 34 C65 29, 65 23, 64 16"
              fill="none"
              stroke="rgba(238,244,248,0.7)"
              strokeWidth="0.44"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1.1 1.9"
              filter="url(#entry-route-glow)"
              initial={{ pathLength: 0.12, opacity: 0.18 }}
              animate={{ pathLength: 1, opacity: 0.92 }}
              transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1], delay: 0.58 }}
            />

            {[
              { x: 37.8, y: 86.4, delay: 0.7 },
              { x: 39.7, y: 74.8, delay: 0.8 },
              { x: 45.7, y: 62.2, delay: 0.9 },
              { x: 50.6, y: 52.8, delay: 1.0 },
              { x: 57.2, y: 40.6, delay: 1.1 },
              { x: 60.1, y: 27.6, delay: 1.2 },
            ].map((node) => (
              <motion.g
                key={`${node.x}-${node.y}`}
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: node.delay }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="1.55"
                  fill="rgba(22,32,46,0.94)"
                  stroke="rgba(212,222,232,0.18)"
                  strokeWidth="0.16"
                />
                <path
                  d={`M ${node.x - 0.55} ${node.y} L ${node.x - 0.1} ${node.y + 0.42} L ${node.x + 0.62} ${node.y - 0.44}`}
                  fill="none"
                  stroke="rgba(244,248,250,0.92)"
                  strokeWidth="0.18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            ))}
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[30vh]"
          initial={{ opacity: 0.24 }}
          animate={{ opacity: [0.24, 0.48, 0.74] }}
          transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "linear-gradient(180deg, rgba(10,17,29,0) 0%, rgba(10,17,29,0.34) 36%, rgba(8,14,24,0.78) 100%)",
          }}
        />

        <motion.p
          className="absolute bottom-8 left-1/2 z-[4] w-[min(460px,calc(100%-3rem))] -translate-x-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(225,233,240,0.58)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 1.24 }}
          style={{ fontFamily: shellSerif }}
        >
          Rejoining the climb
        </motion.p>
      </motion.div>
    </div>
  );
}
