"use client";

import { motion } from "framer-motion";

interface StokedMarkProps {
  size?: number;
  pulse?: boolean;
}

export default function StokedMark({ size = 56, pulse = false }: StokedMarkProps) {
  const r = Math.round(size * 0.22);

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      {/* Outer shape */}
      <motion.div
        animate={pulse ? { rotate: [12, 16, 12] } : { rotate: 12 }}
        transition={pulse ? { duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 } : {}}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          backgroundColor: "#10b981",
        }}
      />
      {/* Inner square */}
      <div
        style={{
          position: "absolute",
          inset: "30%",
          backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: Math.round(r * 0.4),
          transform: "rotate(-12deg)",
        }}
      />
      {/* Pulsing ring */}
      {pulse && (
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0, 0.22] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -size * 0.1,
            borderRadius: r + size * 0.1,
            border: "1.5px solid #10b981",
            transform: "rotate(12deg)",
          }}
        />
      )}
    </div>
  );
}
