// Design system tokens for the Stoked hero section

export const colors = {
  bg: "#F5F1EA",
  headline: "#112739",
  sub: "#445561",
  helper: "#6A747C",
  buttonBg: "#0F7B52",
  buttonHover: "#0D6E48",
  buttonPressed: "#116C48",
  green: "#14B874",
  greenGlow: "rgba(20, 184, 116, 0.26)",
  cardBg: "rgba(246, 248, 249, 0.42)",
  cardBorder: "rgba(255, 255, 255, 0.72)",
  cardShadow: "rgba(28, 42, 54, 0.18)",
  cardShadowHover: "rgba(28, 42, 54, 0.24)",
  white: "#FFFFFF",
  lock: "rgba(18, 38, 52, 0.25)",
} as const;

export const shadows = {
  button:
    "0 16px 28px rgba(15, 123, 82, 0.16), inset 0 1px 0 rgba(255,255,255,0.14)",
  buttonHover:
    "0 20px 34px rgba(15, 123, 82, 0.22), inset 0 1px 0 rgba(255,255,255,0.16)",
  card:
    "0 34px 72px rgba(28, 42, 54, 0.18), 0 10px 26px rgba(28, 42, 54, 0.08)",
  cardHover:
    "0 40px 82px rgba(28, 42, 54, 0.22), 0 14px 30px rgba(28, 42, 54, 0.10)",
  glass:
    "0 26px 56px rgba(28, 42, 54, 0.10), 0 8px 18px rgba(28, 42, 54, 0.06)",
  glassActive:
    "0 32px 64px rgba(28, 42, 54, 0.16), 0 12px 24px rgba(28, 42, 54, 0.08)",
  greenGlow: "0 0 26px rgba(20, 184, 116, 0.24)",
} as const;

export const timing = {
  cardHover: "260ms cubic-bezier(0.22, 1, 0.36, 1)",
  answerSelect: "200ms ease-out",
  feedback: "160ms ease-out",
  feedbackDelay: "75ms",
  buttonPress: "100ms ease-out",
} as const;

export const fonts = {
  serif: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
  sans: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)",
} as const;
