"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { colors, fonts } from "./tokens";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ href = "/experience", onClick, children }: ButtonProps) {
  const inner = (
    <motion.span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        minWidth: 220,
        height: 58,
        padding: "0 28px",
        borderRadius: 999,
        background:
          "linear-gradient(170deg, #3E4349 0%, #262B30 52%, #1A1E22 100%)",
        color: colors.white,
        fontFamily: fonts.sans,
        fontSize: 17,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        cursor: "pointer",
        boxShadow:
          "0 10px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.28)",
        border: "1px solid rgba(255,255,255,0.10)",
        userSelect: "none",
      }}
      whileHover={{
        scale: 1.012,
        boxShadow:
          "0 14px 34px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.32)",
      }}
      whileTap={{ scale: 0.982 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {/* Green status dot */}
      <span
        style={{
          flexShrink: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors.green,
          boxShadow: `0 0 8px ${colors.greenGlow}, 0 0 3px ${colors.green}`,
        }}
      />
      {children}
    </motion.span>
  );

  if (onClick) {
    return (
      <button onClick={onClick} style={{ background: "none", border: "none", padding: 0 }}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}
