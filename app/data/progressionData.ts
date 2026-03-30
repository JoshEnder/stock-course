import type { ProgressionNode } from "@/app/types/experience";

export const progressionNodes: ProgressionNode[] = [
  {
    id: "price_basics",
    title: "Price Basics",
    locked: false,
    level: 1,
  },
  {
    id: "earnings_moves",
    title: "Earnings Moves",
    locked: false,
    level: 2,
  },
  {
    id: "fed_decisions",
    title: "Fed Decisions",
    locked: true,
    level: 3,
  },
  {
    id: "supply_shocks",
    title: "Supply Shocks",
    locked: true,
    level: 4,
  },
  {
    id: "chart_patterns",
    title: "Chart Patterns",
    locked: true,
    level: 5,
  },
  {
    id: "trade_setups",
    title: "Trade Setups",
    locked: true,
    level: 6,
  },
];
