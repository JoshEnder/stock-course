"use client";

import { motion } from "framer-motion";
import StokedMark from "./StokedMark";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

interface ScreenWelcomeProps {
  headline: string;
  sub: string;
}

export default function ScreenWelcome({ headline, sub }: ScreenWelcomeProps) {
  return (
    // Matches css-1dckcok: flex col, items-center, justify-center, w-full, h-full, pt-[117px], gap-2
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        paddingTop: 117,
        margin: "0 auto",
        gap: 8,
      }}
    >
      {/* Character area — css-4r16bs: flex col, items-center, gap-4, max-w-[290px], h-[240px], px-5 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: CONTENT_W,
          width: "100%",
          height: 240,
          paddingLeft: 20,
          paddingRight: 20,
          gap: 20,
          justifyContent: "center",
        }}
      >
        {/* Mark — replaces 150x150 Rive canvas (css-50xotc) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <StokedMark size={96} pulse />
        </motion.div>

        {/* Text block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: font,
              fontSize: 18,
              fontWeight: 600,
              color: "#111111",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {headline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, delay: 0.22 }}
            style={{
              fontFamily: font,
              fontSize: 15,
              color: "#6b7280",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 240,
            }}
          >
            {sub}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
