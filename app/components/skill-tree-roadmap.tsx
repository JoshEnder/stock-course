"use client";

/**
 * SkillTreeRoadmap — Duolingo-inspired diagonal skill tree.
 * Gold coins for completed lessons, green star for current, dimmed locks for upcoming.
 * The connecting line follows a realistic stock-chart pattern (uptrend with peaks & valleys).
 */

import { useEffect, useId, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillState = "completed" | "current" | "locked";

export type SkillLesson = {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  state: SkillState;
  /** Optional: used by the parent's onLessonClick handler for routing. */
  route?: string;
  /** 0–100, used when state is "current" */
  progress?: number;
};

export type SkillTreeRoadmapProps = {
  /** Hex accent color for line + active/locked nodes. Defaults to Stoked green. */
  moduleColor?: string;
  moduleName: string;
  lessons: SkillLesson[];
  onLessonClick?: (lesson: SkillLesson) => void;
};

// ─── Sample data ──────────────────────────────────────────────────────────────

export const FOUNDATIONS_SKILL_LESSONS: SkillLesson[] = [
  { id: "foundations-1",  title: "Introduction to Stocks",  xpReward: 30, state: "locked"                          },
  { id: "foundations-2",  title: "What is a Stock?",        xpReward: 30, state: "completed"                       },
  { id: "foundations-3",  title: "Ownership & Shares",      xpReward: 30, state: "completed"                       },
  { id: "foundations-4",  title: "The Stock Market",        xpReward: 30, state: "completed"                       },
  { id: "foundations-5",  title: "How Prices Move",         xpReward: 30, state: "current",  progress: 40          },
  { id: "foundations-6",  title: "Buy & Sell Orders",       xpReward: 30, state: "locked"                          },
  { id: "foundations-7",  title: "Market Hours",            xpReward: 30, state: "locked"                          },
  { id: "foundations-8",  title: "Trading Halts",           xpReward: 30, state: "locked"                          },
  { id: "foundations-9",  title: "Dividends Explained",     xpReward: 30, state: "locked"                          },
  { id: "foundations-10", title: "Your First Trade",        xpReward: 50, state: "locked"                          },
];

// ─── SVG geometry — Desktop ───────────────────────────────────────────────────

const W = 920;
const H = 620;
const NODE_R = 34;

const STOCK_Y_FRACS = [0.92, 0.72, 0.83, 0.57, 0.44, 0.56, 0.36, 0.49, 0.24, 0.12];

const Y_PAD_T = 70;
const Y_PAD_B = 60;
const CHART_H  = H - Y_PAD_T - Y_PAD_B;

function getStockPositions(n: number): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const srcT   = t * (STOCK_Y_FRACS.length - 1);
    const lo     = Math.floor(srcT);
    const hi     = Math.min(lo + 1, STOCK_Y_FRACS.length - 1);
    const frac   = srcT - lo;
    const yFrac  = STOCK_Y_FRACS[lo] * (1 - frac) + STOCK_Y_FRACS[hi] * frac;
    return {
      x: 80 + t * (W - 160),
      y: Y_PAD_T + yFrac * CHART_H,
    };
  });
}

// ─── SVG geometry — Mobile (portrait stock chart, same fracs as desktop) ────────
//
// Portrait canvas 500×600: same STOCK_Y_FRACS create a diagonal from
// bottom-left (first/lowest) to top-right (last/highest), just like the
// desktop view but taller relative to width.
// At 355px container width: scale=0.71, NODE_R=34 → ~48px rendered diameter.

const MW       = 500;
const MH       = 720;
const M_NODE_R = 34;   // same as desktop — sc=1 means artwork is identical

function getMobilePositions(n: number): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t     = n === 1 ? 0 : i / (n - 1);
    const srcT  = t * (STOCK_Y_FRACS.length - 1);
    const lo    = Math.floor(srcT);
    const hi    = Math.min(lo + 1, STOCK_Y_FRACS.length - 1);
    const frac  = srcT - lo;
    const yFrac = STOCK_Y_FRACS[lo] * (1 - frac) + STOCK_Y_FRACS[hi] * frac;
    return {
      x: 50 + t * (MW - 100),          // 50 → 450
      y: 70 + yFrac * (MH - 140),      // 70 → 530 (fracs go bottom→top)
    };
  });
}

/** Smooth cubic-bezier SVG path through an array of {x,y} points via midpoint control points. */
function buildCurve(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return "";
  return pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx   = ((prev.x + p.x) / 2).toFixed(1);
    return `${d} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");
}

function hexToRgba(hex: string, a: number): string {
  const c = hex.replace("#", "");
  return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`;
}

/** SVG points for a 5-pointed star centered at (cx, cy). */
function starPoints(cx: number, cy: number, R = 13, r = 5.5): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? R : r;
    const angle  = (i * Math.PI / 5) - Math.PI / 2;
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes sk-flow {
  to { stroke-dashoffset: -480; }
}
@keyframes sk-nodeIn {
  from { opacity: 0; transform: scale(0.45); }
  to   { opacity: 1; transform: scale(1);    }
}
@keyframes sk-goldShimmer {
  0%, 100% { opacity: 0.15; }
  50%       { opacity: 0.58; }
}
@keyframes sk-pulseRing {
  0%   { transform: scale(1);    opacity: 0.6; }
  100% { transform: scale(1.7);  opacity: 0;   }
}
@keyframes sk-bounce {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}
@keyframes sk-tooltipUp {
  from { opacity: 0; transform: translate(-50%, calc(-100% - 8px));  }
  to   { opacity: 1; transform: translate(-50%, calc(-100% - 16px)); }
}
@keyframes sk-tooltipDown {
  from { opacity: 0; transform: translate(-50%, 8px);  }
  to   { opacity: 1; transform: translate(-50%, 16px); }
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function SkillTreeRoadmap({
  moduleColor = "#22c55e",
  moduleName,
  lessons,
  onLessonClick,
}: SkillTreeRoadmapProps) {
  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  const uid       = useId().replace(/:/g, "");
  const shineId   = `${uid}shine`;
  const grnGlowId = `${uid}nglow`;
  const gridId    = `${uid}grid`;

  const containerRef = useRef<HTMLDivElement>(null);
  const progPathRef  = useRef<SVGPathElement>(null);

  const [animated,   setAnimated]   = useState(false);
  const [progLen,    setProgLen]    = useState(3000);
  const [hovered,    setHovered]    = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isMobile,   setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (progPathRef.current) setProgLen(progPathRef.current.getTotalLength());
    const t = window.setTimeout(() => setAnimated(true), 80);
    return () => window.clearTimeout(t);
  }, [isMobile]);

  // Switch geometry based on breakpoint
  const svgW   = isMobile ? MW      : W;
  const svgH   = isMobile ? MH      : H;
  const nodeR  = isMobile ? M_NODE_R : NODE_R;
  const sc     = nodeR / NODE_R;   // scale factor for node artwork
  const pts    = isMobile ? getMobilePositions(lessons.length) : getStockPositions(lessons.length);

  const fullCurve  = buildCurve(pts);
  const lastActive = lessons.reduce((acc, l, i) => l.state !== "locked" ? i : acc, -1);
  const progCurve  = lastActive >= 1 ? buildCurve(pts.slice(0, lastActive + 1)) : "";
  const doneCount  = lessons.filter(l => l.state === "completed").length;
  const ctrWidth   = containerRef.current?.offsetWidth ?? 920;

  function getNodeDomPos(idx: number): { x: number; y: number } {
    const svg = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
    if (!svg || !containerRef.current) return { x: 0, y: 0 };
    const svgR = svg.getBoundingClientRect();
    const ctrR = containerRef.current.getBoundingClientRect();
    return {
      x: pts[idx].x * (svgR.width  / W) + (svgR.left - ctrR.left),
      y: pts[idx].y * (svgR.height / H) + (svgR.top  - ctrR.top),
    };
  }

  const hoveredLesson    = hovered !== null ? (lessons[hovered] ?? null) : null;
  const tooltipFlipsDown = tooltipPos.y < 130;

  const progressBar = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ height: 8, flex: isMobile ? 1 : undefined, width: isMobile ? undefined : 80, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg, ${moduleColor}, ${hexToRgba(moduleColor, 0.7)})`,
          width: `${(doneCount / lessons.length) * 100}%`,
          transition: "width 600ms ease-out",
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", whiteSpace: "nowrap" }}>
        {doneCount}/{lessons.length}
      </span>
    </div>
  );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", fontFamily: font }}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div style={{ overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{
          padding: "18px 24px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: moduleColor,
            boxShadow: `0 0 0 3px ${hexToRgba(moduleColor, 0.2)}`,
            flexShrink: 0,
          }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "#172b4d", letterSpacing: "-0.3px" }}>
            {moduleName}
          </span>
          {/* Progress bar — desktop only (right-aligned in header) */}
          {!isMobile && (
            <div style={{ marginLeft: "auto" }}>
              {progressBar}
            </div>
          )}
        </div>

        {/* ── SVG canvas ── */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
          aria-label={`${moduleName} lesson roadmap`}
        >
          <defs>
            {/* Coin shine (used on all nodes) */}
            <radialGradient id={shineId} cx="36%" cy="30%" r="52%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.5)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)"   />
            </radialGradient>

            {/* Module color glow filter (used for completed + current hover) */}
            <filter id={grnGlowId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
              <feFlood floodColor={moduleColor} floodOpacity="0.75" result="c" />
              <feComposite in="c" in2="b" operator="in" result="g" />
              <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Subtle grid */}
            <pattern id={gridId} width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ebebeb" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={svgW} height={svgH} fill="transparent" />
          <rect width={svgW} height={svgH} fill={`url(#${gridId})`} />

          {/* Full ghost curve (faint) */}
          <path
            d={fullCurve}
            fill="none" stroke="#ddd" strokeWidth="6"
            strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Flowing dashes on full curve */}
          <path
            d={fullCurve}
            fill="none" stroke={moduleColor} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="20 18" opacity="0.18"
            style={{ animation: "sk-flow 2s linear infinite" }}
          />

          {/* Completed/progress curve (draws in on mount) */}
          {progCurve && (
            <path
              ref={progPathRef}
              d={progCurve}
              fill="none"
              stroke={moduleColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={progLen}
              strokeDashoffset={animated ? 0 : progLen}
              style={{
                transition: animated ? "stroke-dashoffset 1.4s cubic-bezier(0.25,0,0.1,1)" : "none",
                filter: `drop-shadow(0 2px 6px ${hexToRgba(moduleColor, 0.35)})`,
              }}
            />
          )}

          {/* ── Nodes ── */}
          {pts.map((pt, i) => {
            const lesson   = lessons[i];
            const isDone   = lesson.state === "completed";
            const isCurr   = lesson.state === "current";
            const isLocked = lesson.state === "locked";
            const isHov    = hovered === i;

            const prog     = lesson.progress ?? 0;
            const ringR    = nodeR + 9;
            const ringCirc = 2 * Math.PI * ringR;
            const ringOff  = ringCirc * (1 - prog / 100);

            return (
              <g
                key={lesson.id}
                style={{
                  cursor: isLocked ? "default" : "pointer",
                  animation: animated ? `sk-nodeIn 300ms ${i * 85 + 500}ms cubic-bezier(0.34,1.56,0.64,1) both` : "none",
                  opacity: animated ? undefined : 0,
                  transformOrigin: `${pt.x}px ${pt.y}px`,
                }}
                onMouseEnter={() => { setTooltipPos(getNodeDomPos(i)); setHovered(i); }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { if (!isLocked) onLessonClick?.(lesson); }}
              >
                {/* Hit area */}
                <circle cx={pt.x} cy={pt.y} r={nodeR + 20} fill="transparent" />

                {/* ── COMPLETED: Module-colored with white checkmark ── */}
                {isDone && (
                  <g filter={isHov ? `url(#${grnGlowId})` : undefined}
                     style={{ transition: "filter 150ms" }}>
                    <circle cx={pt.x} cy={pt.y + 7 * sc} r={nodeR + 1} fill="rgba(0,0,0,0.18)" />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill={moduleColor} />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill={`url(#${shineId})`} />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
                    <polyline
                      points={`${pt.x - 13 * sc},${pt.y + 2 * sc} ${pt.x - 3 * sc},${pt.y + 12 * sc} ${pt.x + 14 * sc},${pt.y - 10 * sc}`}
                      fill="none" stroke="rgba(255,255,255,0.96)"
                      strokeWidth={5 * sc} strokeLinecap="round" strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* ── CURRENT: Green with progress ring & star ── */}
                {isCurr && (
                  <g>
                    <circle
                      cx={pt.x} cy={pt.y} r={nodeR + 18 * sc}
                      fill="none" stroke={moduleColor} strokeWidth="3"
                      style={{ transformBox: "fill-box", transformOrigin: "center", animation: "sk-pulseRing 1.8s ease-out infinite" }}
                    />
                    <circle
                      cx={pt.x} cy={pt.y} r={nodeR + 11 * sc}
                      fill="none" stroke={moduleColor} strokeWidth="2" opacity="0.3"
                      style={{ transformBox: "fill-box", transformOrigin: "center", animation: "sk-pulseRing 1.8s ease-out 0.4s infinite" }}
                    />
                    <circle cx={pt.x} cy={pt.y} r={ringR} fill="none" stroke={hexToRgba(moduleColor, 0.2)} strokeWidth="5.5" />
                    <circle cx={pt.x} cy={pt.y} r={ringR}
                      fill="none" stroke={moduleColor} strokeWidth="5.5"
                      strokeDasharray={ringCirc} strokeDashoffset={ringOff}
                      strokeLinecap="round"
                      style={{ transformBox: "fill-box", transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset 1s ease-out" }}
                    />
                    <circle cx={pt.x} cy={pt.y + 7 * sc} r={nodeR + 1} fill="rgba(0,0,0,0.16)" />
                    <circle cx={pt.x} cy={pt.y} r={nodeR}
                      fill={moduleColor}
                      filter={isHov ? `url(#${grnGlowId})` : undefined}
                      style={{ transition: "filter 150ms" }}
                    />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill={`url(#${shineId})`} />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
                    <polygon
                      points={starPoints(pt.x, pt.y, 14 * sc, 6 * sc)}
                      fill="rgba(255,255,255,0.96)"
                      style={{ animation: "sk-bounce 2.2s ease-in-out infinite", transformBox: "fill-box", transformOrigin: "center" }}
                    />
                  </g>
                )}

                {/* ── LOCKED: Dimmed green with padlock ── */}
                {isLocked && (
                  <g opacity={isHov ? 0.75 : 0.5} style={{ transition: "opacity 150ms" }}>
                    <circle cx={pt.x} cy={pt.y + 5 * sc} r={nodeR + 1} fill="rgba(0,0,0,0.08)" />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill={moduleColor} />
                    <circle cx={pt.x} cy={pt.y} r={nodeR} fill={`url(#${shineId})`} />
                    <path
                      d={`M ${pt.x - 9 * sc} ${pt.y - 2 * sc} L ${pt.x - 9 * sc} ${pt.y - 11 * sc} a ${9 * sc} ${9 * sc} 0 0 1 ${18 * sc} 0 L ${pt.x + 9 * sc} ${pt.y - 2 * sc}`}
                      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={4 * sc} strokeLinecap="round"
                    />
                    <rect x={pt.x - 12 * sc} y={pt.y - 2 * sc} width={24 * sc} height={19 * sc} rx={5 * sc}
                      fill="rgba(255,255,255,0.9)"
                    />
                    <circle cx={pt.x} cy={pt.y + 7.5 * sc} r={4 * sc} fill={moduleColor} />
                    <rect x={pt.x - 1.8 * sc} y={pt.y + 7.5 * sc} width={3.6 * sc} height={6 * sc} rx={sc} fill={moduleColor} />
                  </g>
                )}

                {/* Lesson number badge */}
                <text
                  x={pt.x} y={pt.y + nodeR + 20 * sc}
                  textAnchor="middle" fontSize={11 * sc} fontWeight="900" fontFamily={font}
                  fill={isDone ? moduleColor : isCurr ? moduleColor : "#c4cdd6"}
                  style={{ letterSpacing: "0.04em" }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Progress bar — mobile only (bottom of card) */}
        {isMobile && (
          <div style={{ padding: "0 24px 20px" }}>
            {progressBar}
          </div>
        )}
      </div>

      {/* ── Tooltip ── */}
      {hoveredLesson && (
        <div style={{
          position: "absolute",
          left: Math.max(150, Math.min(tooltipPos.x, ctrWidth - 150)),
          top: tooltipPos.y,
          transform: tooltipFlipsDown
            ? "translate(-50%, 16px)"
            : "translate(-50%, calc(-100% - 16px))",
          background: "#fff",
          border: "2px solid #e5e7eb",
          borderRadius: 16,
          padding: "14px 18px",
          boxShadow: "0 8px 0 #e0e0dc, 0 12px 28px rgba(0,0,0,0.1)",
          pointerEvents: "none",
          zIndex: 30,
          minWidth: 220,
          maxWidth: 280,
          fontFamily: font,
          animation: tooltipFlipsDown
            ? "sk-tooltipDown 130ms ease-out both"
            : "sk-tooltipUp 130ms ease-out both",
        }}>
          {/* Status dot + title */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: hoveredLesson.description ? 8 : 10 }}>
            <div style={{
              width: 9, height: 9, borderRadius: "50%", marginTop: 4, flexShrink: 0,
              background: hoveredLesson.state === "locked" ? "#d1d5db" : moduleColor,
              boxShadow: hoveredLesson.state === "locked" ? "none" : `0 0 0 3px ${hexToRgba(moduleColor, 0.25)}`,
            }} />
            <span style={{ fontWeight: 800, fontSize: 13, color: "#172b4d", lineHeight: 1.35 }}>
              {hoveredLesson.title}
            </span>
          </div>

          {/* Description (optional) */}
          {hoveredLesson.description && (
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55, margin: "0 0 10px 0" }}>
              {hoveredLesson.description}
            </p>
          )}

          {/* Status + XP */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
              color: hoveredLesson.state === "locked" ? "#9ca3af" : moduleColor,
            }}>
              {hoveredLesson.state === "completed" ? "✓ Completed"
               : hoveredLesson.state === "current"  ? "In Progress"
               : "Locked"}
            </span>
            {hoveredLesson.state !== "locked" && (
              <span style={{
                fontSize: 12, fontWeight: 900, color: "#f59e0b",
                background: "#fef3c7", borderRadius: 8, padding: "2px 8px",
              }}>
                +{hoveredLesson.xpReward} XP
              </span>
            )}
          </div>

          {/* Progress bar */}
          {hoveredLesson.state === "current" && hoveredLesson.progress != null && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#6b7280" }}>
                <span>Progress</span>
                <span style={{ fontWeight: 700, color: moduleColor }}>{hoveredLesson.progress}%</span>
              </div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99 }}>
                <div style={{
                  height: "100%", borderRadius: 99, background: moduleColor,
                  width: `${hoveredLesson.progress}%`, transition: "width 600ms ease-out",
                }} />
              </div>
            </div>
          )}

          {/* Unlock hint */}
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
