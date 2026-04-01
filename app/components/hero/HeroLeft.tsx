"use client";

import { motion } from "framer-motion";
import { Button } from "./Button";
import { colors, fonts } from "./tokens";

export function HeroLeft() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 0,
        maxWidth: 580,
      }}
    >
      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: fonts.serif,
          fontSize: "clamp(64px, 7.5vw, 110px)",
          fontWeight: 600,
          color: colors.headline,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Where{" "}
        <br />
        Stock Learning{" "}
        <br />
        <span style={{ fontStyle: "italic" }}>Becomes</span>
        <br />
        Instinct.
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: fonts.sans,
          fontSize: "clamp(22px, 2.2vw, 31px)",
          fontWeight: 400,
          color: colors.sub,
          margin: 0,
          marginTop: 28,
          lineHeight: 1.35,
        }}
      >
        Learn investing like a pro.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: 40 }}
      >
        <Button href="/experience">Get Started</Button>
      </motion.div>

      {/* Helper text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        style={{
          fontFamily: fonts.sans,
          fontSize: 19,
          fontWeight: 400,
          color: colors.helper,
          margin: 0,
          marginTop: 18,
        }}
      >
        Tap to explore. No signup needed.
      </motion.p>
    </div>
  );
}
