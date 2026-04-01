"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { colors, fonts, shadows } from "./tokens";

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
        justifyContent: "center",
        width: 240,
        height: 82,
        borderRadius: 42,
        background: colors.buttonBg,
        color: colors.white,
        fontFamily: fonts.sans,
        fontSize: 26,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: shadows.button,
        border: "none",
        userSelect: "none",
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: shadows.buttonHover,
        background: colors.buttonHover,
      }}
      whileTap={{
        scale: 0.98,
        background: colors.buttonPressed,
      }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
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
