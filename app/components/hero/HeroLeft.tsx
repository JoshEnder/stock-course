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
        maxWidth: 540,
      }}
    >
      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: fonts.sans,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: colors.green,
          margin: 0,
          marginBottom: 18,
          opacity: 0.80,
        }}
      >
        Interactive Market Learning
      </motion.p>

      {/*
        Three lines. The pause after "a logic." is the beat.
        Italic command on its own line — no qualifier needed.
      */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: fonts.serif,
          fontSize: "clamp(72px, 7.4vw, 114px)",
          fontWeight: 600,
          color: colors.headline,
          lineHeight: 0.91,
          letterSpacing: "-0.036em",
          margin: 0,
        }}
      >
        Markets have
        <br />
        a logic.
        <br />
        <span style={{ fontStyle: "italic" }}>Read it.</span>
      </motion.h1>

      {/*
        Directly references what's on the right.
        Short enough to read in one glance.
      */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.56, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: fonts.sans,
          fontSize: "clamp(16px, 1.6vw, 18px)",
          fontWeight: 400,
          color: colors.sub,
          margin: 0,
          marginTop: 26,
          lineHeight: 1.5,
          maxWidth: 290,
          letterSpacing: "-0.01em",
        }}
      >
        Three layers. One decision.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: 34 }}
      >
        <Button href="/experience">Make Your First Call</Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.44, delay: 0.40 }}
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          fontWeight: 400,
          color: colors.helper,
          margin: 0,
          marginTop: 13,
          letterSpacing: "0.01em",
        }}
      >
        No signup required.
      </motion.p>
    </div>
  );
}
