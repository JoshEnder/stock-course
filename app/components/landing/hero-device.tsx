"use client";

import { motion } from "framer-motion";
import { landingTheme } from "./theme";

const { colors, fonts } = landingTheme;

/* ---------- shared phone shell ---------- */

function PhoneShell({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "soft";
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[2.6rem]"
      style={{
        background: "linear-gradient(180deg, #111319 0%, #05070c 100%)",
        padding: "9px",
        boxShadow:
          "0 70px 140px -36px rgba(11,21,48,0.5), 0 24px 52px -20px rgba(11,21,48,0.28), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="relative overflow-hidden rounded-[2.05rem]"
        style={{
          background:
            tone === "light"
              ? "linear-gradient(180deg, #ffffff 0%, #f7f8f3 100%)"
              : "linear-gradient(180deg, #f7f9f3 0%, #eef2e8 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-0 z-10 h-[1.45rem] w-[6.5rem] -translate-x-1/2 rounded-b-[1rem]"
          style={{ background: "#05070c" }}
        />
        {children}
      </div>
    </div>
  );
}

/* ---------- primary phone: live lesson ---------- */

function LessonPhone() {
  const choices = [
    { text: "Buyers see a stronger Nike", state: "correct" as const },
    { text: "Nike issued more shares", state: "default" as const },
    { text: "The ticker symbol changed", state: "default" as const },
  ];

  return (
    <PhoneShell tone="light">
      <div className="px-[1.35rem] pb-[1.6rem] pt-[2.75rem]">
        {/* top meta row */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em]"
            style={{
              background: colors.greenSoft,
              color: colors.greenDeep,
              fontFamily: fonts.sans,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: colors.green }}
            />
            Lesson 04
          </span>
          <span
            className="text-[0.7rem] font-semibold tabular-nums"
            style={{ color: colors.textMuted, fontFamily: fonts.sans }}
          >
            4&nbsp;/&nbsp;12
          </span>
        </div>

        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-[rgba(11,21,48,0.07)]">
          <div
            className="h-full rounded-full"
            style={{
              width: "33%",
              background:
                "linear-gradient(90deg, #13c76a 0%, #7ee6aa 100%)",
            }}
          />
        </div>

        {/* prompt */}
        <p
          className="mt-[1.6rem] text-[0.66rem] font-bold uppercase tracking-[0.22em]"
          style={{ color: colors.textMuted, fontFamily: fonts.sans }}
        >
          The Scenario
        </p>
        <h2
          className="mt-2 text-[1.4rem] leading-[1.08]"
          style={{
            color: colors.text,
            fontFamily: fonts.serif,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Nike beats earnings. The stock jumps 4%.
          <br />
          <span style={{ color: colors.textSoft, fontStyle: "italic" }}>
            What actually moved?
          </span>
        </h2>

        {/* chart */}
        <div
          className="mt-4 overflow-hidden rounded-[1.1rem] border px-[0.95rem] py-[0.85rem]"
          style={{
            borderColor: "rgba(11,21,48,0.07)",
            background:
              "linear-gradient(180deg, #ffffff 0%, #f9fbf5 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <p
                className="text-[0.58rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: colors.textMuted, fontFamily: fonts.sans }}
              >
                NKE · Post-earnings
              </p>
              <p
                className="mt-0.5 text-[1.25rem] font-semibold tabular-nums"
                style={{
                  color: colors.text,
                  fontFamily: fonts.sans,
                  letterSpacing: "-0.025em",
                }}
              >
                $104.82
              </p>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[0.66rem] font-bold tabular-nums"
              style={{
                background: colors.greenSoft,
                color: colors.greenDeep,
                fontFamily: fonts.sans,
              }}
            >
              ▲ 4.18%
            </span>
          </div>

          <svg viewBox="0 0 320 62" className="mt-2 w-full">
            <defs>
              <linearGradient id="lessonFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(19,199,106,0.32)" />
                <stop offset="100%" stopColor="rgba(19,199,106,0)" />
              </linearGradient>
              <filter id="lessonGlow" x="-5%" y="-50%" width="110%" height="200%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>
            <path
              d="M0 46 L 22 44 L 44 47 L 66 40 L 88 42 L 110 36 L 132 38 L 154 30 L 176 27 L 198 21 L 220 18 L 242 12 L 264 10 L 286 6 L 320 3 L 320 62 L 0 62 Z"
              fill="url(#lessonFill)"
            />
            <path
              d="M0 46 L 22 44 L 44 47 L 66 40 L 88 42 L 110 36 L 132 38 L 154 30 L 176 27 L 198 21 L 220 18 L 242 12 L 264 10 L 286 6 L 320 3"
              fill="none"
              stroke={colors.green}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lessonGlow)"
            />
            <path
              d="M0 46 L 22 44 L 44 47 L 66 40 L 88 42 L 110 36 L 132 38 L 154 30 L 176 27 L 198 21 L 220 18 L 242 12 L 264 10 L 286 6 L 320 3"
              fill="none"
              stroke={colors.green}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="320" cy="3" r="3" fill={colors.green} />
            <circle
              cx="320"
              cy="3"
              r="6"
              fill="none"
              stroke={colors.green}
              strokeWidth="1"
              opacity="0.35"
            />
          </svg>
        </div>

        {/* answers */}
        <ul className="mt-[1.15rem] space-y-[0.55rem]">
          {choices.map((c) => {
            const correct = c.state === "correct";
            return (
              <li
                key={c.text}
                className="flex items-center gap-3 rounded-[0.95rem] border px-[0.9rem] py-[0.7rem] text-[0.85rem]"
                style={{
                  borderColor: correct
                    ? "rgba(19,199,106,0.55)"
                    : "rgba(11,21,48,0.08)",
                  background: correct
                    ? "linear-gradient(180deg, rgba(19,199,106,0.12) 0%, rgba(19,199,106,0.06) 100%)"
                    : "#ffffff",
                  color: colors.text,
                  fontFamily: fonts.sans,
                  fontWeight: correct ? 600 : 500,
                  boxShadow: correct
                    ? "0 14px 28px -14px rgba(19,199,106,0.45), inset 0 0 0 1px rgba(19,199,106,0.15)"
                    : "0 1px 0 rgba(11,21,48,0.02)",
                }}
              >
                <span
                  className="flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-full"
                  style={{
                    border: correct
                      ? `1.5px solid ${colors.green}`
                      : "1.5px solid rgba(11,21,48,0.18)",
                    background: correct ? colors.green : "transparent",
                  }}
                >
                  {correct && (
                    <svg
                      viewBox="0 0 10 10"
                      className="h-2.5 w-2.5"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 5.4 L 4.2 7.5 L 8 2.8" />
                    </svg>
                  )}
                </span>
                <span className="flex-1 leading-tight">{c.text}</span>
              </li>
            );
          })}
        </ul>

        {/* feedback */}
        <div
          className="mt-[1rem] rounded-[0.95rem] px-[0.95rem] py-[0.75rem]"
          style={{
            background:
              "linear-gradient(180deg, rgba(19,199,106,0.1) 0%, rgba(19,199,106,0.04) 100%)",
            border: "1px solid rgba(19,199,106,0.2)",
          }}
        >
          <p
            className="text-[0.58rem] font-bold uppercase tracking-[0.18em]"
            style={{ color: colors.greenDeep, fontFamily: fonts.sans }}
          >
            Why it clicks
          </p>
          <p
            className="mt-1 text-[0.82rem] leading-[1.45]"
            style={{
              color: colors.text,
              fontFamily: fonts.serif,
              fontWeight: 500,
              fontStyle: "italic",
            }}
          >
            Expectations shifted. Buyers now pay more for the same share of
            the same company.
          </p>
        </div>
      </div>
    </PhoneShell>
  );
}

/* ---------- secondary phone: roadmap ---------- */

function RoadmapPhone() {
  const path = [
    { title: "What a stock really is", state: "done" as const, meta: "Complete" },
    { title: "Why companies go public", state: "done" as const, meta: "Complete" },
    { title: "How price finds itself", state: "done" as const, meta: "Complete" },
    {
      title: "Reading a conviction move",
      state: "current" as const,
      meta: "Up next · 5 min",
    },
    { title: "Headlines vs. fundamentals", state: "locked" as const, meta: "Lesson 05" },
  ];

  return (
    <PhoneShell tone="soft">
      <div className="px-[1.35rem] pb-[1.6rem] pt-[2.75rem]">
        <p
          className="text-[0.62rem] font-bold uppercase tracking-[0.2em]"
          style={{ color: colors.textMuted, fontFamily: fonts.sans }}
        >
          Module 01 · Your path
        </p>

        <h3
          className="mt-2 text-[1.5rem] leading-[1.02]"
          style={{
            color: colors.text,
            fontFamily: fonts.serif,
            fontWeight: 600,
            letterSpacing: "-0.025em",
          }}
        >
          Foundations of
          <br />
          <span style={{ fontStyle: "italic" }}>ownership</span>
        </h3>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-[rgba(11,21,48,0.08)]">
            <div
              className="h-full rounded-full"
              style={{
                width: "60%",
                background:
                  "linear-gradient(90deg, #13c76a 0%, #7ee6aa 100%)",
              }}
            />
          </div>
          <span
            className="text-[0.72rem] font-bold tabular-nums"
            style={{ color: colors.greenDeep, fontFamily: fonts.sans }}
          >
            3/5
          </span>
        </div>

        <ol className="relative mt-[1.2rem] space-y-[0.85rem] pl-[1.85rem]">
          <span
            aria-hidden
            className="absolute left-[0.62rem] top-3 bottom-3 w-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(19,199,106,0.65) 0%, rgba(19,199,106,0.65) 58%, rgba(11,21,48,0.12) 60%, rgba(11,21,48,0.12) 100%)",
            }}
          />
          {path.map((item) => {
            const done = item.state === "done";
            const current = item.state === "current";
            const locked = item.state === "locked";
            return (
              <li key={item.title} className="relative">
                <span
                  className="absolute -left-[1.85rem] top-[0.15rem] flex h-[1.25rem] w-[1.25rem] items-center justify-center rounded-full"
                  style={{
                    border: done
                      ? `1.5px solid ${colors.green}`
                      : current
                        ? `1.5px solid ${colors.green}`
                        : "1.5px solid rgba(11,21,48,0.16)",
                    background: done
                      ? colors.green
                      : current
                        ? "#ffffff"
                        : "#f3f5ec",
                    boxShadow: current
                      ? "0 0 0 5px rgba(19,199,106,0.16), 0 6px 14px -6px rgba(19,199,106,0.5)"
                      : "none",
                  }}
                >
                  {done && (
                    <svg
                      viewBox="0 0 10 10"
                      className="h-[0.55rem] w-[0.55rem]"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 5.4 L 4.2 7.5 L 8 2.8" />
                    </svg>
                  )}
                  {current && (
                    <span
                      className="h-[0.4rem] w-[0.4rem] rounded-full"
                      style={{ background: colors.green }}
                    />
                  )}
                </span>

                <p
                  className="text-[0.9rem] leading-[1.15]"
                  style={{
                    color: locked ? "rgba(11,21,48,0.42)" : colors.text,
                    fontFamily: fonts.sans,
                    fontWeight: current ? 600 : 500,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="mt-[0.15rem] text-[0.64rem] font-bold uppercase tracking-[0.14em]"
                  style={{
                    color: current
                      ? colors.greenDeep
                      : done
                        ? "rgba(12,143,74,0.58)"
                        : colors.textMuted,
                    fontFamily: fonts.sans,
                  }}
                >
                  {item.meta}
                </p>
              </li>
            );
          })}
        </ol>

        <div
          className="mt-[1.2rem] flex items-center justify-between rounded-[0.95rem] px-[1rem] py-[0.8rem]"
          style={{
            background: colors.text,
            color: "#f5f7f1",
            boxShadow: "0 14px 26px -14px rgba(11,21,48,0.5)",
          }}
        >
          <span
            className="text-[0.82rem] font-semibold"
            style={{ fontFamily: fonts.sans }}
          >
            Continue lesson
          </span>
          <span
            className="text-[0.95rem]"
            style={{ color: colors.green }}
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </PhoneShell>
  );
}

/* ---------- composition ---------- */

export function HeroDevice() {
  return (
    <div className="relative mx-auto aspect-[5/6.2] w-full max-w-[32rem] lg:aspect-[6/6.5] lg:max-w-none">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 48%, rgba(19,199,106,0.22) 0%, rgba(19,199,106,0) 72%)",
          filter: "blur(10px)",
        }}
      />

      {/* secondary: roadmap, behind right — revealed more */}
      <motion.div
        initial={{ opacity: 0, y: 26, rotate: 3.5 }}
        animate={{ opacity: 1, y: 0, rotate: 3.5 }}
        transition={{ duration: 1.15, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[-3%] top-[6%] w-[60%] origin-bottom lg:right-[-5%] lg:top-[7%] lg:w-[58%]"
        style={{ filter: "saturate(0.96) brightness(0.99)" }}
      >
        <div
          aria-hidden
          className="absolute -inset-2 -z-10 rounded-[3rem] blur-2xl"
          style={{
            background:
              "radial-gradient(55% 45% at 50% 92%, rgba(11,21,48,0.22) 0%, transparent 78%)",
          }}
        />
        <RoadmapPhone />
      </motion.div>

      {/* primary: lesson, front left */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2.5 }}
        animate={{ opacity: 1, y: 0, rotate: -2.5 }}
        transition={{ duration: 1.2, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[-1%] top-[2%] z-10 w-[68%] origin-bottom lg:left-[-3%] lg:top-[0%] lg:w-[66%]"
      >
        <div
          aria-hidden
          className="absolute -inset-3 -z-10 rounded-[3rem] blur-3xl"
          style={{
            background:
              "radial-gradient(58% 48% at 50% 92%, rgba(11,21,48,0.3) 0%, transparent 78%)",
          }}
        />
        <LessonPhone />
      </motion.div>
    </div>
  );
}
