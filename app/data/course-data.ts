export type ModuleIcon =
  | "compass"
  | "line-chart"
  | "trending-up"
  | "layers"
  | "bar-chart"
  | "building"
  | "pie-chart"
  | "percent"
  | "puzzle"
  | "trophy";

export type LessonKind = "lesson" | "practice" | "boss";
export type LessonState = "locked" | "unlocked" | "current" | "completed";

export type CourseLesson = {
  id: string;
  moduleId: number;
  moduleSlug: string;
  lessonNumber: number;
  title: string;
  type: LessonKind;
  estimatedTime: string;
  xp: number;
  slug: string;
  route: string;
  isBoss: boolean;
  conceptTags: string[];
};

export type CourseModule = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  icon: ModuleIcon;
  accentColor: string;
  accentSoft: string;
  accentSoftAlt: string;
  lessons: CourseLesson[];
};

type ModuleSeed = Omit<CourseModule, "lessons"> & {
  lessonTitles: string[];
  lessonTimes?: string[];
  lessonConceptTags?: string[][];
  tags: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const moduleSeeds: ModuleSeed[] = [
  {
    id: 1,
    slug: "foundations",
    title: "Foundations",
    subtitle: "Your market orientation",
    icon: "compass",
    accentColor: "#3B82F6",
    accentSoft: "#EAF3FF",
    accentSoftAlt: "#DCEBFF",
    tags: ["ownership", "basics", "beginner"],
    lessonTimes: [
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "5–6 min",
    ],
    lessonConceptTags: [
      ["ownership-basics", "shares", "company-ownership"],
      ["capital-raising", "shares", "growth-funding"],
      ["buyer-seller-mechanics", "demand", "market-match"],
      ["price-pressure", "demand-imbalance", "direction"],
      ["gain-loss-basics", "returns", "break-even"],
      ["dividends-vs-price-gain", "returns", "shareholder-cash"],
      ["asset-type-basics", "stocks", "bonds", "savings"],
      ["expectations-news", "headlines", "market-reaction"],
      ["beginner-mindset", "observation", "careful-thinking"],
      ["foundations-boss", "ownership", "expectations", "returns"],
    ],
    lessonTitles: [
      "What owning a stock means",
      "Why companies sell stock",
      "How buyers and sellers meet",
      "How price can move up or down",
      "Gain, loss, and break-even",
      "Dividends vs price gain",
      "Stock vs bond vs savings",
      "Why stock prices react to news",
      "What a careful beginner does",
      "Boss — Ownership walkthrough",
    ],
  },
  {
    id: 2,
    slug: "chart-basics",
    title: "Chart Basics",
    subtitle: "Reading price action",
    icon: "line-chart",
    accentColor: "#10B981",
    accentSoft: "#EAFBF4",
    accentSoftAlt: "#D9F6EA",
    tags: ["charts", "candles", "axes"],
    lessonTimes: [
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "3–4 min",
      "5–6 min",
    ],
    lessonConceptTags: [
      ["chart-price-time", "x-axis", "y-axis"],
      ["chart-chronology", "left-to-right", "time-order"],
      ["vertical-price-reading", "y-axis", "higher-lower"],
      ["line-chart-reading", "broad-direction", "line-chart"],
      ["direction-classification", "rising", "falling", "flat"],
      ["chart-range-extremes", "high-low", "range"],
      ["slope-and-pace", "speed", "steepness"],
      ["chart-format-basics", "line-chart", "candlestick"],
      ["chart-history-not-certainty", "careful-reading", "uncertainty"],
      ["chart-basics-boss", "axes", "direction", "range"],
    ],
    lessonTitles: [
      "What a chart shows",
      "Time runs left to right",
      "Price moves bottom to top",
      "Reading a simple line chart",
      "Flat, rising, falling",
      "Highest point, lowest point",
      "Fast move vs slow move",
      "Line chart vs candlestick intro",
      "A chart is history, not certainty",
      "Boss — Chart decoding walkthrough",
    ],
  },
  {
    id: 3,
    slug: "trend-and-momentum",
    title: "Trend & Momentum",
    subtitle: "Following the flow",
    icon: "trending-up",
    accentColor: "#8B5CF6",
    accentSoft: "#F3EEFF",
    accentSoftAlt: "#E9DFFF",
    tags: ["trend", "momentum", "direction"],
    lessonTitles: [
      "What trend means",
      "Uptrend basics",
      "Downtrend basics",
      "Sideways movement",
      "Noise vs trend",
      "Stronger vs weaker trend",
      "Momentum as pace",
      "Momentum can fade",
      "Trend first, details second",
      "Boss — Trend and momentum clinic",
    ],
  },
  {
    id: 4,
    slug: "support-and-resistance",
    title: "Support & Resistance",
    subtitle: "Key price levels",
    icon: "layers",
    accentColor: "#F59E0B",
    accentSoft: "#FFF6E8",
    accentSoftAlt: "#FEE8BF",
    tags: ["levels", "zones", "price memory"],
    lessonTitles: [
      "What support is",
      "What resistance is",
      "Zones, not precise lines",
      "Bounce from support",
      "Rejection near resistance",
      "Stronger vs weaker zones",
      "Support can fail",
      "Resistance can break",
      "Beginners should think in areas",
      "Boss — Map the chart",
    ],
  },
  {
    id: 5,
    slug: "breakouts-and-volume",
    title: "Breakouts & Volume",
    subtitle: "Power moves",
    icon: "bar-chart",
    accentColor: "#EF4444",
    accentSoft: "#FFF0F0",
    accentSoftAlt: "#FFDADA",
    tags: ["breakouts", "volume", "confirmation"],
    lessonTitles: [
      "What a breakout is",
      "Why breakouts matter",
      "What volume is",
      "Breakout with strong volume",
      "Quiet breakout",
      "Fake breakout",
      "Volume on selloffs too",
      "Context matters",
      "Stronger vs weaker setup",
      "Boss — Breakout lab",
    ],
  },
  {
    id: 6,
    slug: "business-fundamentals",
    title: "Business Fundamentals",
    subtitle: "Understanding companies",
    icon: "building",
    accentColor: "#06B6D4",
    accentSoft: "#EAFBFE",
    accentSoftAlt: "#D5F4FA",
    tags: ["fundamentals", "business", "company"],
    lessonTitles: [
      "Technical vs fundamental",
      "What fundamentals try to explain",
      "Revenue as sales",
      "Profit as what remains",
      "Margin basics",
      "Growth vs quality",
      "Fundamental metrics answer different questions",
      "Price can move faster than business changes",
      "Beginner company snapshot",
      "Boss — Build a business snapshot",
    ],
  },
  {
    id: 7,
    slug: "market-cap-and-revenue",
    title: "Market Cap & Revenue",
    subtitle: "Sizing up value",
    icon: "pie-chart",
    accentColor: "#EC4899",
    accentSoft: "#FFF0F7",
    accentSoftAlt: "#FFD8EB",
    tags: ["market cap", "revenue", "scale"],
    lessonTitles: [
      "What market cap means",
      "Share price alone is misleading",
      "What revenue growth means",
      "Big company vs fast-growing company",
      "Mature vs expanding businesses",
      "Revenue growth can slow",
      "Bigger isn’t automatically safer",
      "Faster growth isn’t automatically better",
      "Beginner company comparison",
      "Boss — Size vs growth showdown",
    ],
  },
  {
    id: 8,
    slug: "eps-and-pe-ratios",
    title: "EPS & P/E Ratios",
    subtitle: "Profit metrics",
    icon: "percent",
    accentColor: "#14B8A6",
    accentSoft: "#EAFBF8",
    accentSoftAlt: "#D4F5F1",
    tags: ["eps", "pe", "valuation"],
    lessonTitles: [
      "What EPS is",
      "More shares changes per-share value",
      "What P/E compares",
      "Higher P/E is not automatically bad",
      "Lower P/E is not automatically good",
      "Sector context matters",
      "Earnings can change, so P/E can change",
      "EPS vs revenue vs price",
      "Use P/E as context, not verdict",
      "Boss — Valuation context challenge",
    ],
  },
  {
    id: 9,
    slug: "putting-it-together",
    title: "Putting It Together",
    subtitle: "Complete analysis",
    icon: "puzzle",
    accentColor: "#7C3AED",
    accentSoft: "#F3ECFF",
    accentSoftAlt: "#E4D8FF",
    tags: ["integration", "analysis", "workflow"],
    lessonTitles: [
      "Start with the chart",
      "Then inspect business context",
      "Trend + support together",
      "Breakout + volume together",
      "Market cap + growth together",
      "P/E + expectations together",
      "Build a beginner checklist",
      "Spot the weak explanation",
      "Guided stock snapshot",
      "Boss — Full guided stock read",
    ],
  },
  {
    id: 10,
    slug: "final-mastery",
    title: "Final Mastery",
    subtitle: "Stock walkthrough",
    icon: "trophy",
    accentColor: "#F97316",
    accentSoft: "#FFF3EA",
    accentSoftAlt: "#FFE2D0",
    tags: ["mastery", "final", "walkthrough"],
    lessonTitles: [
      "Read a simple stock setup",
      "Identify what you know vs don’t know",
      "Choose the next best question",
      "Diagnose a beginner mistake",
      "Chart + business conflict",
      "Confidence meter",
      "Write a short stock summary",
      "Voice-ready reasoning task",
      "Guided pre-final rehearsal",
      "Final Boss — Beginner stock walkthrough certification",
    ],
  },
];

export const courseModules: CourseModule[] = moduleSeeds.map((moduleSeed) => {
  const lessons = moduleSeed.lessonTitles.map((title, index) => {
    const lessonNumber = index + 1;
    const isBoss = lessonNumber === 10;
    const type: LessonKind =
      lessonNumber === 10 ? "boss" : lessonNumber % 3 === 0 ? "practice" : "lesson";
    const slug = slugify(title);

    return {
      id: `${moduleSeed.slug}-${lessonNumber}`,
      moduleId: moduleSeed.id,
      moduleSlug: moduleSeed.slug,
      lessonNumber,
      title,
      type,
      estimatedTime:
        moduleSeed.lessonTimes?.[index] ??
        (isBoss ? "12 min" : lessonNumber % 2 === 0 ? "7 min" : "6 min"),
      xp: isBoss ? 120 : 40 + lessonNumber * 2,
      slug,
      route: `/course/${moduleSeed.slug}/${slug}`,
      isBoss,
      conceptTags:
        moduleSeed.lessonConceptTags?.[index] ??
        [...moduleSeed.tags, isBoss ? "challenge" : `lesson-${lessonNumber}`],
    };
  });

  return {
    id: moduleSeed.id,
    slug: moduleSeed.slug,
    title: moduleSeed.title,
    subtitle: moduleSeed.subtitle,
    icon: moduleSeed.icon,
    accentColor: moduleSeed.accentColor,
    accentSoft: moduleSeed.accentSoft,
    accentSoftAlt: moduleSeed.accentSoftAlt,
    lessons,
  };
});

export const courseLessonCount = courseModules.reduce(
  (total, module) => total + module.lessons.length,
  0,
);

export function getModuleBySlug(moduleSlug: string) {
  return courseModules.find((module) => module.slug === moduleSlug);
}

export function getLessonBySlug(moduleSlug: string, lessonSlug: string) {
  const courseModule = getModuleBySlug(moduleSlug);

  if (!courseModule) {
    return null;
  }

  const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);

  if (!lesson) {
    return null;
  }

  return {
    module: courseModule,
    lesson,
  };
}
