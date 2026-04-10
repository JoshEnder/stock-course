"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/auth-context";
import { HeroDevice } from "./hero-device";
import { landingTheme } from "./theme";

const { colors, fonts } = landingTheme;

const chapters = [
  {
    num: "01",
    label: "See the move",
    copy: "Real moments, real markets — framed so you can read them.",
  },
  {
    num: "02",
    label: "Read the signal",
    copy: "Understand what actually shifted, in plain language.",
  },
  {
    num: "03",
    label: "Act with conviction",
    copy: "Make the call. Feel the idea finally click.",
  },
];

export function LandingHero() {
  const { user } = useAuth();
  const primaryHref = user ? "/course" : "/onboarding";
  const primaryLabel = user ? "Resume your path" : "Start Lesson 01";
  const secondaryHref = "#how-it-works";

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ fontFamily: fonts.sans }}
    >
      {/* ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: `
            radial-gradient(72rem 42rem at 94% -6%, rgba(19,199,106,0.16) 0%, transparent 55%),
            radial-gradient(52rem 32rem at 0% 16%, rgba(11,21,48,0.05) 0%, transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%)
          `,
        }}
      />

      {/* unified sweeping curve — desktop: runs from under copy, up through devices, sweeps down to anchor the bottom rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
      >
        <svg
          viewBox="0 0 1440 1100"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="heroStroke" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0%" stopColor="rgba(19,199,106,0)" />
              <stop offset="30%" stopColor="rgba(19,199,106,0.35)" />
              <stop offset="62%" stopColor="rgba(19,199,106,0.75)" />
              <stop offset="100%" stopColor="rgba(19,199,106,1)" />
            </linearGradient>
            <linearGradient id="heroTail" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(19,199,106,0.9)" />
              <stop offset="100%" stopColor="rgba(19,199,106,0)" />
            </linearGradient>
            <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* rising curve through hero */}
          <motion.path
            d="M -60 860 Q 240 820 380 680 T 720 460 T 1060 250 T 1360 110"
            fill="none"
            stroke="url(#heroStroke)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#heroGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* descending tail that ties into the bottom process rail */}
          <motion.path
            d="M 1360 110 Q 1400 320 1240 540 T 720 900 T 120 1000"
            fill="none"
            stroke="url(#heroTail)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="1 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 2.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx="1360"
            cy="110"
            r="5"
            fill="#13c76a"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.3 }}
          />
          <motion.circle
            cx="1360"
            cy="110"
            r="11"
            fill="none"
            stroke="#13c76a"
            strokeWidth="1"
            opacity="0.35"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 2.3 }}
          />
        </svg>
      </div>

      {/* mobile curve — behind devices */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[44%] -z-10 h-48 lg:hidden"
      >
        <svg
          viewBox="0 0 400 190"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="heroStrokeSm" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0%" stopColor="rgba(19,199,106,0)" />
              <stop offset="100%" stopColor="rgba(19,199,106,0.9)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M -20 170 Q 130 130 210 80 T 440 10"
            fill="none"
            stroke="url(#heroStrokeSm)"
            strokeWidth="1.75"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </div>

      {/* HERO GRID */}
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-16 px-5 pb-20 pt-4 sm:px-8 sm:pb-24 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center lg:gap-12 lg:pb-28 lg:pt-14">
        {/* copy block */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-[36rem]"
        >
          <h1
            className="text-[3.4rem] leading-[0.88] tracking-[-0.055em] sm:text-[4.6rem] lg:text-[5.9rem]"
            style={{
              color: colors.text,
              fontFamily: fonts.serif,
              fontWeight: 600,
            }}
          >
            Learn stocks
            <br />
            the{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              simple
            </span>
            <br />
            way
            <span style={{ color: colors.green }}>.</span>
          </h1>

          <p
            className="mt-7 max-w-[28rem] text-[1.06rem] leading-[1.6] sm:text-[1.12rem]"
            style={{ color: colors.textSoft }}
          >
            Short interactive lessons. One clear path. Built for beginners
            and designed for your phone — so confidence compounds, one
            lesson at a time.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full px-[1.6rem] py-[1rem] text-[0.98rem] font-semibold transition-transform hover:-translate-y-[2px]"
              style={{
                background: colors.text,
                color: "#f7f7f2",
                boxShadow:
                  "0 26px 48px -16px rgba(11,21,48,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: colors.green,
                  boxShadow: "0 0 0 3px rgba(19,199,106,0.35)",
                }}
              />
              {primaryLabel}
              <span aria-hidden className="ml-0.5 text-[1.02rem] transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>

            <Link
              href={secondaryHref}
              className="group inline-flex items-center justify-center gap-2 px-3 py-[1rem] text-[0.95rem] font-semibold sm:px-2"
              style={{ color: colors.text, fontFamily: fonts.sans }}
            >
              <span
                className="border-b"
                style={{ borderColor: "rgba(11,21,48,0.22)" }}
              >
                Try a live lesson
              </span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
                style={{ color: colors.green }}
              >
                ›
              </span>
            </Link>
          </div>

          <p
            className="mt-5 text-[0.8rem]"
            style={{ color: colors.textMuted }}
          >
            No signup to try. Educational only — not investment advice.
          </p>
        </motion.div>

        {/* product scene */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <HeroDevice />
        </motion.div>
      </div>

      {/* bottom process rail — locked to hero as a single system */}
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="relative">
          {/* hairline with green node to suggest curve anchoring */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(11,21,48,0) 0%, rgba(11,21,48,0.14) 12%, rgba(19,199,106,0.45) 50%, rgba(11,21,48,0.14) 88%, rgba(11,21,48,0) 100%)",
            }}
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-[3px] rounded-full"
            style={{
              background: colors.green,
              boxShadow: "0 0 0 4px rgba(19,199,106,0.2)",
            }}
          />

          <div className="grid grid-cols-1 gap-10 pt-10 sm:grid-cols-3 sm:gap-8">
            {chapters.map((c, i) => (
              <motion.div
                key={c.num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.7,
                  delay: 0.15 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-start gap-5"
              >
                <div className="flex flex-col items-center">
                  <span
                    className="text-[0.7rem] font-bold uppercase tracking-[0.22em]"
                    style={{ color: colors.green, fontFamily: fonts.sans }}
                  >
                    {c.num}
                  </span>
                  <span
                    className="mt-2 h-8 w-px"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(19,199,106,0.55) 0%, rgba(19,199,106,0) 100%)",
                    }}
                  />
                </div>
                <div>
                  <p
                    className="text-[1.4rem] leading-[1.05]"
                    style={{
                      color: colors.text,
                      fontFamily: fonts.serif,
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {c.label}
                    <span style={{ color: colors.green }}>.</span>
                  </p>
                  <p
                    className="mt-2 max-w-[18rem] text-[0.88rem] leading-[1.55]"
                    style={{ color: colors.textSoft, fontFamily: fonts.sans }}
                  >
                    {c.copy}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
