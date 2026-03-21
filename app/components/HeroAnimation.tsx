"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// SVG viewBox 0 0 1000 700 → words use transform:translate(-50%,-50%)
// so top = SVG_y / 700 * 100% gives perfect alignment at any viewport height.
//
// Bounce vertices (straight L segments):
//   (20,  660) start   – bottom-left
//   (190, 240) Stock   – left 19%, top 34.3%
//   (370, 420) learning– left 37%, top 60%
//   (550, 160) that    – left 55%, top 22.9%
//   (720, 310) actually– left 72%, top 44.3%
//   (900,  80) clicks. – left 90%, top 11.4%
//   (960,  72) tail
//
// Cumulative arc lengths — EXACT for straight L segments:
//   sqrt(170²+420²)=453.1  → 453.1/1603.2 = 0.2826  Stock
//   +sqrt(180²+180²)=254.6 → 707.7/1603.2 = 0.4414  learning
//   +sqrt(180²+260²)=316.2 → 1023.9/1603.2= 0.6387  that
//   +sqrt(170²+150²)=226.7 → 1250.6/1603.2= 0.7801  actually
//   +sqrt(180²+230²)=292.1 → 1542.7/1603.2= 0.9623  clicks.
//
// Using exact fractions ensures the line tip IS at the word when it snaps in.

const WORDS = [
  { id: "w-stock",    text: "Stock",    progress: 0.2826, left: "19%", top: "34.3%" },
  { id: "w-learning", text: "learning", progress: 0.4414, left: "37%", top: "60%"   },
  { id: "w-that",     text: "that",     progress: 0.6387, left: "55%", top: "22.9%" },
  { id: "w-actually", text: "actually", progress: 0.7801, left: "72%", top: "44.3%" },
  { id: "w-clicks",   text: "clicks.",  progress: 0.9623, left: "90%", top: "11.4%", isClimax: true },
] as const;

const PATH =
  "M 20 660" +
  " L 190 240" +   // → Stock     (rising)
  " L 370 420" +   // → learning  (falling)
  " L 550 160" +   // → that      (rising)
  " L 720 310" +   // → actually  (falling)
  " L 900 80"  +   // → clicks.   (rising — final peak)
  " L 960 72";     // tail

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function HeroAnimation() {
  const pathRef   = useRef<SVGPathElement>(null);
  const arrowRef  = useRef<SVGGElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const dotRef    = useRef<SVGCircleElement>(null);
  const ringRef   = useRef<SVGCircleElement>(null);
  const rippleRef = useRef<SVGCircleElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const path = pathRef.current;
    const svg  = svgRef.current;
    if (!path || !svg) return;
    const pathEl = path;
    const svgEl = svg;

    // 1. Set dasharray/dashoffset so the line is invisible when drawn
    const totalLength = pathEl.getTotalLength();
    pathEl.style.strokeDasharray  = String(totalLength);
    pathEl.style.strokeDashoffset = String(totalLength);
    // 2. NOW reveal the SVG — line is hidden by dashoffset, not visibility hack
    svgEl.style.opacity = "1";

    const DURATION = 3400;
    let startTime: number | null = null;
    const triggered = new Set<string>();

    function snapWord(word: typeof WORDS[number]) {
      const el = document.getElementById(word.id);
      if (!el) return;
      el.style.transition = "none";
      el.style.opacity    = "1";

      if ("isClimax" in word && word.isClimax) {
        el.style.transform = "translate(-50%, -50%) scale(1.05)";
        setTimeout(() => {
          el.style.transition = "transform 200ms ease-out";
          el.style.transform  = "translate(-50%, -50%) scale(1)";
        }, 200);

        const ripple = rippleRef.current;
        if (ripple) {
          const rippleEl = ripple;
          const pt = pathEl.getPointAtLength(word.progress * totalLength);
          rippleEl.setAttribute("cx", String(pt.x));
          rippleEl.setAttribute("cy", String(pt.y));
          rippleEl.style.opacity = "1";
          rippleEl.setAttribute("r", "0");
          const rs = performance.now();
          function animRipple(now: number) {
            const p = Math.min((now - rs) / 700, 1);
            rippleEl.setAttribute("r", String(p * 80));
            rippleEl.style.opacity = String(1 - p);
            if (p < 1) requestAnimationFrame(animRipple);
          }
          requestAnimationFrame(animRipple);
        }
      }
    }

    function frame(now: number) {
      if (!startTime) startTime = now;
      const raw   = Math.min((now - startTime) / DURATION, 1);
      const eased = easeInOut(raw);

      // Draw line
      pathEl.style.strokeDashoffset = String(totalLength * (1 - eased));

      // Move arrowhead to the current tip with correct direction
      const arrow = arrowRef.current;
      if (arrow && eased > 0.005) {
        const tipLen    = eased * totalLength;
        const tip       = pathEl.getPointAtLength(tipLen);
        const behind    = pathEl.getPointAtLength(Math.max(0, tipLen - 3));
        const angle     = Math.atan2(tip.y - behind.y, tip.x - behind.x) * 180 / Math.PI;
        arrow.setAttribute("transform", `translate(${tip.x},${tip.y}) rotate(${angle})`);
        arrow.style.opacity = "1";
      }

      // Snap words
      for (const word of WORDS) {
        if (!triggered.has(word.id) && eased >= word.progress) {
          triggered.add(word.id);
          snapWord(word);
        }
      }

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      // ── Animation complete ─────────────────────────────────────

      // Endpoint dot + pulse ring
      const endpoint = pathEl.getPointAtLength(totalLength);
      const dot  = dotRef.current;
      const ring = ringRef.current;
      if (dot) {
        dot.setAttribute("cx", String(endpoint.x));
        dot.setAttribute("cy", String(endpoint.y));
        dot.style.opacity = "1";
      }
      if (ring) {
        const ringEl = ring;
        ring.setAttribute("cx", String(endpoint.x));
        ring.setAttribute("cy", String(endpoint.y));
        const rs = performance.now();
        function animRing(now: number) {
          const p = Math.min((now - rs) / 800, 1);
          ringEl.setAttribute("r", String(6 + p * 14));
          ringEl.style.opacity = String(0.55 * (1 - p));
          if (p < 1) requestAnimationFrame(animRing);
        }
        requestAnimationFrame(animRing);
      }

      // Fade out the entire SVG after a brief pause
      setTimeout(() => {
        svgEl.style.transition = "opacity 600ms ease-out";
        svgEl.style.opacity    = "0";

        // After SVG fades: animate words to the center line (form the sentence)
        setTimeout(() => {
          const wordEls = document.querySelectorAll<HTMLElement>(".ha-word");
          wordEls.forEach((el) => {
            el.style.transition = "top 750ms cubic-bezier(0.4, 0, 0.2, 1), transform 750ms cubic-bezier(0.4, 0, 0.2, 1)";
            el.style.top        = "50%";
            el.style.transform  = "translate(-50%, -50%)";
          });

          // CTA fades in after words settle
          setTimeout(() => {
            const cta = document.getElementById("ha-cta");
            if (cta) {
              cta.style.transition = "opacity 500ms ease-out, transform 500ms ease-out";
              cta.style.opacity    = "1";
              cta.style.transform  = "translateX(-50%) translateY(0)";
            }
          }, 850);
        }, 650);
      }, 500);
    }

    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(frame);
    }, 200);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        .ha-section {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 540px;
          background: #ffffff;
          overflow: hidden;
        }

        .ha-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 4% 90%, #f0fdf4 0%, transparent 46%);
          pointer-events: none;
        }

        /* opacity:0 set here (in the stylesheet) so it's in the SSR HTML.
           JS sets svg.style.opacity="1" (inline, higher specificity) after
           dashoffset is configured — so the line is never visible before ready. */
        .ha-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }

        /* transition: none — words snap in instantly (both CSS and JS enforce this) */
        .ha-word {
          position: absolute;
          font-family: var(--font-dm-serif, 'DM Serif Display', Georgia, serif);
          font-size: clamp(2.8rem, 5.5vw, 6.5rem);
          font-weight: 400;
          letter-spacing: -0.025em;
          color: #0f172a;
          white-space: nowrap;
          /* pivot at word centre — aligns with SVG coordinates */
          transform: translate(-50%, -50%);
          line-height: 1.1;
          pointer-events: none;
          user-select: none;
          transition: none;
        }

        #ha-cta {
          position: absolute;
          bottom: 8%;
          left: 50%;
          transform: translateX(-50%) translateY(14px);
          opacity: 0;
        }

        .ha-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #22c55e;
          color: #ffffff;
          font-family: var(--font-dm-sans, 'DM Sans', system-ui, sans-serif);
          font-weight: 600;
          font-size: 1.1rem;
          padding: 16px 40px;
          border-radius: 100px;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 4px 24px rgba(34,197,94,0.35);
          transition: transform 200ms ease-out, box-shadow 200ms ease-out;
        }
        .ha-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(34,197,94,0.55);
        }

        @media (max-width: 640px) {
          #w-actually { left: 64% !important; }
          #w-clicks   { left: 82% !important; }
          .ha-word    { font-size: clamp(1.6rem, 6vw, 3rem); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ha-word { opacity: 1 !important; transform: translate(-50%, -50%) !important; }
          .ha-svg  { display: none; }
          #ha-cta  { opacity: 1 !important; transform: translateX(-50%) !important; }
        }
      `}</style>

      <section className="ha-section" role="banner" aria-label="Stock learning that actually clicks.">
        <div className="ha-glow" />

        <svg
          ref={svgRef}
          className="ha-svg"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {/* Main line — hidden by dashoffset until animation starts */}
          <path
            ref={pathRef}
            d={PATH}
            stroke="#22c55e"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />

          {/* Arrowhead that tracks the live drawing tip */}
          <g ref={arrowRef} style={{ opacity: 0 }}>
            {/* Triangle: tip at origin (0,0), opening toward (-16,0) */}
            <polygon
              points="0,0 -16,-7 -16,7"
              fill="#22c55e"
            />
          </g>

          {/* Ripple burst when "clicks." snaps in */}
          <circle
            ref={rippleRef}
            r="0"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0 }}
          />

          {/* Endpoint dot */}
          <circle
            ref={dotRef}
            r="5"
            fill="#22c55e"
            style={{ opacity: 0, transition: "opacity 400ms ease-out" }}
          />

          {/* Pulse ring around endpoint */}
          <circle
            ref={ringRef}
            r="6"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0 }}
          />
        </svg>

        {/* Words — snap in instantly as line reaches each vertex */}
        {WORDS.map((word) => (
          <div
            key={word.id}
            id={word.id}
            className="ha-word"
            style={{ left: word.left, top: word.top, opacity: 0 }}
          >
            {word.text}
          </div>
        ))}

        {/* CTA — appears after words gather into the sentence */}
        <div id="ha-cta">
          <Link href="/onboarding" className="ha-cta-btn">
            Start Learning →
          </Link>
        </div>
      </section>
    </>
  );
}
