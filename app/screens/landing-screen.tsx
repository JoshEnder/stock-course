"use client";

import { LandingHeader } from "../components/landing/header";
import { LandingHero } from "../components/landing/hero";
import { landingTheme } from "../components/landing/theme";

const { colors, fonts } = landingTheme;

export function LandingScreen() {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background: colors.background,
        color: colors.text,
        fontFamily: fonts.sans,
      }}
    >
      <LandingHeader />
      <LandingHero />
    </main>
  );
}
