export type LessonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type StepType = "learn" | "practice" | "check";

export type LessonStep = {
  id: string;
  type: StepType;
};

export type LessonMeta = {
  id: LessonId;
  title: string;
  description: string;
  duration: string;
  locked: boolean;
};

export type LearnVisual =
  | "ownership"
  | "funding"
  | "returns"
  | "news"
  | "exchange"
  | "marketcap"
  | "timeline"
  | "checklist"
  | "diversification"
  | "sandbox";

export type LearnContent = {
  title: string;
  visual: LearnVisual;
  explanation: string;
  whatThisMeans: string;
  commonMistake: string;
  labMoment: string;
  supportActivities: string[];
  panels?: LearnPanel[];
};

export type PracticeOption = {
  id: string;
  text: string;
  correct: boolean;
  reviewPrompt: string;
  feedback?: string;
};

export type LearnPanel = {
  id: string;
  title: string;
  copy: string;
  eyebrow?: string;
  activityKind?: PracticeActivityKind;
  activityData?: Record<string, unknown>;
  activityStartValue?: number;
  highlights?: string[];
  noteLabel?: string;
  note?: string;
};

export type PracticeActivityKind =
  | "ownership-board"
  | "funding-simulator"
  | "return-builder"
  | "news-chart"
  | "exchange-map"
  | "market-cap-board"
  | "timeline"
  | "checklist"
  | "portfolio"
  | "chart-lab"
  | "bucket-sort"
  | "sequence-lab"
  | "zone-map"
  | "signal-stack"
  | "business-builder"
  | "market-cap-board"
  | "ratio-builder"
  | "reveal-card"
  | "confidence-meter"
  | "voice-ready";

export type PracticeContent = {
  mechanicTitle: string;
  mechanicSummary: string;
  prompt: string;
  question: string;
  options: PracticeOption[];
  explanation: string;
  activityKind: PracticeActivityKind;
  supportActivities: string[];
  useActivityAsPractice?: boolean;
  actionLabel?: string;
  readinessLabel?: string;
  activityData?: Record<string, unknown>;
};

export type RapidFireCheckCase = {
  id: string;
  prompt: string;
  options: PracticeOption[];
  explanation: string;
  reviewPrompt: string;
};

export type CheckContent = {
  question: string;
  type: "truefalse" | "multiple" | "typed" | "multiselect";
  variant?: "standard" | "rapid-fire";
  correctAnswer?: boolean;
  options?: PracticeOption[];
  rapidFireCases?: RapidFireCheckCase[];
  expectedKeywords?: string[];
  discouragedKeywords?: string[];
  minimumSelections?: number;
  placeholder?: string;
  coachTip?: string;
  voiceReady?: boolean;
  explanation: string;
  reviewPrompt: string;
};

export const lessonCatalog: LessonMeta[] = [
  {
    id: 1,
    title: "What Is a Stock?",
    description: "Ownership basics through slices, cards, and share stacking",
    duration: "6 min",
    locked: false,
  },
  {
    id: 2,
    title: "Why Do Companies Sell Stock?",
    description: "Funding decisions and tradeoffs between cash and control",
    duration: "6 min",
    locked: true,
  },
  {
    id: 3,
    title: "How Do People Make Money From Stocks?",
    description: "Returns from gains, dividends, and losses",
    duration: "7 min",
    locked: true,
  },
  {
    id: 4,
    title: "What Makes a Stock Price Move?",
    description: "Connect news, demand, and chart reactions",
    duration: "7 min",
    locked: true,
  },
  {
    id: 5,
    title: "What Is a Stock Exchange?",
    description: "Match buyers, sellers, tickers, and trades",
    duration: "6 min",
    locked: true,
  },
  {
    id: 6,
    title: "Share Price vs Market Cap",
    description: "Compare company size without being fooled by price alone",
    duration: "7 min",
    locked: true,
  },
  {
    id: 7,
    title: "Investing vs Trading",
    description: "Sort behaviors by timeline, pace, and mindset",
    duration: "6 min",
    locked: true,
  },
  {
    id: 8,
    title: "What Should Beginners Look At First?",
    description: "Use a simple stock checklist before hype takes over",
    duration: "7 min",
    locked: true,
  },
  {
    id: 9,
    title: "Risk and Diversification",
    description: "Spread exposure and understand concentration risk",
    duration: "7 min",
    locked: true,
  },
  {
    id: 10,
    title: "Stock Lab: Play Around With Charts and Choices",
    description: "Explore charts, labels, and beginner-safe comparisons",
    duration: "9 min",
    locked: true,
  },
];

export const lessonSteps: Record<LessonId, LessonStep[]> = {
  1: [
    { type: "learn", id: "1-1" },
    { type: "practice", id: "1-2" },
    { type: "check", id: "1-3" },
  ],
  2: [
    { type: "learn", id: "2-1" },
    { type: "practice", id: "2-2" },
    { type: "check", id: "2-3" },
  ],
  3: [
    { type: "learn", id: "3-1" },
    { type: "practice", id: "3-2" },
    { type: "check", id: "3-3" },
  ],
  4: [
    { type: "learn", id: "4-1" },
    { type: "practice", id: "4-2" },
    { type: "check", id: "4-3" },
  ],
  5: [
    { type: "learn", id: "5-1" },
    { type: "practice", id: "5-2" },
    { type: "check", id: "5-3" },
  ],
  6: [
    { type: "learn", id: "6-1" },
    { type: "practice", id: "6-2" },
    { type: "check", id: "6-3" },
  ],
  7: [
    { type: "learn", id: "7-1" },
    { type: "practice", id: "7-2" },
    { type: "check", id: "7-3" },
  ],
  8: [
    { type: "learn", id: "8-1" },
    { type: "practice", id: "8-2" },
    { type: "check", id: "8-3" },
  ],
  9: [
    { type: "learn", id: "9-1" },
    { type: "practice", id: "9-2" },
    { type: "check", id: "9-3" },
  ],
  10: [
    { type: "learn", id: "10-1" },
    { type: "practice", id: "10-2" },
    { type: "check", id: "10-3" },
  ],
};

export const learnContent: Record<string, LearnContent> = {
  "1-1": {
    title: "A stock is a tiny ownership slice of a business",
    visual: "ownership",
    explanation:
      "When a company is divided into shares, each share represents a small piece of ownership. Buying more shares means owning more of that divided pie.",
    whatThisMeans:
      "If you own more slices, your claim on the company is larger. That does not mean control, but it does mean a larger ownership stake.",
    commonMistake:
      "People often confuse ownership with being a customer. Buying products from a company is not the same as owning shares in it.",
    labMoment:
      "Try the ownership board and share stacker to see how your slice grows as the share count increases.",
    supportActivities: [
      "Slice the company into owned by you versus owned by others.",
      "Sort cards into ownership versus customer behavior.",
      "Use the share stacking slider from 1 share to 100 shares.",
    ],
  },
  "2-1": {
    title: "Companies sell stock to raise money for growth",
    visual: "funding",
    explanation:
      "A company can raise money by borrowing or by selling ownership. Selling stock brings in cash, but founders give up part of the company in return.",
    whatThisMeans:
      "The money raised can go toward hiring, equipment, expansion, or marketing instead of coming only from loans.",
    commonMistake:
      "Selling stock does not mean a company is closing down. It often means the company wants capital to grow faster.",
    labMoment:
      "Use the funding simulator to balance founder ownership against the amount of money raised.",
    supportActivities: [
      "Sort funding choices into borrow money or sell ownership.",
      "Place raised money into hiring, expansion, equipment, and marketing.",
      "Use the founder decision slider to compare control versus capital.",
    ],
  },
  "3-1": {
    title: "Stock returns can come from gains or dividends",
    visual: "returns",
    explanation:
      "People can make money from stocks when the price rises after they buy, or when some companies pay dividends to shareholders.",
    whatThisMeans:
      "A stock outcome is not always a gain. If the sale price is lower than the buy price, the result is a loss.",
    commonMistake:
      "A dividend is not the same thing as profit from selling a stock. They are two different ways shareholders can benefit.",
    labMoment:
      "Drag buy and sell prices, then drop dividend coins to see how different return types build total outcome.",
    supportActivities: [
      "Use the buy and sell slider to watch gain or loss update live.",
      "Drop dividend coins into the shareholder wallet.",
      "Match scenarios into price gain, dividend, or loss.",
    ],
  },
  "4-1": {
    title: "Stock prices move when expectations and demand change",
    visual: "news",
    explanation:
      "Stock prices react when buyers and sellers interpret company news, earnings, new products, setbacks, or changing demand differently.",
    whatThisMeans:
      "If more people want to buy than sell, price pressure may push upward. If bad news scares buyers away, price may weaken.",
    commonMistake:
      "One headline does not guarantee a price move. Some news is unclear, and markets do not react perfectly every time.",
    labMoment:
      "Tap headlines and demand sliders to watch how simple price pressure and chart reactions change.",
    supportActivities: [
      "Drag headlines into likely up, likely down, or unclear.",
      "Use buyer and seller sliders to see price pressure shift.",
      "Tap a news event to watch a mini chart response.",
    ],
  },
  "5-1": {
    title: "A stock exchange is the marketplace where trades happen",
    visual: "exchange",
    explanation:
      "Buyers and sellers meet through an exchange. Orders connect there, and once they match, a trade is completed at an agreed price.",
    whatThisMeans:
      "The exchange is not a warehouse of stocks. It is a marketplace and system for making trades happen.",
    commonMistake:
      "A ticker symbol is not a nickname or product line. It is a short stock code used to identify a company on the market.",
    labMoment:
      "Use the trading floor map to connect buyers, sellers, trades, and ticker symbols.",
    supportActivities: [
      "Drag buyer and seller orders together to create a trade.",
      "Label the exchange scene with buyer, seller, trade, and exchange.",
      "Match companies to ticker symbols.",
    ],
  },
  "6-1": {
    title: "Share price and market cap answer different questions",
    visual: "marketcap",
    explanation:
      "A share price tells you what one share costs. Market cap tells you the total value of all shares together.",
    whatThisMeans:
      "A low stock price does not automatically mean a company is small or cheap. You need both price and shares outstanding to judge size.",
    commonMistake:
      "People often assume a $5 stock is automatically cheaper than a $500 stock. That ignores how many shares the company has.",
    labMoment:
      "Compare companies on the rank board and build the formula for market cap by combining share price with shares outstanding.",
    supportActivities: [
      "Sort companies from smallest to largest market cap.",
      "Match share price times shares outstanding to market cap.",
      "Place stock cards into cheap-looking versus actually large company buckets.",
    ],
  },
  "7-1": {
    title: "Investing and trading use different time horizons",
    visual: "timeline",
    explanation:
      "Investing usually emphasizes longer-term ownership and business quality, while trading focuses more on short-term price moves.",
    whatThisMeans:
      "Both involve stocks, but the behavior, stress level, and reasons for checking prices can look very different.",
    commonMistake:
      "People sometimes treat investing and trading as identical just because both involve buying a stock. The timeline and intent are different.",
    labMoment:
      "Use the timeline placement and stress meter to compare how investor-like and trader-like behaviors feel.",
    supportActivities: [
      "Drag behaviors onto short-term or long-term.",
      "Sort characters as more investor-like or more trader-like.",
      "Compare how often each person checks prices.",
    ],
  },
  "8-1": {
    title: "Beginners should start with a simple business checklist",
    visual: "checklist",
    explanation:
      "Before looking at hype, beginners should ask how a company makes money, what risks exist, and whether the business model makes sense.",
    whatThisMeans:
      "A strong first look is about understanding the business and its risks, not whether the logo or ticker looks exciting.",
    commonMistake:
      "Following hype without understanding the business can create false confidence. Questions come before excitement.",
    labMoment:
      "Use the stock checklist explorer to order the best beginner questions and sort clues into green flags and red flags.",
    supportActivities: [
      "Drag beginner questions into the best starting order.",
      "Sort business clues into green flags or red flags.",
      "Match companies to how they make money.",
    ],
  },
  "9-1": {
    title: "Diversification spreads risk instead of concentrating it",
    visual: "diversification",
    explanation:
      "When all your eggs are in one basket, one problem can hurt everything at once. Diversification spreads holdings across multiple companies or sectors.",
    whatThisMeans:
      "Diversification does not remove all risk, but it can reduce how much one company or sector dominates a portfolio.",
    commonMistake:
      "Diversification is not a guarantee against loss. It is a way to manage concentration risk, not a magic shield.",
    labMoment:
      "Build portfolios, group sectors, and watch concentration warnings appear when too much sits in one area.",
    supportActivities: [
      "Compare all eggs in one basket versus spreading them out.",
      "Group companies into sectors and watch concentration warnings.",
      "Place portfolios on a radar from concentrated to diversified.",
    ],
  },
  "10-1": {
    title: "A stock lab lets beginners compare, label, and observe",
    visual: "sandbox",
    explanation:
      "A sandbox is useful because it lets you touch charts and compare simple facts without pressure to act. Observation builds confidence.",
    whatThisMeans:
      "Volatile, steady, uptrend, drop, and recovery are visual patterns you can learn to recognize without jumping straight into decisions.",
    commonMistake:
      "Not understanding a business yet is not a failure. The smart move is to learn more first instead of rushing.",
    labMoment:
      "Zoom simple charts, label their shape, and place each stock into understand it, need to learn more, or too risky for me.",
    supportActivities: [
      "Use a simple chart playground with compare mode.",
      "Drag labels like volatile, steady, drop, and recovery onto charts.",
      "Sort stocks by understanding level and risk comfort.",
    ],
  },
};

export const practiceContent: Record<string, PracticeContent> = {
  "1-2": {
    mechanicTitle: "Ownership board",
    mechanicSummary:
      "Move slices, sort cards, and stack shares to see ownership become visible instead of abstract.",
    prompt:
      "You are building an ownership board. Watch your share stack grow and compare your slice with the rest of the company.",
    question: "Owning a stock means:",
    activityKind: "ownership-board",
    supportActivities: [
      "Slice the company into owned by you versus owned by others.",
      "Sort ownership versus customer cards.",
      "Slide from 1 share to 100 shares and watch the ownership fill increase.",
    ],
    options: [
      {
        id: "a",
        text: "owning part of a company",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "lending money to a company",
        correct: false,
        reviewPrompt: "Review the difference between ownership and lending.",
      },
      {
        id: "c",
        text: "working at the company",
        correct: false,
        reviewPrompt: "Go back to the ownership board and notice what a share actually represents.",
      },
    ],
    explanation:
      "Correct. A stock represents ownership in a company, not a loan and not a job.",
  },
  "2-2": {
    mechanicTitle: "Funding simulator",
    mechanicSummary:
      "Balance cash raised with ownership kept, then place new money where the business needs it.",
    prompt:
      "Adjust how much ownership is sold and see how the funding pot and founder control change together.",
    question: "A company may sell stock to:",
    activityKind: "funding-simulator",
    supportActivities: [
      "Sort funding choices into borrow money or sell ownership.",
      "Allocate raised money into hiring, expansion, equipment, and marketing.",
      "Use a founder decision slider to compare control versus funding.",
    ],
    options: [
      {
        id: "a",
        text: "raise money",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "eliminate customers",
        correct: false,
        reviewPrompt: "Review what purpose fundraising serves for a company.",
      },
      {
        id: "c",
        text: "close the company",
        correct: false,
        reviewPrompt: "Go back to how companies use stock sales to finance growth.",
      },
    ],
    explanation:
      "Right. Companies often sell stock to raise money for growth, expansion, or investment.",
  },
  "3-2": {
    mechanicTitle: "Return builder",
    mechanicSummary:
      "Change buy and sell prices, add dividend coins, and classify each outcome as a gain, dividend, or loss.",
    prompt:
      "Slide the buy price and sale price, then decide whether the result comes from price gain, dividend, or loss.",
    question: "If you buy at $10 and sell at $14, you made:",
    activityKind: "return-builder",
    supportActivities: [
      "Use the buy and sell slider to change gain or loss.",
      "Drop dividend coins into a shareholder wallet.",
      "Match scenarios into price gain, dividend, or loss.",
    ],
    options: [
      {
        id: "a",
        text: "a gain",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "a dividend",
        correct: false,
        reviewPrompt: "Review the difference between selling for more and receiving a dividend payment.",
      },
      {
        id: "c",
        text: "a fee",
        correct: false,
        reviewPrompt: "Look again at how sale price compares with purchase price.",
      },
    ],
    explanation:
      "Correct. Buying at $10 and selling at $14 creates a price gain.",
  },
  "4-2": {
    mechanicTitle: "News-to-chart interaction",
    mechanicSummary:
      "Map headlines to likely price direction, then watch demand and chart reactions change together.",
    prompt:
      "Tap a headline and compare how demand pressure and chart direction react when buyers want more or less of the stock.",
    question: "If more people want to buy than sell, price may:",
    activityKind: "news-chart",
    supportActivities: [
      "Sort headlines into likely up, likely down, or unclear.",
      "Move buyer and seller sliders to see price pressure shift.",
      "Tap a news item to reveal an animated chart response.",
    ],
    options: [
      {
        id: "a",
        text: "rise",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "disappear",
        correct: false,
        reviewPrompt: "Review how buyer demand can affect price without making the stock vanish.",
      },
      {
        id: "c",
        text: "stay guaranteed the same",
        correct: false,
        reviewPrompt: "Go back to the demand simulator and compare buy pressure with sell pressure.",
      },
    ],
    explanation:
      "Yes. If buy demand is stronger than sell pressure, price may rise.",
  },
  "5-2": {
    mechanicTitle: "Trading floor map",
    mechanicSummary:
      "Connect buyers and sellers, label the marketplace, and match company names to ticker symbols.",
    prompt:
      "Use the exchange map to connect an order from a buyer to an order from a seller and watch that match become a trade.",
    question: "A stock exchange is:",
    activityKind: "exchange-map",
    supportActivities: [
      "Drag buyer and seller orders together to create a trade.",
      "Place labels like exchange, buyer, seller, and trade on the scene.",
      "Match companies to ticker symbols.",
    ],
    options: [
      {
        id: "a",
        text: "a place where stocks are traded",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "a savings account",
        correct: false,
        reviewPrompt: "Review the exchange map and notice that it connects trading participants, not bank deposits.",
      },
      {
        id: "c",
        text: "a warehouse",
        correct: false,
        reviewPrompt: "Go back to how the marketplace scene is structured around buyers and sellers.",
      },
    ],
    explanation:
      "Correct. A stock exchange is the marketplace where stock trades are matched and completed.",
  },
  "6-2": {
    mechanicTitle: "Compare-and-rank board",
    mechanicSummary:
      "Order companies by market cap, build the formula, and challenge assumptions about cheap-looking share prices.",
    prompt:
      "Rank companies by total size, then compare how share price and shares outstanding work together.",
    question: "Market cap tells you:",
    activityKind: "market-cap-board",
    supportActivities: [
      "Sort companies from smallest to largest market cap.",
      "Build the formula share price times shares outstanding.",
      "Place cards into low price but not necessarily cheap and large company despite share price.",
    ],
    options: [
      {
        id: "a",
        text: "the total value of all shares",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "one share’s price only",
        correct: false,
        reviewPrompt: "Review why market cap includes all shares, not just the price of one.",
      },
      {
        id: "c",
        text: "annual salary of executives",
        correct: false,
        reviewPrompt: "Go back to the formula builder and focus on share price times shares outstanding.",
      },
    ],
    explanation:
      "Exactly. Market cap is the total value of all shares together.",
  },
  "7-2": {
    mechanicTitle: "Timeline placement",
    mechanicSummary:
      "Compare short-term and long-term behaviors, then observe how often each style checks price movement.",
    prompt:
      "Place behaviors onto a timeline and compare how trader-like versus investor-like habits feel over time.",
    question: "Investing usually focuses more on:",
    activityKind: "timeline",
    supportActivities: [
      "Drag behaviors onto short-term or long-term.",
      "Classify characters as more investor-like or more trader-like.",
      "Compare their price-checking stress meter.",
    ],
    options: [
      {
        id: "a",
        text: "longer-term ownership",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "minute-by-minute movement only",
        correct: false,
        reviewPrompt: "Review the timeline placement between long-term and short-term behavior.",
      },
      {
        id: "c",
        text: "random guessing",
        correct: false,
        reviewPrompt: "Go back to the investor versus trader scenarios and compare their goals.",
      },
    ],
    explanation:
      "Right. Investing usually emphasizes longer-term ownership rather than minute-by-minute movement.",
  },
  "8-2": {
    mechanicTitle: "Stock checklist explorer",
    mechanicSummary:
      "Order smart beginner questions, sort green and red flags, and link businesses to how they earn money.",
    prompt:
      "Use the checklist explorer to start with business understanding first, then layer on risk and quality clues.",
    question: "A strong beginner question is:",
    activityKind: "checklist",
    supportActivities: [
      "Place beginner questions into the best order.",
      "Sort clues into green flag or red flag.",
      "Match companies to how they make money.",
    ],
    options: [
      {
        id: "a",
        text: "how does the company make money?",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "is the logo cool?",
        correct: false,
        reviewPrompt: "Review why business understanding comes before superficial cues.",
      },
      {
        id: "c",
        text: "is the ticker short?",
        correct: false,
        reviewPrompt: "Go back to the beginner checklist and compare business questions against hype questions.",
      },
    ],
    explanation:
      "Correct. Understanding how the business makes money is one of the strongest beginner questions.",
  },
  "9-2": {
    mechanicTitle: "Portfolio builder",
    mechanicSummary:
      "Spread holdings across baskets and sectors, then compare concentration warnings on the risk radar.",
    prompt:
      "Build two mini portfolios, one concentrated and one more diversified, and compare the risk signals side by side.",
    question: "Diversification means:",
    activityKind: "portfolio",
    supportActivities: [
      "Compare all eggs in one basket against spreading them out.",
      "Group company cards by industry to spot concentration.",
      "Place portfolios on a radar from concentrated to diversified.",
    ],
    options: [
      {
        id: "a",
        text: "spreading across multiple holdings",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "buying only one stock",
        correct: false,
        reviewPrompt: "Review the egg basket comparison and sector grouping warning.",
      },
      {
        id: "c",
        text: "avoiding all loss forever",
        correct: false,
        reviewPrompt: "Go back to the risk radar and notice that diversification lowers concentration risk, not all risk.",
      },
    ],
    explanation:
      "Exactly. Diversification means spreading exposure across multiple holdings instead of concentrating everything in one name.",
  },
  "10-2": {
    mechanicTitle: "Sandbox exploration",
    mechanicSummary:
      "Compare chart shapes, simple company fields, and confidence labels before making any beginner judgment.",
    prompt:
      "Tap, zoom, compare, and label the chart cards so you can decide whether you understand the stock, need more learning, or think it feels too risky.",
    question: "A chart with big up-and-down movement may be called:",
    activityKind: "chart-lab",
    supportActivities: [
      "Zoom and tap a simple chart playground.",
      "Drag labels like volatile, steady, uptrend, drop, and recovery.",
      "Compare two stocks using share price, market cap, industry, and dividend yes or no.",
    ],
    options: [
      {
        id: "a",
        text: "volatile",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "guaranteed",
        correct: false,
        reviewPrompt: "Review the chart labels and compare movement patterns with certainty.",
      },
      {
        id: "c",
        text: "diversified",
        correct: false,
        reviewPrompt: "Go back to the chart labels and distinguish movement style from portfolio structure.",
      },
    ],
    explanation:
      "Right. Large up-and-down movement is commonly described as volatility.",
  },
};

export const checkContent: Record<string, CheckContent> = {
  "1-3": {
    question: "If you own more shares, your ownership is:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "larger",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "smaller",
        correct: false,
        reviewPrompt: "Revisit the share stacking activity and compare how ownership fills change.",
      },
      {
        id: "c",
        text: "unchanged",
        correct: false,
        reviewPrompt: "Review how adding shares changes your slice of the company.",
      },
    ],
    explanation:
      "Correct. More shares usually mean a larger ownership slice of the company.",
    reviewPrompt: "Review how ownership changes as share count increases.",
  },
  "2-3": {
    question: "Selling stock means giving investors:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "ownership",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "coupons",
        correct: false,
        reviewPrompt: "Review what investors receive when a company sells stock.",
      },
      {
        id: "c",
        text: "salaries",
        correct: false,
        reviewPrompt: "Go back to the funding simulator and compare employees with investors.",
      },
    ],
    explanation:
      "Yes. Selling stock means investors receive ownership in exchange for capital.",
    reviewPrompt: "Review how stock sales exchange ownership for cash.",
  },
  "3-3": {
    question: "A dividend is:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "a payment some companies give shareholders",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "a loan",
        correct: false,
        reviewPrompt: "Review how dividends differ from lending money.",
      },
      {
        id: "c",
        text: "a tax",
        correct: false,
        reviewPrompt: "Go back to the return builder and compare price gains with dividend payments.",
      },
    ],
    explanation:
      "Correct. A dividend is a payment some companies distribute to shareholders.",
    reviewPrompt: "Review the difference between dividends and gains from selling.",
  },
  "4-3": {
    question: "Bad company news may:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "hurt the stock price",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "guarantee profit",
        correct: false,
        reviewPrompt: "Review how news can shift demand without guaranteeing a good outcome.",
      },
      {
        id: "c",
        text: "have no possible effect",
        correct: false,
        reviewPrompt: "Go back to the headline matcher and compare likely market reactions.",
      },
    ],
    explanation:
      "Right. Bad company news can hurt the stock price because it may reduce demand.",
    reviewPrompt: "Review how news influences demand and expectations.",
  },
  "5-3": {
    question: "A ticker symbol is:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "a short stock code",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "a CEO nickname",
        correct: false,
        reviewPrompt: "Review the ticker matching activity and the exchange labels.",
      },
      {
        id: "c",
        text: "a product name",
        correct: false,
        reviewPrompt: "Go back to the company-to-ticker matching board.",
      },
    ],
    explanation:
      "Correct. A ticker symbol is the short code used to identify a stock.",
    reviewPrompt: "Review what ticker symbols identify on the exchange.",
  },
  "6-3": {
    question: "A $5 stock is always cheaper than a $500 stock:",
    type: "truefalse",
    correctAnswer: false,
    explanation:
      "False. Share price alone does not tell you whether a whole company is cheaper or smaller. Market cap matters too.",
    reviewPrompt: "Review why share price and market cap answer different questions.",
  },
  "7-3": {
    question: "Trading usually focuses more on:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "shorter-term price changes",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "retirement planning only",
        correct: false,
        reviewPrompt: "Review the timeline placement between investor and trader behavior.",
      },
      {
        id: "c",
        text: "company mission statements only",
        correct: false,
        reviewPrompt: "Go back to the short-term versus long-term comparison.",
      },
    ],
    explanation:
      "Exactly. Trading is usually more focused on shorter-term price changes.",
    reviewPrompt: "Review how trading differs from longer-term investing.",
  },
  "8-3": {
    question: "Beginners should also look at:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "risk",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "only hype",
        correct: false,
        reviewPrompt: "Review the checklist explorer and the importance of business fundamentals.",
      },
      {
        id: "c",
        text: "only social media comments",
        correct: false,
        reviewPrompt: "Go back to the green flag and red flag sorting activity.",
      },
    ],
    explanation:
      "Correct. Beginners should pay attention to risk along with how the company works.",
    reviewPrompt: "Review how risk fits into a beginner stock checklist.",
  },
  "9-3": {
    question: "Holding only one company creates:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "more concentration risk",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "guaranteed safety",
        correct: false,
        reviewPrompt: "Review the egg basket game and concentration warnings.",
      },
      {
        id: "c",
        text: "automatic higher dividends",
        correct: false,
        reviewPrompt: "Go back to the sector grouping and risk radar.",
      },
    ],
    explanation:
      "Right. Holding only one company creates more concentration risk.",
    reviewPrompt: "Review how diversification reduces concentration risk.",
  },
  "10-3": {
    question: "If you do not understand a business yet, a smart beginner response is:",
    type: "multiple",
    options: [
      {
        id: "a",
        text: "learn more first",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "buy it immediately",
        correct: false,
        reviewPrompt: "Review the decision zone labels inside the stock lab.",
      },
      {
        id: "c",
        text: "ignore all risks",
        correct: false,
        reviewPrompt: "Go back to the sandbox and compare understanding with risk comfort.",
      },
    ],
    explanation:
      "Exactly. If you do not understand a business yet, learning more first is the smart beginner move.",
    reviewPrompt: "Review why beginners should pause and learn more when understanding is low.",
  },
};

export const performanceData = [
  { concept: "Ownership Basics", score: 100, detail: "Clear understanding" },
  { concept: "Funding Decisions", score: 96, detail: "Strong reasoning" },
  { concept: "Returns and Dividends", score: 98, detail: "Well understood" },
  { concept: "Price Drivers", score: 94, detail: "Good pattern recognition" },
  { concept: "Diversification", score: 100, detail: "Excellent judgment" },
];
