"use client";

import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { landingTheme } from "./theme";

const { colors, fonts } = landingTheme;

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "The course", href: "#course" },
];

export function LandingHeader() {
  const { user } = useAuth();
  const ctaHref = user ? "/course" : "/onboarding";
  const ctaLabel = user ? "Continue" : "Get started";

  return (
    <header className="relative z-20" style={{ fontFamily: fonts.sans }}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8 sm:py-7">
        <Link
          href="/landing"
          aria-label="Stoked home"
          className="flex items-baseline gap-0.5 text-[1.4rem] leading-none sm:text-[1.55rem]"
          style={{
            color: colors.text,
            fontFamily: fonts.serif,
            letterSpacing: "-0.025em",
            fontWeight: 600,
          }}
        >
          <span>stoked</span>
          <span style={{ color: colors.green }}>.</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.9rem] font-medium transition-colors hover:text-[color:var(--hover)]"
              style={
                {
                  color: colors.textSoft,
                  ["--hover" as string]: colors.text,
                } as React.CSSProperties
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/profile"
            className="hidden text-[0.9rem] font-medium sm:inline-flex"
            style={{ color: colors.textSoft }}
          >
            {user ? "Profile" : "Sign in"}
          </Link>
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 rounded-full px-[1.1rem] py-[0.65rem] text-[0.85rem] font-semibold transition-transform hover:-translate-y-[1px]"
            style={{
              background: colors.text,
              color: "#f5f7f1",
              boxShadow:
                "0 14px 26px -10px rgba(11,21,48,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              letterSpacing: "0.005em",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: colors.green,
                boxShadow: "0 0 0 2.5px rgba(19,199,106,0.35)",
              }}
            />
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
