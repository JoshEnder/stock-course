"use client";

import { colors } from "./tokens";
import { HeroLeft } from "./HeroLeft";
import { HeroRight } from "./HeroRight";
import { useHeroState } from "./useHeroState";

export function Hero() {
  const { activeCard, selectedAnswers, selectAnswer, focusCard } =
    useHeroState();

  return (
    <section
      style={{
        position: "relative",
        minHeight: 900,
        width: "100%",
        background: colors.bg,
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow behind the card area */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "10%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,184,116,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Layout container */}
      <div
        className="hero-layout"
        style={{
          position: "relative",
          maxWidth: 1440,
          margin: "0 auto",
          minHeight: 900,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left — headline, sub, CTA */}
        <div
          className="hero-left"
          style={{
            flex: "0 0 33%",
            paddingLeft: 105,
            paddingRight: 40,
            zIndex: 2,
          }}
        >
          <HeroLeft />
        </div>

        {/* Right — 3D card stack */}
        <div
          className="hero-right"
          style={{
            position: "absolute",
            right: 40,
            top: "50%",
            transform: "translateY(-48%)",
            zIndex: 1,
          }}
        >
          <HeroRight
            activeCard={activeCard}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={selectAnswer}
            onFocusCard={focusCard}
          />
        </div>
      </div>

      {/* Responsive overrides */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .hero-layout {
            flex-direction: column !important;
            min-height: auto !important;
            padding: 60px 20px 40px !important;
            gap: 32px;
          }
          .hero-left {
            flex: unset !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
            order: 2;
            text-align: center;
          }
          .hero-right {
            position: relative !important;
            right: auto !important;
            top: auto !important;
            transform: none !important;
            order: 1;
            display: flex;
            justify-content: center;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-left {
            padding-left: 50px !important;
            flex: 0 0 40% !important;
          }
          .hero-right {
            right: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
