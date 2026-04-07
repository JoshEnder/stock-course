"use client";

import React from "react";
import { motion } from "framer-motion";
import { fonts, shadows } from "./tokens";
import { MiniLesson } from "./MiniLesson";
import type { Lesson } from "./lessons";

type CardLayer = "front" | "secondary" | "tertiary" | "fourth";

interface CardProps {
  lesson: Lesson;
  selectedAnswer: number | null;
  onSelect: (answerIndex: number) => void;
  onFocus: () => void;
  layer: CardLayer;
  isActive: boolean;
  systemHovered?: boolean;
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.62)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// ─── Secondary surface: Mechanism layer ──────────────────────────────────────
// Teaches the "why" behind a decision — breakout chart pattern
function MechanismSurface({
  title,
  isActive,
  systemHovered,
}: {
  title: string;
  isActive: boolean;
  systemHovered?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "28px 24px 24px",
      }}
    >
      {/* Header */}
      <div>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: `rgba(17,39,57,${systemHovered ? 0.94 : 0.30})`,
            transition: "color 0.32s ease",
          }}
        >
          {title}
        </span>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: `rgba(20,184,116,${systemHovered ? 0.80 : 0.15})`,
            margin: "5px 0 0",
            transition: "color 0.4s ease",
          }}
        >
          Breakout mechanics
        </p>
      </div>

      {/* Chart area */}
      <div
        style={{
          position: "relative",
          flex: 1,
          marginTop: 14,
          borderRadius: 18,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <svg
          viewBox="0 0 320 250"
          fill="none"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: systemHovered ? 1 : 0.40,
            transition: "opacity 0.32s ease",
          }}
        >
          {/* Grid */}
          {[55, 110, 165, 210].map((y) => (
            <line
              key={y}
              x1="18" y1={y} x2="302" y2={y}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />
          ))}

          {/* Resistance line — dashed */}
          <line
            x1="18" y1="155" x2="302" y2="155"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1"
            strokeDasharray="5 3"
          />

          {/* Breakout fill area (above resistance, right of breakout point) */}
          <path
            d="M190 155L216 124L242 98L266 72L290 50L302 38L302 155Z"
            fill="rgba(20,184,116,0.09)"
          />

          {/* Consolidation path — flat, muted */}
          <path
            d="M22 163C38 166 56 158 74 163C92 168 110 156 128 162C146 168 164 157 180 161C186 162 188 159 190 155"
            stroke="rgba(255,255,255,0.46)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Breakout path — sharp move, green */}
          <path
            d="M190 155C206 136 220 114 242 94C264 74 282 52 302 34"
            stroke="rgba(20,184,116,0.88)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Breakout signal: glow + dot */}
          <circle cx="190" cy="155" r="14" fill="rgba(20,184,116,0.14)" />
          <circle
            cx="190" cy="155"
            r={isActive ? 7 : 5}
            fill="rgba(20,184,116,0.92)"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Tertiary surface: Context layer ─────────────────────────────────────────
// Atmospheric — the deeper principle behind the system
function ContextSurface({
  title,
  systemHovered,
}: {
  title: string;
  systemHovered?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        padding: "26px 22px 22px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: `rgba(17,39,57,${systemHovered ? 0.88 : 0.24})`,
              transition: "color 0.36s ease",
              display: "block",
            }}
          >
            {title}
          </span>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: `rgba(20,184,116,${systemHovered ? 0.72 : 0.12})`,
              margin: "4px 0 0",
              transition: "color 0.42s ease",
            }}
          >
            Market structure
          </p>
        </div>
        <LockIcon />
      </div>

      {/* Atmospheric principle text — large, faded, serif */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 8,
        }}
      >
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 46,
            fontWeight: 600,
            lineHeight: 0.93,
            letterSpacing: "-0.03em",
            color: `rgba(17,39,57,${systemHovered ? 0.52 : 0.07})`,
            margin: 0,
            transition: "color 0.45s ease",
          }}
        >
          That&apos;s how<br />
          markets<br />
          stay hidden.
        </p>
      </div>

      {/*
        Node network — markets as interconnected systems, not geography.
        More ownable than a world map. Reads as "market structure / pressure."
        One green node echoes the signal path origin.
      */}
      <svg
        viewBox="0 0 192 112"
        fill="none"
        aria-hidden
        style={{
          position: "absolute",
          bottom: 14,
          right: 12,
          width: "70%",
          height: "40%",
          opacity: systemHovered ? 0.44 : 0.06,
          transition: "opacity 0.46s ease",
          pointerEvents: "none",
        }}
      >
        {/* Edges */}
        <line x1="14" y1="44" x2="38" y2="18"  stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="14" y1="44" x2="56" y2="70"  stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="38" y1="18" x2="82" y2="10"  stroke="rgba(17,39,57,0.35)" strokeWidth="0.6" />
        <line x1="38" y1="18" x2="88" y2="50"  stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="56" y1="70" x2="88" y2="50"  stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="56" y1="70" x2="110" y2="82" stroke="rgba(17,39,57,0.35)" strokeWidth="0.6" />
        <line x1="82" y1="10" x2="124" y2="28" stroke="rgba(17,39,57,0.35)" strokeWidth="0.6" />
        <line x1="88" y1="50" x2="124" y2="28" stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="88" y1="50" x2="150" y2="56" stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="110" y1="82" x2="180" y2="46" stroke="rgba(17,39,57,0.30)" strokeWidth="0.6" />
        <line x1="124" y1="28" x2="164" y2="16" stroke="rgba(17,39,57,0.35)" strokeWidth="0.6" />
        <line x1="124" y1="28" x2="150" y2="56" stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="150" y1="56" x2="180" y2="46" stroke="rgba(17,39,57,0.40)" strokeWidth="0.7" />
        <line x1="164" y1="16" x2="180" y2="46" stroke="rgba(17,39,57,0.35)" strokeWidth="0.6" />

        {/* Nodes — most navy, central one green (echoes path signal) */}
        <circle cx="14"  cy="44"  r="2.1" fill="rgba(17,39,57,0.52)" />
        <circle cx="38"  cy="18"  r="1.9" fill="rgba(17,39,57,0.48)" />
        <circle cx="56"  cy="70"  r="2.1" fill="rgba(17,39,57,0.52)" />
        <circle cx="82"  cy="10"  r="1.7" fill="rgba(17,39,57,0.42)" />
        <circle cx="88"  cy="50"  r="2.7" fill="rgba(20,184,116,0.58)" />
        <circle cx="110" cy="82"  r="2.0" fill="rgba(17,39,57,0.48)" />
        <circle cx="124" cy="28"  r="2.1" fill="rgba(17,39,57,0.52)" />
        <circle cx="150" cy="56"  r="1.9" fill="rgba(17,39,57,0.48)" />
        <circle cx="164" cy="16"  r="1.7" fill="rgba(17,39,57,0.42)" />
        <circle cx="180" cy="46"  r="2.3" fill="rgba(17,39,57,0.55)" />
      </svg>
    </div>
  );
}

// ─── Fourth surface: Earnings layer ──────────────────────────────────────────
// The power behind the mechanism — earnings as compounding signal
function FourthCardSurface({
  title,
  systemHovered,
}: {
  title: string;
  systemHovered?: boolean;
}) {
  return (
    <div
      style={{
        height: "100%",
        padding: "26px 22px 22px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: `rgba(17,39,57,${systemHovered ? 0.88 : 0.24})`,
              transition: "color 0.36s ease",
              display: "block",
            }}
          >
            {title}
          </span>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: `rgba(20,184,116,${systemHovered ? 0.72 : 0.12})`,
              margin: "4px 0 0",
              transition: "color 0.42s ease",
            }}
          >
            Earnings power
          </p>
        </div>
        <LockIcon />
      </div>

      {/* Serif text — the principle */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 8,
        }}
      >
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 40,
            fontWeight: 600,
            lineHeight: 0.93,
            letterSpacing: "-0.03em",
            color: `rgba(17,39,57,${systemHovered ? 0.52 : 0.07})`,
            margin: 0,
            transition: "color 0.45s ease",
          }}
        >
          Earnings<br />
          beat<br />
          again.
        </p>
      </div>

      {/* Ascending bars — Q1, Q2, Q3 */}
      <svg
        viewBox="0 0 90 48"
        fill="none"
        aria-hidden
        style={{
          width: 90,
          height: 48,
          marginTop: 14,
          opacity: systemHovered ? 0.58 : 0.08,
          transition: "opacity 0.44s ease",
          flexShrink: 0,
        }}
      >
        <rect x="6"  y="28" width="18" height="18" rx="2.5" fill="rgba(17,39,57,0.42)" />
        <rect x="36" y="18" width="18" height="28" rx="2.5" fill="rgba(17,39,57,0.52)" />
        <rect x="66" y="6"  width="18" height="40" rx="2.5" fill="rgba(20,184,116,0.70)" />
      </svg>
    </div>
  );
}

// ─── BackCardSurface router ────────────────────────────────────────────────────
function BackCardSurface({
  title,
  layer,
  isActive,
  systemHovered,
}: {
  title: string;
  layer: Exclude<CardLayer, "front">;
  isActive: boolean;
  systemHovered?: boolean;
}) {
  if (layer === "fourth") {
    return <FourthCardSurface title={title} systemHovered={systemHovered} />;
  }
  if (layer === "tertiary") {
    return <ContextSurface title={title} systemHovered={systemHovered} />;
  }
  return (
    <MechanismSurface title={title} isActive={isActive} systemHovered={systemHovered} />
  );
}

export function Card({
  lesson,
  selectedAnswer,
  onSelect,
  onFocus,
  layer,
  isActive,
  systemHovered,
}: CardProps) {
  const isFront = layer === "front";
  // Back cards sharpen dramatically on reveal — the "haze lifting" moment
  const blurAmount = isFront
    ? systemHovered ? 14 : 10
    : layer === "secondary"
      ? systemHovered ? 6 : 11
      : layer === "tertiary"
        ? systemHovered ? 4 : 9
        : systemHovered ? 3 : 8;  // fourth
  const baseBackground = isFront
    ? systemHovered
      ? "linear-gradient(145deg, rgba(255,255,255,0.70) 0%, rgba(244,247,248,0.46) 30%, rgba(220,228,234,0.28) 100%)"
      : "linear-gradient(145deg, rgba(255,255,255,0.58) 0%, rgba(244,247,248,0.34) 30%, rgba(220,228,234,0.20) 100%)"
    : layer === "secondary"
      ? systemHovered
        ? "linear-gradient(145deg, rgba(255,255,255,0.64) 0%, rgba(236,242,246,0.42) 36%, rgba(210,221,230,0.30) 100%)"
        : "linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(231,238,243,0.10) 36%, rgba(203,214,223,0.08) 100%)"
      : layer === "tertiary"
        ? systemHovered
          ? "linear-gradient(145deg, rgba(255,255,255,0.56) 0%, rgba(236,242,246,0.34) 38%, rgba(210,221,230,0.22) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(231,238,243,0.06) 38%, rgba(203,214,223,0.04) 100%)"
        : systemHovered
          ? "linear-gradient(145deg, rgba(255,255,255,0.50) 0%, rgba(236,242,246,0.28) 38%, rgba(210,221,230,0.18) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(231,238,243,0.04) 38%, rgba(203,214,223,0.03) 100%)";

  return (
    <motion.div
      onClick={!isFront ? onFocus : undefined}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 24,
        cursor: isFront ? "default" : "pointer",
        overflow: "hidden",
        filter: (isFront && systemHovered) ? "contrast(1.05) brightness(1.02)" : undefined,
        transition: "filter 0.22s ease",
      }}
      whileHover={
        isFront
          ? { y: -5, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }
          : { y: -8, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } }
      }
      role="article"
      aria-label={`Lesson: ${lesson.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFocus();
        }
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          background: baseBackground,
          backdropFilter: `blur(${blurAmount}px) saturate(1.15) contrast(1.02)`,
          WebkitBackdropFilter: `blur(${blurAmount}px) saturate(1.15) contrast(1.02)`,
          border: `1px solid rgba(255,255,255,${
            isFront
              ? systemHovered ? 0.92 : 0.78
              : layer === "secondary"
                ? systemHovered ? 0.80 : 0.26
                : layer === "tertiary"
                  ? systemHovered ? 0.72 : 0.22
                  : systemHovered ? 0.64 : 0.18
          })`,
          boxShadow: isFront
            ? systemHovered
              ? `${shadows.cardHover}, 0 28px 56px rgba(17,39,57,0.24), inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -1px 0 rgba(17,39,57,0.06)`
              : isActive
                ? `${shadows.cardHover}, inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(17,39,57,0.05)`
                : `${shadows.card}, inset 0 1px 0 rgba(255,255,255,0.64), inset 0 -1px 0 rgba(17,39,57,0.05)`
            : isActive
              ? `${shadows.glassActive}, inset 0 1px 0 rgba(255,255,255,0.5)`
              : `${shadows.glass}, inset 0 1px 0 rgba(255,255,255,0.38)`,
          transition: "border-color 0.4s ease, background 0.4s ease",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.18) 18%, transparent 42%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          bottom: 12,
          right: 10,
          width: 2,
          borderRadius: 2,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.26) 36%, rgba(255,255,255,0.7) 100%)",
          opacity: isFront ? 0.9 : 0.55,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 9,
          height: 2,
          borderRadius: 2,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.72) 28%, rgba(255,255,255,0.72) 72%, rgba(255,255,255,0.2) 100%)",
          opacity: isFront ? 0.8 : 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Contact glow — signal reaches this card and energises its left edge */}
      {!isFront && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            background:
              layer === "secondary"
                ? "linear-gradient(108deg, rgba(20,184,116,0.26) 0%, rgba(20,184,116,0.08) 38%, transparent 62%)"
                : layer === "tertiary"
                  ? "linear-gradient(114deg, rgba(20,184,116,0.16) 0%, rgba(20,184,116,0.05) 34%, transparent 56%)"
                  : "linear-gradient(118deg, rgba(20,184,116,0.10) 0%, rgba(20,184,116,0.03) 30%, transparent 50%)",
            pointerEvents: "none",
          }}
          animate={{ opacity: systemHovered ? 1 : 0 }}
          transition={{
            duration: systemHovered ? 0.40 : 0.22,
            delay: systemHovered
              ? layer === "secondary" ? 0.26 : layer === "tertiary" ? 0.44 : 0.58
              : 0,
            ease: "easeOut",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        {isFront ? (
          <MiniLesson
            lesson={lesson}
            selectedAnswer={selectedAnswer}
            onSelect={onSelect}
          />
        ) : (
          <BackCardSurface
            title={lesson.title}
            layer={layer}
            isActive={isActive}
            systemHovered={systemHovered}
          />
        )}
      </div>
    </motion.div>
  );
}
