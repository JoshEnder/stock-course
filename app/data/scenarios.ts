import type { Scenario } from "@/app/types/experience";

export const scenarios: Scenario[] = [
  {
    id: "apple_earnings",
    title: "Apple beats earnings by 15%",
    context:
      "Apple just reported Q4. Revenue beat estimates by 15%, full-year guidance raised. AAPL is at $180.50 pre-market.",
    currentPrice: 180.5,
    ticker: "AAPL",
    correct: "UP",
    actualResult: {
      direction: "UP",
      priceChange: 5.78,
      changePercent: 3.2,
    },
    successMessage: "Beat + raised guidance. Buyers rushed in.",
    failureMessage: "Earnings beats almost always lift the price.",
    insight:
      "Beat expectations + raised guidance = double signal. Institutional funds don't wait — they buy immediately.",
  },
  {
    id: "fed_rate_hike",
    title: "Fed raises rates by 0.5%",
    context:
      "The Fed just announced a surprise 0.5% hike citing inflation. StellarTech (STLR) was already down 2% today. Currently at $95.20.",
    currentPrice: 95.2,
    ticker: "STLR",
    correct: "DOWN",
    actualResult: {
      direction: "DOWN",
      priceChange: -2.0,
      changePercent: -2.1,
    },
    successMessage: "Rate hikes hit growth stocks first.",
    failureMessage: "Higher rates = future earnings worth less. Growth stocks reprice fast.",
    insight:
      "Higher rates make future cash flows worth less right now. Growth stocks get repriced first. Traders know this pattern and don't hesitate.",
  },
  {
    id: "ceo_resignation",
    title: "CEO unexpectedly resigns",
    context:
      "MidWest Industrial (MWIC) just announced its 12-year CEO resigned, effective immediately. No explanation given. Stock at $42.80.",
    currentPrice: 42.8,
    ticker: "MWIC",
    correct: "DOWN",
    actualResult: {
      direction: "DOWN",
      priceChange: -2.01,
      changePercent: -4.7,
    },
    successMessage: "Uncertainty discounts immediately.",
    failureMessage: "Abrupt exits signal something's wrong. Market sells first.",
    insight:
      "No explanation = what does he know? Investors don't wait for answers. They sell the uncertainty.",
  },
];
