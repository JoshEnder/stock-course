"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";

interface FundingPath {
  id: string;
  label: string;
  icon: string;
  benefit: string;
  cost: string;
  consequence: string;
  highlighted?: boolean;
}

interface FundingThreePathProps {
  paths: FundingPath[];
  conclusion?: string;
  onReadyChange?: (ready: boolean) => void;
}

function PathIcon({ icon }: { icon: string }) {
  if (icon === "bank") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6}>
        <path d="M3 10L12 3l9 7v1H3v-1Z" strokeLinejoin="round" />
        <rect x="5" y="11" width="2" height="7" rx="0.5" />
        <rect x="11" y="11" width="2" height="7" rx="0.5" />
        <rect x="17" y="11" width="2" height="7" rx="0.5" />
        <rect x="2" y="18" width="20" height="2" rx="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (icon === "handshake") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6}>
        <path d="M7 11l2-2 3 3 2-2 3 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 13l4-4 4 4-4 4-4-4Z" strokeLinejoin="round" />
        <path d="M22 11l-4-4-4 4 4 4 4-4Z" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6}>
      <polyline points="3,17 9,11 13,15 21,7" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17,7 21,7 21,11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FundingThreePath({
  paths,
  conclusion = "Most high-growth companies eventually go public.",
  onReadyChange,
}: FundingThreePathProps) {
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const allExplored = paths.length > 0 && paths.every((p) => explored.has(p.id));

  useEffect(() => {
    onReadyChange?.(allExplored);
  }, [allExplored, onReadyChange]);

  const handleTap = useCallback((id: string) => {
    setExplored((prev) => new Set([...prev, id]));
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="space-y-3">
      {paths.map((path, i) => {
        const isExpanded = expanded === path.id;
        const isExplored = explored.has(path.id);

        return (
          <motion.button
            key={path.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 220, damping: 22 }}
            onClick={() => handleTap(path.id)}
            type="button"
            className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
              path.highlighted
                ? isExplored
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-emerald-200 bg-emerald-50/60"
                : isExplored
                  ? "border-slate-300 bg-slate-50"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    path.highlighted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <PathIcon icon={path.icon} />
                </div>
                <div>
                  <p className={`font-black text-sm ${path.highlighted ? "text-emerald-800" : "text-slate-900"}`}>
                    {path.label}
                  </p>
                  {path.highlighted && !isExplored && (
                    <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                      Popular choice
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExplored && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white"
                  >
                    ✓
                  </motion.span>
                )}
                <span className="text-slate-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-black text-emerald-600">
                        +
                      </span>
                      <p className="text-sm text-emerald-700">{path.benefit}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[9px] font-black text-red-500">
                        −
                      </span>
                      <p className="text-sm text-red-600">{path.cost}</p>
                    </div>
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-[11px] font-semibold text-slate-500">{path.consequence}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}

      <AnimatePresence>
        {allExplored && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-base">→</span>
              <p className="text-sm font-bold text-emerald-700">{conclusion}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!allExplored && (
        <p className="text-center text-[11px] text-slate-400">
          Tap all {paths.length} options to explore the consequences
        </p>
      )}
    </div>
  );
}
