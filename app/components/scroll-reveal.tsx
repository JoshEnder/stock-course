"use client";

import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: ScrollRevealProps) {
  return (
    <div
      className={`opacity-100 translate-y-0 ${className}`.trim()}
      style={{
        animationDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
