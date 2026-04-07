"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";

export interface HeroProps {
  /** Called immediately on CTA click — parent uses this to start background blur */
  onCTAClick?: () => void;
  /** When true, video blurs + dims to become the onboarding background */
  overlayActive?: boolean;
}

// ── Timing constants — all values in ms ──────────────────────────────────────
const T = {
  logoDelay:          40,
  logoDuration:      580,

  lineOneDelay:        0,
  lineOneDuration:  1380,

  lineTwoDelay:      340,
  lineTwoDuration:  1480,

  ctaDelay:          740,
  ctaDuration:       860,

  blurAmount:       "5px",
  settleDistance:  "18px",
  ctaSettle:        "8px",

  // Dissolve-out timing
  dissolveDuration:  360,    // text exits over this duration
  atmosphereFade:    520,    // atmosphere layers linger slightly longer

  // Reveal fallback
  fallbackRevealMs:  3200,   // used until metadata gives us the real duration
  revealTailMs:       120,   // keeps the reveal from feeling early versus video end
} as const;

export function Hero({ onCTAClick, overlayActive = false }: HeroProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRevealedRef = useRef(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [revealed,    setRevealed]    = useState(false);
  const [dissolving,  setDissolving]  = useState(false);

  // Logo fires on mount
  useEffect(() => {
    const id = setTimeout(() => setLogoVisible(true), T.logoDelay);
    return () => clearTimeout(id);
  }, []);

  const clearRevealTimeout = useCallback(() => {
    if (revealTimeoutRef.current !== null) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }, []);

  const revealOnce = useCallback(() => {
    if (hasRevealedRef.current) {
      return;
    }

    hasRevealedRef.current = true;
    clearRevealTimeout();
    setRevealed(true);
  }, [clearRevealTimeout]);

  const scheduleRevealFallback = useCallback((ms: number) => {
    if (hasRevealedRef.current) {
      return;
    }

    clearRevealTimeout();
    revealTimeoutRef.current = setTimeout(() => {
      revealOnce();
    }, ms);
  }, [clearRevealTimeout, revealOnce]);

  // Headline + CTA fire at video end, with timeout/error fallbacks if playback never completes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const scheduleFromVideoState = () => {
      const hasRealDuration = Number.isFinite(video.duration) && video.duration > 0;
      const durationMs = hasRealDuration
        ? Math.round(video.duration * 1000) + T.revealTailMs
        : T.fallbackRevealMs;

      scheduleRevealFallback(durationMs);
    };

    const handleEnded = () => revealOnce();
    const handleError = () => revealOnce();

    scheduleFromVideoState();

    if (video.readyState >= 1) {
      scheduleFromVideoState();
    }

    video.addEventListener("loadedmetadata", scheduleFromVideoState);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("abort", handleError);

    return () => {
      clearRevealTimeout();
      video.removeEventListener("loadedmetadata", scheduleFromVideoState);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("abort", handleError);
    };
  }, [clearRevealTimeout, revealOnce, scheduleRevealFallback]);

  function handleCTAClick() {
    setDissolving(true);
    onCTAClick?.();
  }

  return (
    <section style={{
      position: "relative",
      width: "100%",
      height: "100dvh",
      minHeight: 600,
      overflow: "hidden",
      background: "#060606",
    }}>

      {/* ── Video — stays mounted, blurs when overlay is active ────────────── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          filter: overlayActive
            ? "brightness(0.52) blur(9px) saturate(1.08)"
            : "brightness(0.84)",
          transition: "filter 1.0s cubic-bezier(0.4, 0, 0.2, 1)",
          // Slight scale prevents blur fringe at edges
          transform: "scale(1.04)",
        }}
      >
        <source src="/finalvid.mp4" type="video/mp4" />
      </video>

      {/*
        ── Atmosphere layers — fade away as text dissolves ───────────────────
           When dissolving, these become unnecessary and their presence would
           make the final-frame mountain look artificially veiled.
      */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          opacity: dissolving ? 0 : 1,
          transition: `opacity ${T.atmosphereFade}ms ease`,
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.10) 17%, rgba(0,0,0,0) 33%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.26) 28%, rgba(0,0,0,0) 52%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 54% at 8% 53%, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 70%)",
        }} />
      </div>

      {/*
        ── All text content — wrapped so dissolve is one CSS transition ──────
           When dissolving: lifts up, blurs, fades out.
           The individual --in animations are left-to-opacity:1 fill, and the
           parent transition overrides that final state cleanly.
      */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: dissolving ? "none" : undefined,
          opacity:   dissolving ? 0 : 1,
          filter:    dissolving ? "blur(3px)" : "blur(0px)",
          transform: dissolving ? "translateY(-10px)" : "translateY(0px)",
          transition: dissolving
            ? `opacity ${T.dissolveDuration}ms ease, filter ${T.dissolveDuration}ms ease, transform ${T.dissolveDuration}ms cubic-bezier(0.4, 0, 0.6, 1)`
            : "none",
        }}
      >
        {/* ── Logo — top center ──────────────────────────────────────────── */}
        <div
          className={`ch-logo${logoVisible ? " ch-logo--in" : ""}`}
          style={{
            position: "absolute",
            top: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <Image
            src="/Logo-Final.png"
            alt="Stoked"
            width={800}
            height={800}
            priority
            style={{
              width: 160,
              height: 160,
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
              userSelect: "none",
            }}
          />
        </div>

        {/* ── Content block — left valley ──────────────────────────────────── */}
        <div style={{
          position: "absolute",
          top: "clamp(27%, 31vh, 40%)",
          left: "clamp(52px, 7.5vw, 112px)",
          maxWidth: "clamp(300px, 42vw, 520px)",
        }}>

          <h1 style={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: "clamp(46px, 5.8vw, 78px)",
            lineHeight: 1.0,
            letterSpacing: "-0.01em",
            color: "#ede8de",
            margin: 0,
            padding: 0,
          }}>
            <span
              className={`ch-line1${revealed ? " ch-line1--in" : ""}`}
              style={{
                display: "block",
                textShadow: "0 1px 16px rgba(0,0,0,0.68), 0 4px 32px rgba(0,0,0,0.36)",
              }}
            >
              Start at the bottom.
            </span>
            <span
              className={`ch-line2${revealed ? " ch-line2--in" : ""}`}
              style={{
                display: "block",
                marginTop: "0.09em",
                textShadow: "0 1px 16px rgba(0,0,0,0.68), 0 4px 32px rgba(0,0,0,0.36)",
              }}
            >
              Climb with every lesson.
            </span>
          </h1>

          <div
            className={`ch-cta-wrap${revealed ? " ch-cta-wrap--in" : ""}`}
            style={{ marginTop: 34 }}
          >
            <button
              className="ch-cta"
              onClick={handleCTAClick}
              type="button"
              disabled={dissolving}
            >
              Start Your Climb
            </button>
          </div>
        </div>
      </div>

      {/* ── Styles ─────────────────────────────────────────────────────────── */}
      <style jsx global>{`

        /* Logo: soft settle on mount */
        @keyframes ch-logo-settle {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ch-logo     { opacity: 0; }
        .ch-logo--in {
          animation: ch-logo-settle ${T.logoDuration}ms cubic-bezier(0.22, 1, 0.36, 1) ${T.logoDelay}ms both;
        }

        /* Headline lines: blur-to-sharp + upward settle */
        @keyframes ch-line-emerge {
          from {
            opacity: 0;
            transform: translateY(${T.settleDistance});
            filter: blur(${T.blurAmount});
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .ch-line1, .ch-line2 { opacity: 0; }
        .ch-line1--in {
          animation: ch-line-emerge ${T.lineOneDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${T.lineOneDelay}ms both;
        }
        .ch-line2--in {
          animation: ch-line-emerge ${T.lineTwoDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${T.lineTwoDelay}ms both;
        }

        /* CTA: rise + fade */
        @keyframes ch-cta-rise {
          from { opacity: 0; transform: translateY(${T.ctaSettle}); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ch-cta-wrap     { opacity: 0; }
        .ch-cta-wrap--in {
          animation: ch-cta-rise ${T.ctaDuration}ms cubic-bezier(0.22, 1, 0.36, 1) ${T.ctaDelay}ms both;
        }

        /* CTA button */
        .ch-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-dm-sans, 'DM Sans', system-ui, sans-serif);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.012em;
          color: #111111;
          background-color: #e8e2d4;
          border: none;
          padding: 0 30px;
          height: 52px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.58),
            0 2px 8px rgba(0,0,0,0.28),
            0 8px 28px rgba(0,0,0,0.22);
          transition:
            background-color 0.18s ease,
            transform        0.18s ease,
            box-shadow       0.18s ease;
          white-space: nowrap;
          user-select: none;
        }
        .ch-cta:hover {
          background-color: #f0ece3;
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.64),
            0 4px 12px rgba(0,0,0,0.30),
            0 12px 40px rgba(0,0,0,0.24);
        }
        .ch-cta:active {
          transform: translateY(0);
          transition-duration: 0.06s;
        }

        @media (max-width: 600px) {
          .ch-line1--in { animation-duration: ${Math.round(T.lineOneDuration * 0.82)}ms; }
          .ch-line2--in { animation-duration: ${Math.round(T.lineTwoDuration * 0.82)}ms; }
          .ch-cta { font-size: 14px; height: 48px; padding: 0 24px; }
        }

      `}</style>
    </section>
  );
}
