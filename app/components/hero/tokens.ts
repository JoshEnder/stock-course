// Design system tokens for the Stoked hero section

export const colors = {
  bg: "#F5F4F6",
  headline: "#122634",
  sub: "#40505A",
  helper: "#5C656D", // darkened from #7D868E for AAA contrast
  buttonBg: "#0F7B52",
  buttonHover: "#0D6E48",
  buttonPressed: "#177A59",
  green: "#14B874",
  greenGlow: "rgba(20, 184, 116, 0.32)",
  cardBg: "rgba(245, 246, 247, 0.55)",
  cardBorder: "rgba(255, 255, 255, 0.35)",
  cardShadow: "rgba(28, 42, 54, 0.10)",
  cardShadowHover: "rgba(28, 42, 54, 0.14)",
  white: "#FFFFFF",
  lock: "rgba(18, 38, 52, 0.25)",
} as const;

export const shadows = {
  button: "0 10px 24px rgba(15, 123, 82, 0.18)",
  buttonHover: "0 14px 32px rgba(15, 123, 82, 0.26)",
  card: "0 24px 50px rgba(28, 42, 54, 0.10)",
  cardHover: "0 34px 68px rgba(28, 42, 54, 0.14)",
  greenGlow: "0 0 26px rgba(20, 184, 116, 0.32)",
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
