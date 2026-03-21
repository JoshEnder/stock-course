"use client";

import { useEffect, useRef } from "react";
import { triggerProgressFill } from "../lib/animations";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className = "" }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    const from = prevValueRef.current;
    const to = Math.max(0, Math.min(value, 100));
    if (from !== to) {
      triggerProgressFill(fill, from, to);
      prevValueRef.current = to;
    }
  }, [value]);

  return (
    <div
      aria-label={`Progress ${Math.round(value)} percent`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(value)}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}
      role="progressbar"
    >
      <div
        ref={fillRef}
        className="progress-fill h-full rounded-full bg-primary"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

