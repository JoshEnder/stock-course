export interface Lesson {
  id: string;
  title: string;
  question: string;
  answers: string[];
  correctIndex: number;
  locked: boolean;
}

export const lessons: Lesson[] = [
  {
    id: "stock-basics",
    title: "Ownership",
    question: "A company keeps growing revenue. What are you actually buying?",
    answers: ["A stake in its earnings.", "Access to its products.", "A prediction on price."],
    correctIndex: 0,
    locked: false,
  },
  {
    id: "earnings",
    title: "Earnings",
    question: "Company beats earnings. Price?",
    answers: ["A. Falls sharply", "B. Stays the same", "C. Stock price goes up"],
    correctIndex: 2,
    locked: false,
  },
  {
    id: "fed-rates",
    title: "Fed Rates",
    question: "Fed raises rates. Growth stocks?",
    answers: ["A. They go up", "B. They go down", "C. No change"],
    correctIndex: 1,
    locked: true,
  },
  {
    id: "risk-mgmt",
    title: "Risk & Reward",
    question: "Portfolio diversification means?",
    answers: ["A. Buy one stock", "B. Own many different stocks", "C. Sell everything"],
    correctIndex: 1,
    locked: true,
  },
  {
    id: "charts",
    title: "Charts",
    question: "Rising chart indicates?",
    answers: ["A. Downtrend", "B. Sideways", "C. Uptrend / Bullish"],
    correctIndex: 2,
    locked: true,
  },
  {
    id: "market-timing",
    title: "Market Pressure",
    question: "When should you buy a stock?",
    answers: ["A. When it's trending", "B. When you understand it", "C. On a Monday"],
    correctIndex: 1,
    locked: true,
  },
];
