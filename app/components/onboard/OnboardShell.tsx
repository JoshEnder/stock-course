"use client";

import { motion, AnimatePresence } from "framer-motion";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

// Content column — scaled up for desktop presence while remaining composed
export const CONTENT_W = 480;

export interface ShellCTA {
  label: string;
  enabled: boolean;
  onClick: () => void;
  href?: string;
}

interface OnboardShellProps {
  progress: number;       // 0–100
  totalSteps: number;
  currentStep: number;
  showBack: boolean;
  onBack: () => void;
  cta: ShellCTA | null;   // null hides the bottom tray entirely
  children: React.ReactNode;
  stepKey: string;
  direction: 1 | -1;
}

const variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 16 : -16 }),
  center: { opacity: 1, y: 0 },
  exit:  (dir: number) => ({ opacity: 0, y: dir > 0 ? -12 : 12 }),
};

export default function OnboardShell({
  progress,
  totalSteps,
  currentStep,
  showBack,
  onBack,
  cta,
  children,
  stepKey,
  direction,
}: OnboardShellProps) {
  return (
    <div style={{
      height: "100dvh",
      overflow: "hidden",
      // Dark scrim instead of white wash — preserves the mountain's tonal
      // depth and contrast. The question card provides its own local legibility.
      background: "rgba(8,12,18,0.38)",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>

        {/* ── HEADER — back button + route progress ─────────────────────── */}
        {/* No background — sits transparently over the mountain scrim */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            position: "sticky",
            top: 0,
            zIndex: 50,
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          {/* Back button row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 16,
            height: 52,
          }}>
            <div style={{ width: 36, flexShrink: 0 }}>
              <AnimatePresence>
                {showBack && (
                  <motion.button
                    key="back"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    onClick={onBack}
                    aria-label="Go back"
                    whileTap={{ scale: 0.92 }}
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.82)",
                      borderRadius: 8,
                      outline: "none",
                      padding: 0,
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18L9 12L15 6" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Route progress — full-width line at bottom of header, no container */}
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-valuenow={currentStep}
            aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
            style={{
              width: "100%",
              height: 1.5,
              backgroundColor: "rgba(255,255,255,0.12)",
              position: "relative",
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%",
                backgroundColor: "#10b981",
                position: "relative",
              }}
            >
              {/* Leading dot — position marker on the route */}
              <div style={{
                position: "absolute",
                right: -3,
                top: "50%",
                transform: "translateY(-50%)",
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 6px rgba(16,185,129,0.6)",
              }} />
            </motion.div>
          </div>
        </div>

        {/* ── CONTENT ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", width: "100%", overflowY: "auto", flex: 1, padding: "0 16px" }}>
          <div style={{ display: "flex", width: "100%", minHeight: "calc(100dvh - 53px)" }}>
            {/* Glass card — gives the question block local legibility without
                killing the mountain behind. Soft white glass, no hard edges. */}
            <div style={{
              display: "flex",
              width: "100%",
              borderRadius: 20,
              marginTop: 12,
              marginBottom: 12,
              background: "rgba(255,255,255,0.72)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 2px 24px rgba(0,0,0,0.10)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              overflow: "hidden",
            } as React.CSSProperties}>
              <div style={{ display: "flex", width: "100%", textWrap: "pretty" } as React.CSSProperties}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={stepKey}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "flex", width: "100%" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FIXED CTA TRAY — only when CTA provided ──────────────────── */}
      <AnimatePresence>
        {cta && (
          <motion.div
            key="cta-tray"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 20,
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
              zIndex: 20,
              background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.88) 36%, rgba(255,255,255,0.96) 100%)",
            }}
          >
            <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", maxWidth: 360 }}>
                {cta.href && cta.enabled ? (
                  <motion.a
                    href={cta.href}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98, y: 1 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      height: 56,
                      padding: "0 28px",
                      fontFamily: font,
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      textDecoration: "none",
                      cursor: "pointer",
                      backgroundColor: "#111111",
                      color: "#ffffff",
                      boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 8px rgba(0,0,0,0.24), 0 8px 28px rgba(0,0,0,0.18)",
                    }}
                  >
                    {cta.label}
                  </motion.a>
                ) : (
                  <motion.button
                    animate={{
                      backgroundColor: cta.enabled ? "#111111" : "#ececeb",
                      color: cta.enabled ? "#ffffff" : "#a8a8a6",
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    whileHover={cta.enabled ? { y: -1 } : {}}
                    whileTap={cta.enabled ? { scale: 0.98, y: 1 } : {}}
                    onClick={cta.enabled ? cta.onClick : undefined}
                    disabled={!cta.enabled}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      appearance: "none",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      outline: "none",
                      border: "none",
                      borderRadius: 12,
                      height: 56,
                      padding: "0 28px",
                      fontFamily: font,
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      cursor: cta.enabled ? "pointer" : "default",
                      boxShadow: cta.enabled
                        ? "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 8px rgba(0,0,0,0.24), 0 8px 28px rgba(0,0,0,0.18)"
                        : "none",
                    }}
                  >
                    {cta.label}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
