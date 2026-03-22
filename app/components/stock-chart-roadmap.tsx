"use client";

/**
 * StockChartRoadmap
 * Reusable interactive lesson roadmap rendered as a stock price chart.
 * Pass `moduleColor`, `moduleName`, and a `lessons` array to render any module.
 */

import { useEffect, useRef, useState } from "react";

// ─── Public types ─────────────────────────────────────────────────────────────

export type LessonState = "completed" | "current" | "locked";

export type LessonData = {
  id: string;
  title: string;
  /** Y-axis value — determines the node's height on the chart (e.g. 50–115). */
  price: number;
  /** Short description shown in the hover tooltip. */
  description: string;
  state: LessonState;
};

export type StockChartRoadmapProps = {
  /** Hex accent color for this module (line, nodes, labels). */
  moduleColor: string;
  /** Display name, shown in the header. */
  moduleName: string;
  lessons: LessonData[];
};

// ─── Module color palette ─────────────────────────────────────────────────────

/** Default accent color keyed by module number (1-based). */
export const MODULE_COLORS: Record<number, string> = {
  1:  "#22c55e", // green   — Foundations
  2:  "#3b82f6", // blue    — Charts
  3:  "#a855f7", // purple  — Trading
  4:  "#f59e0b", // amber   — Fundamental Analysis
  5:  "#ef4444", // red     — Risk Management
  6:  "#14b8a6", // teal    — Options Intro
  7:  "#f97316", // orange  — Portfolio Building
  8:  "#8b5cf6", // violet  — Advanced Patterns
  9:  "#06b6d4", // cyan    — Market Psychology
  10: "#ec4899", // pink    — Your Trading Plan
};

// ─── Sample lesson data ───────────────────────────────────────────────────────

/** Ready-to-use lesson data for Module 1 — Foundations. */
export const FOUNDATIONS_LESSONS: LessonData[] = [
  { id: "1-1",  title: "What is a Stock?",    price:  50, description: "Learn what stocks represent and the basics of equity ownership.", state: "completed" },
  { id: "1-2",  title: "Ownership & Shares",  price:  58, description: "Understand how ownership is divided into shares and what it means to be a shareholder.", state: "completed" },
  { id: "1-3",  title: "The Stock Market",    price:  65, description: "Understand how the stock market works and the foundations of trading.", state: "current" },
  { id: "1-4",  title: "How Prices Move",     price:  72, description: "Discover why stock prices rise and fall and what drives price action.", state: "locked" },
  { id: "1-5",  title: "Buy & Sell Orders",   price:  80, description: "Master buy and sell orders — market, limit, and stop orders explained.", state: "locked" },
  { id: "1-6",  title: "Market Hours",        price:  87, description: "Learn when markets open and close, and what happens in extended hours.", state: "locked" },
  { id: "1-7",  title: "Trading Halts",       price:  93, description: "Find out when and why trading is paused and how halts affect investors.", state: "locked" },
  { id: "1-8",  title: "Settlement & T+2",    price: 100, description: "Understand how trades settle and why it takes two business days to clear.", state: "locked" },
  { id: "1-9",  title: "Dividends Explained", price: 108, description: "Learn how companies return profits to shareholders through dividend payments.", state: "locked" },
  { id: "1-10", title: "Your First Trade",    price: 115, description: "Walk through placing your first stock trade from research to execution.", state: "locked" },
];

// ─── SVG geometry constants ───────────────────────────────────────────────────

/** Total SVG viewport (viewBox units, not CSS pixels). */
const W = 880;
const H = 380;

/** Inner padding (leaves room for axes + labels). */
const PAD = { l: 64, r: 24, t: 28, b: 48 } as const;

/** Chart drawing area dimensions. */
const CW = W - PAD.l - PAD.r;
const CH = H - PAD.t - PAD.b;

/** Price range shown on the Y-axis (slightly wider than data to give breathing room). */
const PRICE_MIN = 42;
const PRICE_MAX = 124;

/** Labeled Y-axis tick values. */
const Y_TICKS = [50, 65, 80, 95, 110] as const;

/** Visual radius of a lesson node. */
const NODE_R = 9;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function toSvgX(i: number, n: number): number {
  return PAD.l + (i / (n - 1)) * CW;
}

function toSvgY(price: number): number {
  return PAD.t + CH * (1 - (price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN));
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  return `rgba(${parseInt(c.slice(0, 2), 16)},${parseInt(c.slice(2, 4), 16)},${parseInt(c.slice(4, 6), 16)},${alpha})`;
}

/** Build a smooth cubic-bezier SVG path through an array of {x,y} points. */
function buildCurve(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  return pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx   = ((prev.x + p.x) / 2).toFixed(1);
    return `${d} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const CHART_KEYFRAMES = `
@keyframes scr-nodeAppear {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scr-pulseFade {
  0%   { transform: scale(1);   opacity: 0.65; }
  100% { transform: scale(2.4); opacity: 0;    }
}
@keyframes scr-tooltipUp {
  from { opacity: 0; transform: translate(-50%, calc(-100% - 8px));  }
  to   { opacity: 1; transform: translate(-50%, calc(-100% - 16px)); }
}
@keyframes scr-tooltipDown {
  from { opacity: 0; transform: translate(-50%, 8px);  }
  to   { opacity: 1; transform: translate(-50%, 16px); }
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function StockChartRoadmap({ moduleColor, moduleName, lessons }: StockChartRoadmapProps) {
  const font         = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const containerRef = useRef<HTMLDivElement>(null);
  const fullPathRef  = useRef<SVGPathElement>(null);
  const progPathRef  = useRef<SVGPathElement>(null);

  // strokeDashoffset animation state
  const [fullLen,  setFullLen]  = useState(3000);
  const [progLen,  setProgLen]  = useState(3000);
  const [animated, setAnimated] = useState(false);

  // Tooltip state
  const [hovered,    setHovered]    = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Measure path lengths on mount, then fire draw animation
  useEffect(() => {
    if (fullPathRef.current) setFullLen(fullPathRef.current.getTotalLength());
    if (progPathRef.current) setProgLen(progPathRef.current.getTotalLength());
    const t = window.setTimeout(() => setAnimated(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  // Precompute SVG coordinate for each lesson
  const pts = lessons.map((l, i) => ({
    x: toSvgX(i, lessons.length),
    y: toSvgY(l.price),
    lesson: l,
  }));

  const fullPath = buildCurve(pts);

  // Progress line covers from lesson 0 up to (and including) the last non-locked lesson
  const lastUnlocked = lessons.reduce((acc, l, i) => (l.state !== "locked" ? i : acc), -1);
  const progressPath = lastUnlocked > 0 ? buildCurve(pts.slice(0, lastUnlocked + 1)) : "";

  const completedCount = lessons.filter(l => l.state === "completed").length;

  /** Convert a node's SVG coordinates into DOM pixels relative to the container. */
  function getNodeDomPos(idx: number): { x: number; y: number } {
    const svgEl = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
    if (!svgEl || !containerRef.current) return { x: 0, y: 0 };
    const svgR = svgEl.getBoundingClientRect();
    const ctrR = containerRef.current.getBoundingClientRect();
    return {
      x: pts[idx].x * (svgR.width  / W) + (svgR.left - ctrR.left),
      y: pts[idx].y * (svgR.height / H) + (svgR.top  - ctrR.top),
    };
  }

  function handleNodeEnter(idx: number) {
    setTooltipPos(getNodeDomPos(idx));
    setHovered(idx);
  }

  const hoveredLesson    = hovered !== null ? (lessons[hovered] ?? null) : null;
  const containerWidth   = containerRef.current?.offsetWidth ?? 800;
  const tooltipFlipsDown = tooltipPos.y < 140; // near top of chart → show below

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", fontFamily: font }}>
      <style dangerouslySetInnerHTML={{ __html: CHART_KEYFRAMES }} />

      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: moduleColor, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#172b4d" }}>{moduleName}</span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
            {completedCount}/{lessons.length} complete
          </span>
        </div>

        {/* ── Chart SVG ── */}
        <svg
          aria-label={`${moduleName} lesson roadmap`}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        >
          {/* Y-axis grid lines + labels */}
          {Y_TICKS.map(price => {
            const y = toSvgY(price);
            return (
              <g key={price}>
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text
                  x={PAD.l - 8} y={y + 4}
                  textAnchor="end" fontSize="11" fill="#c0c9d4" fontFamily={font}
                >
                  ${price}
                </text>
              </g>
            );
          })}

          {/* Axis lines */}
          <line x1={PAD.l} y1={PAD.t}       x2={PAD.l}       y2={PAD.t + CH} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={PAD.l} y1={PAD.t + CH}  x2={W - PAD.r}   y2={PAD.t + CH} stroke="#e5e7eb" strokeWidth="1" />

          {/* X-axis lesson number labels */}
          {lessons.map((_, i) => (
            <text
              key={i}
              x={toSvgX(i, lessons.length)} y={H - PAD.b + 18}
              textAnchor="middle" fontSize="11" fill="#c0c9d4" fontFamily={font}
            >
              {i + 1}
            </text>
          ))}

          {/* Ghost path — full trajectory, faint */}
          <path
            ref={fullPathRef}
            d={fullPath}
            fill="none"
            stroke={moduleColor}
            strokeWidth="1.5"
            opacity="0.12"
            strokeDasharray={fullLen}
            strokeDashoffset={animated ? 0 : fullLen}
            style={{ transition: animated ? "stroke-dashoffset 1.5s ease-in-out" : "none" }}
          />

          {/* Progress path — completed + current lessons, glowing */}
          {progressPath && (
            <path
              ref={progPathRef}
              d={progressPath}
              fill="none"
              stroke={moduleColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={progLen}
              strokeDashoffset={animated ? 0 : progLen}
              style={{
                transition: animated ? "stroke-dashoffset 1.5s ease-in-out" : "none",
                filter: `drop-shadow(0 0 5px ${hexToRgba(moduleColor, 0.4)})`,
              }}
            />
          )}

          {/* Lesson nodes */}
          {pts.map((pt, i) => {
            const { lesson } = pt;
            const isDone    = lesson.state === "completed";
            const isCurrent = lesson.state === "current";
            const isLocked  = lesson.state === "locked";
            const isHov     = hovered === i;

            return (
              <g
                key={lesson.id}
                style={{
                  cursor: isLocked ? "default" : "pointer",
                  // Staggered fade-in: nodes appear after the line finishes drawing
                  animation: animated
                    ? `scr-nodeAppear 300ms ${i * 80 + 400}ms ease-out both`
                    : "none",
                  opacity: animated ? undefined : 0,
                }}
                onMouseEnter={() => handleNodeEnter(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Transparent hit area — easier to hover */}
                <circle cx={pt.x} cy={pt.y} r={22} fill="transparent" />

                {/* Pulsing ring for in-progress lesson */}
                {isCurrent && (
                  <circle
                    cx={pt.x} cy={pt.y}
                    r={NODE_R + 5}
                    fill="none"
                    stroke={moduleColor}
                    strokeWidth="1.5"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      animation: "scr-pulseFade 2s ease-out infinite",
                    }}
                  />
                )}

                {/* Node body */}
                <circle
                  cx={pt.x} cy={pt.y}
                  r={NODE_R}
                  fill={isDone ? moduleColor : isLocked ? "#f3f4f6" : "#fff"}
                  stroke={isLocked ? "#e5e7eb" : moduleColor}
                  strokeWidth={isCurrent ? 2.5 : 2}
                  style={{
                    filter: isHov && !isLocked
                      ? `drop-shadow(0 0 8px ${hexToRgba(moduleColor, 0.55)})`
                      : "none",
                    transition: "filter 150ms ease-out",
                  }}
                />

                {/* ✓ Checkmark for completed */}
                {isDone && (
                  <polyline
                    points={`${pt.x - 4},${pt.y} ${pt.x - 1.5},${pt.y + 3.5} ${pt.x + 5},${pt.y - 4}`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* 🔒 Lock for locked */}
                {isLocked && (
                  <>
                    {/* Shackle arc */}
                    <path
                      d={`M ${pt.x - 2.5} ${pt.y - 1.5} a 2.5 2.5 0 0 1 5 0`}
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Body */}
                    <rect
                      x={pt.x - 4} y={pt.y - 1.5}
                      width={8} height={6}
                      rx={1.5}
                      fill="#d1d5db"
                    />
                  </>
                )}

                {/* Price label above node */}
                <text
                  x={pt.x} y={pt.y - (NODE_R + 7)}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily={font}
                  fill={isLocked ? "#d1d5db" : isDone ? moduleColor : hexToRgba(moduleColor, 0.7)}
                >
                  ${lesson.price}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Tooltip ── */}
      {hoveredLesson && (
        <div
          style={{
            position: "absolute",
            // Keep tooltip horizontally inside the container
            left: Math.max(130, Math.min(tooltipPos.x, containerWidth - 130)),
            top: tooltipPos.y,
            transform: tooltipFlipsDown
              ? "translate(-50%, 16px)"
              : "translate(-50%, calc(-100% - 16px))",
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 12,
            padding: "14px 16px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
            pointerEvents: "none",
            zIndex: 30,
            minWidth: 220,
            maxWidth: 280,
            animation: tooltipFlipsDown
              ? "scr-tooltipDown 150ms ease-out both"
              : "scr-tooltipUp 150ms ease-out both",
          }}
        >
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0,
              background: hoveredLesson.state === "locked" ? "#d1d5db" : moduleColor,
            }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#172b4d", lineHeight: 1.35 }}>
              {hoveredLesson.title}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55, margin: "0 0 10px 0" }}>
            {hoveredLesson.description}
          </p>

          {/* Status + price row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              color: hoveredLesson.state === "completed" ? "#22c55e"
                   : hoveredLesson.state === "current"   ? moduleColor
                   : "#9ca3af",
            }}>
              {hoveredLesson.state === "completed" ? "✓ Completed"
               : hoveredLesson.state === "current"  ? "In Progress"
               : "Locked"}
            </span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#172b4d" }}>
              ${hoveredLesson.price}
            </span>
          </div>

          {/* Unlock hint for locked lessons */}
          {hoveredLesson.state === "locked" && hovered !== null && hovered > 0 && (
            <p style={{ fontSize: 11, color: "#c0c9d4", margin: "8px 0 0", lineHeight: 1.45 }}>
              Complete &ldquo;{lessons[hovered - 1]?.title}&rdquo; first
            </p>
          )}
        </div>
      )}
    </div>
  );
}
