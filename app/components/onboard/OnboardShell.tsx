"use client";

import { motion, AnimatePresence } from "framer-motion";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

// The maximum width of the usable content column — strict, never exceeded
export const CONTENT_W = 344;

export interface ShellCTA {
  label: string;
  enabled: boolean;
  onClick: () => void;
  /** If true, renders an <a> tag instead of button */
  href?: string;
}

interface OnboardShellProps {
  progress: number;       // 0–100
  totalSteps: number;
  currentStep: number;
  showBack: boolean;
  onBack: () => void;
  cta: ShellCTA;
  children: React.ReactNode;
  stepKey: string;        // AnimatePresence key
  direction: 1 | -1;
}

const variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 14 : -14 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -10 : 10 }),
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
    // Brilliant outer: h-dvh, overflow-hidden
    <div style={{ height: "100dvh", overflow: "hidden", backgroundColor: "#ffffff" }}>

      {/* Outer flex column — css-959iao */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>

        {/* ── STICKY HEADER — matches Brilliant's panda header ── */}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          aria-valuetext={`Step ${currentStep} of ${totalSteps}`}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 0,
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            left: 0,
            width: "100vw",
            maxWidth: 800,
            minHeight: 52,
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingRight: 44,
            zIndex: 50,
            boxShadow: "none",
          }}
        >
          {/* Back button slot — invisible spacer when hidden */}
          <div style={{ minWidth: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence>
              {showBack && (
                <motion.button
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={onBack}
                  aria-label="Go back"
                  style={{
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: 18,
                    borderRadius: 8,
                    outline: "none",
                    fontFamily: font,
                  }}
                >
                  ←
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar track */}
          <div
            style={{
              flex: 1,
              height: 6,
              backgroundColor: "#f0f0f0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                height: "100%",
                backgroundColor: "#10b981",
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        {/* ── CONTENT AREA — css-rvai0c + css-1nffv9d ── */}
        <div style={{ display: "flex", width: "100%", paddingBottom: 0, overflowY: "auto", flex: 1 }}>
          <div
            style={{
              display: "flex",
              paddingTop: 16,
              paddingBottom: 16,
              minHeight: "75vh",
              width: "100%",
            }}
          >
            {/* text-wrap:pretty — css-1sk0222 */}
            <div style={{ display: "flex", width: "100%", textWrap: "pretty" } as React.CSSProperties}>

              {/* Animated page transition */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={stepKey}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: "flex", width: "100%" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>

            </div>
          </div>
        </div>

      </div>

      {/* ── FIXED BOTTOM CTA TRAY — css-1t9hoq8 ── */}
      <div
        style={{
          display: "flex",
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "auto",
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 16,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
          zIndex: 20,
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Center wrapper */}
        <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
          {/* Button column — max 280px, matches Brilliant */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", maxWidth: 280 }}>
            {cta.href && cta.enabled ? (
              <motion.a
                href={cta.href}
                animate={{
                  backgroundColor: "#111111",
                  color: "#ffffff",
                }}
                whileTap={{ scale: 0.97, y: 2, boxShadow: "0 0px 0 rgba(0,0,0,0.3)" }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9999,
                  padding: "15px 24px",
                  fontFamily: font,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.28), 0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                {cta.label}
              </motion.a>
            ) : (
              <motion.button
                animate={{
                  backgroundColor: cta.enabled ? "#111111" : "#e9e9e9",
                  color: cta.enabled ? "#ffffff" : "#b0b0b0",
                  boxShadow: cta.enabled
                    ? "0 2px 0 rgba(0,0,0,0.28), 0 4px 20px rgba(0,0,0,0.1)"
                    : "none",
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                whileTap={cta.enabled ? { scale: 0.97, y: 2, boxShadow: "0 0px 0 rgba(0,0,0,0.3)" } : {}}
                onClick={cta.enabled ? cta.onClick : undefined}
                disabled={!cta.enabled}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  appearance: "none",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                  outline: "none",
                  border: "none",
                  borderRadius: 9999,
                  padding: "15px 24px",
                  fontFamily: font,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  cursor: cta.enabled ? "pointer" : "default",
                }}
              >
                {cta.label}
              </motion.button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
