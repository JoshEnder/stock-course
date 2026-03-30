/**
 * authored-lessons-foundations-v2.ts
 *
 * Rebuilt Foundations module (L1–L10) using the v2 interaction system.
 * Import this and merge into authoredLessonExperiences to replace the originals.
 *
 * New activityKinds used:
 *   ownership-grid | pressure-slider | live-order-book | predict-reveal
 *   story-branch   | character-sort  | compass-gauge   | price-slider-lab
 */

import type {
  CheckContent,
  LearnContent,
  PracticeContent,
  PracticeOption,
} from "../lib/course-data";

export type AuthoredLessonExperienceV2 = {
  objective: string;
  rewardLine: string;
  masteryTags: string[];
  learn: LearnContent;
  practice: PracticeContent;
  check: CheckContent;
};

function opt(
  id: string,
  text: string,
  correct: boolean,
  feedback?: string,
): PracticeOption {
  return { id, text, correct, reviewPrompt: "", feedback };
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 1 — WHAT OWNING A STOCK MEANS
// Screen flow: Hook panel → Ownership Grid panel → Check
// Signature Moment: The Ownership Grid (dot visualization + SHAREHOLDER stamp)
// ─────────────────────────────────────────────────────────────────────────────
const foundations1: AuthoredLessonExperienceV2 = {
  objective: "Create the felt sense that owning a stock means owning a real piece of a company.",
  rewardLine: "You're a shareholder now. That's not a metaphor.",
  masteryTags: ["ownership-basics"],
  learn: {
    title: "What if you owned part of Nike?",
    visual: "ownership",
    explanation: "A stock is ownership. Your share is small. It's real.",
    whatThisMeans: "A share is ownership, not a salary or a loan.",
    commonMistake: "Owning stock is different from lending money or earning wages.",
    labMoment: "Tap your glowing dot to claim your slice.",
    supportActivities: [],
    panels: [
      {
        id: "hook",
        title: "What if you owned part of Nike?",
        copy: "",
        // No body — the visual does the work. First 5 seconds = identity shift.
        eyebrow: "",
        highlights: [],
      },
      {
        id: "ownership-grid",
        title: "This is your slice.",
        copy: "Tap the glowing dot.",
        eyebrow: "★ Signature Moment",
        activityKind: "ownership-grid",
        activityData: {
          company: "Nike",
          totalShares: 1_500_000_000,
          yourShares: 1,
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "Ownership fast-round",
    mechanicSummary: "Three quick calls. Ownership or not?",
    prompt: "Is this ownership or something else?",
    question: "",
    activityKind: "rapid-fire-streak",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Finish all three cards",
    activityData: {
      streakLabel: "OWNERSHIP",
      perfectReward: "Shareholder instinct: locked in.",
      cards: [
        {
          id: "c1",
          prompt: "You bought one share of Nike. What do you have?",
          optionA: "Ownership in Nike",
          optionB: "A loan to Nike",
          correct: "A",
          explanation: "Buying stock gives you an ownership slice — no repayment expected from Nike.",
        },
        {
          id: "c2",
          prompt: "Nike owes you $80/hour for designing their website. Is this ownership?",
          optionA: "Yes — I'm a stakeholder",
          optionB: "No — that's wages, not ownership",
          correct: "B",
          explanation: "Wages come from labor. Ownership comes from buying shares. Completely different.",
        },
        {
          id: "c3",
          prompt: "You lent Nike $500 and they'll pay you back with interest. Stock owner?",
          optionA: "No — that's lending, not owning",
          optionB: "Yes — I put money in, so I own part",
          correct: "A",
          explanation: "Lending is a debt relationship. Ownership is an equity relationship. Not the same.",
        },
      ],
    },
    supportActivities: [],
    options: [],
    explanation: "Right. Ownership means you own part of the company.",
  },
  check: {
    question: "What did buying that Nike share actually give you?",
    type: "multiple",
    options: [
      opt("a", "A loan to Nike", false, "That's lending. Stock is ownership — no repayment expected."),
      opt("b", "Ownership in Nike", true),
      opt("c", "A guaranteed profit from every sale", false, "Ownership doesn't promise returns. That's the twist."),
      opt("d", "A job at Nike HQ", false, "Owning stock and working there are different things."),
    ],
    explanation: "Buying stock gives you ownership in the company. Tiny slice. Real ownership.",
    reviewPrompt: "ownership-basics",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 2 — WHY COMPANIES SELL STOCK
// Screen flow: Revenue-wall hook panel → Decision fork (3 cards) → Check
// Emotional target: Power. "I'm the CEO making a real decision."
// ─────────────────────────────────────────────────────────────────────────────
const foundations2: AuthoredLessonExperienceV2 = {
  objective: "Teach that companies sell stock to raise capital for growth.",
  rewardLine: "You just made the CEO call.",
  masteryTags: ["capital-raising"],
  learn: {
    title: "Your startup just hit a wall.",
    visual: "funding",
    explanation: "Companies sell stock to raise capital. That money funds growth.",
    whatThisMeans: "Selling stock raises capital. It doesn't guarantee the stock goes up.",
    commonMistake: "Issuing shares is a financing choice, not a promise.",
    labMoment: "Explore the three funding options and see what each costs.",
    supportActivities: [],
    panels: [
      {
        id: "revenue-hook",
        title: "Your startup just hit a wall.",
        copy: "You built something real. It's growing. But to scale, you need $10M you don't have.\n\nYou have 3 options. Each has consequences.",
        eyebrow: "Scenario",
      },
      {
        id: "funding-decision",
        title: "How do you raise $10M?",
        copy: "Tap each card to see what each option costs.",
        activityKind: "funding-simulator",
        activityData: {
          variant: "three-path",
          paths: [
            {
              id: "loan",
              label: "Bank Loan",
              icon: "bank",
              benefit: "You keep 100% ownership",
              cost: "Monthly interest payments. Forever.",
              consequence: "Debt meter fills over time.",
            },
            {
              id: "investors",
              label: "Private Investors",
              icon: "handshake",
              benefit: "Experienced money. Big check.",
              cost: "They own part of your company now.",
              consequence: "Ownership pie splits.",
            },
            {
              id: "ipo",
              label: "Go Public (IPO)",
              icon: "chart-up",
              benefit: "Raise millions. Fast.",
              cost: "Anyone can own part of your company.",
              consequence: "Share counter spins. Cash counter spins.",
              highlighted: true,
            },
          ],
          conclusion: "Most high-growth companies eventually go public.",
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "CEO fast-round",
    mechanicSummary: "Real reason to sell stock — or a false promise?",
    prompt: "Is this why a company would actually sell stock?",
    question: "",
    activityKind: "rapid-fire-streak",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Finish all three cards",
    activityData: {
      streakLabel: "CAPITAL",
      perfectReward: "CEO mindset unlocked.",
      cards: [
        {
          id: "r1",
          prompt: "TechCo wants to expand to 5 new countries. They issue stock to raise $50M. Real reason?",
          optionA: "Yes — raising capital for growth",
          optionB: "No — that's not why companies sell stock",
          correct: "A",
          explanation: "Expansion requires capital. Selling stock raises it. Classic real reason.",
        },
        {
          id: "r2",
          prompt: "A company says 'We're selling stock to guarantee our share price rises.' Real reason?",
          optionA: "Yes — selling stock pushes price up",
          optionB: "No — issuing shares doesn't guarantee price",
          correct: "B",
          explanation: "Issuing shares raises money. It doesn't control what price does afterward.",
        },
        {
          id: "r3",
          prompt: "A startup issues stock to fund building a new factory. Real reason?",
          optionA: "Yes — capital for real operations",
          optionB: "No — factories should be self-funded",
          correct: "A",
          explanation: "Funding real operations is exactly what stock issuance is for.",
        },
      ],
    },
    supportActivities: [],
    options: [],
    explanation: "Companies issue stock to raise capital for growth. That's the deal.",
  },
  check: {
    question: "Why does a company sell shares to the public?",
    type: "multiple",
    options: [
      opt("a", "To give shareholders free money", false, "No — the company raises money from shareholders."),
      opt("b", "To raise capital for growth", true),
      opt("c", "To guarantee the stock price rises", false, "Issuing shares doesn't control the price. It raises money."),
      opt("d", "To avoid ever reporting results", false, "Public companies report more, not less."),
    ],
    explanation: "Capital fuels the next chapter. That's why companies go public.",
    reviewPrompt: "capital-raising",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 3 — HOW BUYERS AND SELLERS MEET
// Screen flow: Pressure Slider (learn) → Live Order Book (practice, SIGNATURE) → Check
// Emotional target: Electricity. The aliveness of a live market.
// ─────────────────────────────────────────────────────────────────────────────
const foundations3: AuthoredLessonExperienceV2 = {
  objective: "Show that stock markets match buyers and sellers, and that imbalance moves price.",
  rewardLine: "You just read a live market. That's the skill.",
  masteryTags: ["buyer-seller-mechanics"],
  learn: {
    title: "10,847 people want to buy this stock.",
    visual: "exchange",
    explanation: "Markets match buyers and sellers. More buyers than sellers = upward pressure.",
    whatThisMeans: "The market is a matching system. Price moves when one side is more eager.",
    commonMistake: "A stock market is not a fixed-price shelf. Prices react to imbalance.",
    labMoment: "Drag the slider to shift buyer/seller pressure and watch the price move.",
    supportActivities: [],
    panels: [
      {
        id: "pressure-intro",
        title: "10,847 people want to buy this stock.",
        copy: "Only 2,103 want to sell.\n\nDrag the slider to shift the balance and watch the price react.",
        eyebrow: "Feel the pressure",
        activityKind: "pressure-slider",
        activityData: {
          startBuyers: 10847,
          startSellers: 2103,
          startPrice: 142,
          minPrice: 133,
          maxPrice: 151,
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "You're on the floor.",
    mechanicSummary: "Watch a live order book and decide: BUY or WAIT?",
    prompt: "You see the price rising. What do you do?",
    question: "More buyers than sellers usually means...",
    activityKind: "live-order-book",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Make your decision first",
    activityData: {
      startPrice: 142,
      contextBanner: "Record quarterly earnings just announced. Orders flooding in.",
      priceTarget: 146,
      buyConsequence: "Filled at ${price}. You're in.",
      waitConsequence: "Price kept climbing to $146. Both choices teach market psychology.",
    },
    supportActivities: [],
    options: [],
    explanation: "Supply, demand, price. The whole market in three words.",
  },
  check: {
    question: "More buyers than sellers usually means...",
    type: "multiple",
    options: [
      opt("a", "Price stays perfectly flat", false, "Imbalance doesn't freeze prices — it moves them."),
      opt("b", "Price pressure moves upward", true),
      opt("c", "The company gets richer immediately", false, "Market trading doesn't directly add money to the company."),
      opt("d", "Sellers get guaranteed profits", false, "Nothing is guaranteed on either side."),
    ],
    explanation: "Supply, demand, price. When buyers dominate, price leans upward.",
    reviewPrompt: "buyer-seller-mechanics",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 4 — HOW PRICE CAN MOVE UP OR DOWN
// Screen flow: Compass intro panel → Compass classification game (practice) → Check
// Emotional target: Pattern recognition. "I can read this."
// ─────────────────────────────────────────────────────────────────────────────
const foundations4: AuthoredLessonExperienceV2 = {
  objective: "Connect demand imbalance to price direction through pattern classification.",
  rewardLine: "You called it. You're reading pressure.",
  masteryTags: ["price-pressure"],
  learn: {
    title: "3 scenarios. Can you call them before I explain?",
    visual: "news",
    explanation: "Price is just pressure. When one side is stronger — price leans that way.",
    whatThisMeans: "Price pressure comes from imbalance. Not every move has a clean direction.",
    commonMistake: "Mixed pressure can leave price roughly unchanged. Not every move is a story.",
    labMoment: "Tap the needle and feel the spring physics. Then classify 3 real scenarios.",
    supportActivities: [],
    panels: [
      {
        id: "compass-intro",
        title: "Price is just pressure.",
        copy: "When buyers are stronger — price leans up.\nWhen sellers are stronger — price leans down.\nSometimes pressure is mixed. That's real too.\n\nTap the needle to feel it.",
        eyebrow: "The compass",
        activityKind: "compass-gauge",
        activityData: {
          scenarios: [
            {
              text: "Huge earnings beat. Buyers rush in. Sellers pull back.",
              direction: "up",
              explanation: "Strong buying pressure. Sellers stepped back. Clear direction.",
            },
            {
              text: "CEO resigns without warning. Sellers flood in. Buyers vanish.",
              direction: "down",
              explanation: "A shock like that tilts the table fast.",
            },
            {
              text: "Mixed analyst opinions. Some buy, some sell. No dominant force.",
              direction: "unclear",
              explanation: "Not every move has a clean story. That's normal.",
            },
          ],
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "Which way does it lean?",
    mechanicSummary: "Classify 3 market scenarios before the needle reveals the answer.",
    prompt: "Classify each scenario by price direction.",
    question: "Demand jumps. Supply stays flat. What's the most likely result?",
    activityKind: "compass-gauge",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Classify all 3 scenarios first",
    activityData: {
      scenarios: [
        {
          text: "Huge earnings beat. Buyers rush in. Sellers pull back.",
          direction: "up",
          explanation: "Strong buying pressure. Clear upward direction.",
        },
        {
          text: "CEO resigns without warning. Sellers flood in. Buyers vanish.",
          direction: "down",
          explanation: "A shock like that tilts the table fast.",
        },
        {
          text: "Mixed analyst opinions. Some buy, some sell. No dominant force.",
          direction: "unclear",
          explanation: "Not every move has a clean story. That's normal.",
        },
      ],
    },
    supportActivities: [],
    options: [
      opt("a", "Price pressure upward", true),
      opt("b", "Price guaranteed flat", false, "Imbalance doesn't freeze prices."),
      opt("c", "Company ownership disappears", false, "Ownership isn't affected by price pressure."),
      opt("d", "Revenue becomes irrelevant", false, "Business fundamentals and price pressure are separate ideas."),
    ],
    explanation: "Imbalance creates movement. Demand plus limited supply = upward lean.",
  },
  check: {
    question: "Demand jumps. Supply stays flat. What's the most likely result?",
    type: "multiple",
    options: [
      opt("a", "Price pressure upward", true),
      opt("b", "Price guaranteed flat", false, "That ignores the imbalance."),
      opt("c", "Company ownership disappears", false, "Ownership doesn't disappear because demand changes."),
      opt("d", "Revenue becomes irrelevant", false, "Demand pressure and business fundamentals are different ideas."),
    ],
    explanation: "A is correct. Stronger demand with limited supply usually creates upward pressure.",
    reviewPrompt: "price-pressure",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 5 — GAIN, LOSS, AND BREAK-EVEN
// Screen flow: Price Slider Lab (learn) → Card Sort (practice) → Rapid-fire Check
// Emotional target: Physical, visceral. The number moves and you FEEL it.
// ─────────────────────────────────────────────────────────────────────────────
const foundations5: AuthoredLessonExperienceV2 = {
  objective: "Build reflex-level recognition of gain, loss, and break-even from buy/sell prices.",
  rewardLine: "You can call a gain from a loss in under two seconds. That's the foundation.",
  masteryTags: ["gain-loss-basics"],
  learn: {
    title: "Move it. Feel it.",
    visual: "returns",
    explanation: "Sell above buy = gain. Sell below buy = loss. Same price = break-even.",
    whatThisMeans: "Return starts with comparing where you bought and where you sold.",
    commonMistake: "A dividend is not the same thing as a gain from selling.",
    labMoment: "Drag the buy and sell handles. Watch the outcome badge flip.",
    supportActivities: [],
    panels: [
      {
        id: "price-slider",
        title: "Move it. Feel it.",
        copy: "Drag BUY and SELL to any prices.\nThe outcome badge updates instantly.",
        eyebrow: "The lab",
        activityKind: "price-slider-lab",
        activityData: {
          minPrice: 5,
          maxPrice: 55,
          initialBuy: 20,
          initialSell: 30,
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "Call it in 2 seconds.",
    mechanicSummary: "Gain or loss? Answer before the reveal.",
    prompt: "Gain or loss?",
    question: "",
    activityKind: "rapid-fire-streak",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Finish all six cards",
    activityData: {
      streakLabel: "OUTCOME",
      perfectReward: "Six for six. You feel it now.",
      cards: [
        {
          id: "s1",
          prompt: "Buy $20. Sell $27.",
          optionA: "Gain",
          optionB: "Loss",
          correct: "A",
          explanation: "$27 > $20. You made $7. That's a gain.",
        },
        {
          id: "s2",
          prompt: "Buy $20. Sell $20.",
          optionA: "Gain",
          optionB: "Break-even",
          correct: "B",
          explanation: "Same in as out. No profit, no loss. That's break-even.",
        },
        {
          id: "s3",
          prompt: "Buy $20. Sell $16.",
          optionA: "Gain",
          optionB: "Loss",
          correct: "B",
          explanation: "$16 < $20. You lost $4. That's a loss.",
        },
        {
          id: "s4",
          prompt: "Buy $15. Sell $12.",
          optionA: "Break-even",
          optionB: "Loss",
          correct: "B",
          explanation: "$12 < $15. Down $3. Loss.",
        },
        {
          id: "s5",
          prompt: "Buy $30. Sell $35.",
          optionA: "Gain",
          optionB: "Break-even",
          correct: "A",
          explanation: "$35 > $30. You made $5. Gain.",
        },
        {
          id: "s6",
          prompt: "Buy $40. Sell $40.",
          optionA: "Gain",
          optionB: "Break-even",
          correct: "B",
          explanation: "Same price in and out. Break-even.",
        },
      ],
    },
    supportActivities: [],
    options: [],
    explanation: "Selling above your buy price creates a gain. Below is a loss. Same is break-even.",
  },
  check: {
    question: "Quick outcome check",
    type: "multiple",
    variant: "rapid-fire",
    rapidFireCases: [
      {
        id: "rf1",
        prompt: "Buy at $30, sell at $24",
        options: [
          opt("a", "Gain", false, "24 is below 30."),
          opt("b", "Loss", true),
          opt("c", "Break-even", false, "24 ≠ 30."),
        ],
        explanation: "24 is below 30, so this is a loss.",
        reviewPrompt: "gain-loss-basics",
      },
      {
        id: "rf2",
        prompt: "Buy at $18, sell at $18",
        options: [
          opt("a", "Break-even", true),
          opt("b", "Loss", false, "Same price in and out."),
          opt("c", "Gain", false, "Same price in and out."),
        ],
        explanation: "Same buy and sell price means break-even.",
        reviewPrompt: "gain-loss-basics",
      },
      {
        id: "rf3",
        prompt: "Buy at $12, sell at $17",
        options: [
          opt("a", "Loss", false, "17 is above 12."),
          opt("b", "Break-even", false, "17 ≠ 12."),
          opt("c", "Gain", true),
        ],
        explanation: "17 is above 12, so this is a gain.",
        reviewPrompt: "gain-loss-basics",
      },
    ],
    explanation: "Compare the sell price with the buy price. The outcome becomes clear.",
    reviewPrompt: "gain-loss-basics",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 6 — DIVIDENDS VS PRICE GAIN
// Screen flow: Split-screen reveal (learn) → Match mechanism (practice) → Check
// Emotional target: "Those are two completely different things." Relief of clarity.
// ─────────────────────────────────────────────────────────────────────────────
const foundations6: AuthoredLessonExperienceV2 = {
  objective: "Distinguish dividends (cash from company) from price gains (selling higher).",
  rewardLine: "Two lanes. You'll never mix them up again.",
  masteryTags: ["dividends-vs-price-gain"],
  learn: {
    title: "Two investors. Same stock. Different returns.",
    visual: "returns",
    explanation: "Price gain comes from selling higher. A dividend is cash paid to you for owning shares.",
    whatThisMeans: "One return comes from price change. The other comes from cash the company pays.",
    commonMistake: "Beginners blur dividends and price gains. They're not the same mechanism.",
    labMoment: "Tap either side to see a fuller example.",
    supportActivities: [],
    panels: [
      {
        id: "split-reveal",
        title: "Two investors. Same stock. Different returns.",
        copy: "LEFT: Coins drop into a wallet every quarter. That's a dividend.\nRIGHT: A price line climbs. Sell higher than you bought. That's a price gain.\n\nSame stock. Two different return types.",
        eyebrow: "Two lanes",
        activityKind: "return-builder",
        activityData: {
          variant: "dividend-vs-gain",
          left: {
            label: "DIVIDEND",
            description: "Cash the company sends you. Just for owning shares.",
            example: "Nike paid $0.33/share last quarter.",
          },
          right: {
            label: "PRICE GAIN",
            description: "You sell at a higher price than you paid.",
            example: "Bought at $80. Now $97. Sell → +$17.",
          },
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "Flip the card. Name the lane.",
    mechanicSummary: "Tap each card to reveal which type of return it describes.",
    prompt: "Tap to reveal: dividend or price gain?",
    question: "Which statement best describes a price gain?",
    activityKind: "tap-to-flip",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Flip all four cards",
    activityData: {
      instruction: "Tap each card to reveal which lane it belongs to",
      cards: [
        {
          id: "d1",
          front: "The company sent me cash. I didn't sell anything.",
          category: "DIVIDEND",
          categoryColor: "amber",
          explanation: "Cash from the company to shareholders — no sale needed. That's a dividend.",
        },
        {
          id: "d2",
          front: "I bought at $50 and just sold at $65.",
          category: "PRICE GAIN",
          categoryColor: "emerald",
          explanation: "You sold higher than you paid. The gain came from the price movement.",
        },
        {
          id: "d3",
          front: "I get $0.40 per share dropped into my account every quarter.",
          category: "DIVIDEND",
          categoryColor: "amber",
          explanation: "Regular cash per share, paid by the company. Dividend.",
        },
        {
          id: "d4",
          front: "I never sold, but the stock went from $80 to $97.",
          category: "PRICE GAIN",
          categoryColor: "emerald",
          explanation: "The price appreciated. That's unrealized price gain — still counts as price movement.",
        },
      ],
    },
    supportActivities: [],
    options: [
      opt("a", "You sold for more than you paid", true),
      opt("b", "Cash paid to shareholders", false, "That describes a dividend, not a price gain."),
      opt("c", "A guaranteed doubling of investment", false, "Neither dividends nor price gains guarantee a doubling."),
    ],
    explanation: "Right. Price gain comes from selling at a higher price than you paid.",
  },
  check: {
    question: "Which statement best describes a dividend?",
    type: "multiple",
    options: [
      opt("a", "Cash paid to you for owning shares", true),
      opt("b", "The stock price going higher", false, "That is price appreciation, not a dividend."),
      opt("c", "A guaranteed doubling of your investment", false, "Dividends are real payments, not guaranteed doublings."),
      opt("d", "A fee you pay to trade", false, "A dividend flows to you. A fee flows away from you."),
    ],
    explanation: "A dividend is cash paid to shareholders. No sale required.",
    reviewPrompt: "dividends-vs-price-gain",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 7 — STOCK VS BOND VS SAVINGS
// Screen flow: Meet the Three (learn) → Character Sort (practice) → Check
// Emotional target: Taxonomy through people. You remember Alex, not a category.
// ─────────────────────────────────────────────────────────────────────────────
const foundations7: AuthoredLessonExperienceV2 = {
  objective: "Differentiate stocks from bonds and savings through character-based narrative.",
  rewardLine: "Alex. Jordan. Riley. You'll remember them before you remember the definitions.",
  masteryTags: ["asset-type-basics"],
  learn: {
    title: "Same $1,000. Three different choices.",
    visual: "ownership",
    explanation: "Stocks are ownership. Bonds are lending. Savings are stored cash.",
    whatThisMeans: "Different products answer different needs. Different risk. Different reward.",
    commonMistake: "A stock is not a bond or savings account just because all three involve money.",
    labMoment: "Tap each character to see their profile. Then sort their statements.",
    supportActivities: [],
    panels: [
      {
        id: "meet-three",
        title: "Same $1,000. Three different choices.",
        copy: "Tap each person to see what they chose and why.\n\nDouble-tap to read their profile.",
        eyebrow: "The characters",
        activityKind: "character-sort",
        activityData: {
          characters: [
            {
              id: "alex",
              name: "Alex",
              assetLabel: "Stock",
              tag: "Owner",
              tagColor: "#3b82f6",
              emoji: "👤",
              profile: "Owns part of a company. Could gain big. Could lose. Rides the company's story.",
            },
            {
              id: "jordan",
              name: "Jordan",
              assetLabel: "Bond",
              tag: "Lender",
              tagColor: "#f59e0b",
              emoji: "👤",
              profile: "Lent money to a company or government. Gets fixed interest back. More predictable. Less upside.",
            },
            {
              id: "riley",
              name: "Riley",
              assetLabel: "Savings",
              tag: "Depositor",
              tagColor: "#22c55e",
              emoji: "👤",
              profile: "Money in a bank. Safe. Available. Very low return.",
            },
          ],
          cards: [
            { id: "c1", text: "I own a piece of a company.", targetCharacterId: "alex" },
            { id: "c2", text: "I'll get fixed interest payments.", targetCharacterId: "jordan" },
            { id: "c3", text: "My money is insured and available anytime.", targetCharacterId: "riley" },
            { id: "c4", text: "I could share in the company's growth.", targetCharacterId: "alex" },
            { id: "c5", text: "I'm more like a lender than an owner.", targetCharacterId: "jordan" },
          ],
        },
      },
    ],
  },
  practice: {
    mechanicTitle: "Alex, Jordan, or Riley?",
    mechanicSummary: "Three statements. Lock in who said it.",
    prompt: "Who is most likely saying this?",
    question: "",
    activityKind: "rapid-fire-streak",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Finish all three cards",
    activityData: {
      streakLabel: "IDENTITY",
      perfectReward: "You remember the people. Now you remember the concepts.",
      cards: [
        {
          id: "c1",
          prompt: "\"I own a piece of a company. I could gain big — or lose. I'm riding their story.\"",
          optionA: "Alex (Stock / Owner)",
          optionB: "Jordan (Bond / Lender)",
          correct: "A",
          explanation: "Ownership with upside and downside risk — that's Alex, the stock holder.",
        },
        {
          id: "c2",
          prompt: "\"I lent money to a company. They pay me back with fixed interest. More predictable.\"",
          optionA: "Alex (Stock / Owner)",
          optionB: "Jordan (Bond / Lender)",
          correct: "B",
          explanation: "Fixed interest, no ownership — that's the bond lender. Jordan.",
        },
        {
          id: "c3",
          prompt: "\"My money is insured, available anytime, very low return. Safe.\"",
          optionA: "Riley (Savings / Depositor)",
          optionB: "Jordan (Bond / Lender)",
          correct: "A",
          explanation: "Cash in a bank, FDIC-insured, instant access — Riley's savings account.",
        },
      ],
    },
    supportActivities: [],
    options: [],
    explanation: "You remember people. Then you remember the concepts attached to them.",
  },
  check: {
    question: "Which one best describes Alex — the stock owner?",
    type: "multiple",
    options: [
      opt("a", "Lends money and gets fixed interest back", false, "That's Jordan — the bond holder."),
      opt("b", "Holds cash in a bank account", false, "That's Riley — safety first."),
      opt("c", "Owns a piece of a company", true),
      opt("d", "Guarantees a stable return", false, "No one guarantees Alex a return. That's the deal with ownership."),
    ],
    explanation: "Owning a piece of a company is the clearest stock description.",
    reviewPrompt: "asset-type-basics",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 8 — WHY STOCK PRICES REACT TO NEWS
// Screen flow: Predict-Then-Reveal 3 rounds (learn, SIGNATURE) → Framework panel → Check
// Emotional target: Electric. Prediction + reveal = dopamine.
// ─────────────────────────────────────────────────────────────────────────────
const foundations8: AuthoredLessonExperienceV2 = {
  objective: "Teach that price reacts to changing expectations, not just headline words.",
  rewardLine: "You just read the market. That's what analysts do all day.",
  masteryTags: ["expectations-news"],
  learn: {
    title: "BREAKING NEWS",
    visual: "news",
    explanation: "Stock prices react to changing expectations. Good news improves outlook. Bad news weakens it.",
    whatThisMeans: "It's not the word in the headline. It's what changed in the expected future.",
    commonMistake: "A good headline doesn't force a price jump every time.",
    labMoment: "Predict market direction before each headline reveals what actually happened.",
    supportActivities: [],
    panels: [
      {
        id: "predict-reveal",
        title: "BREAKING NEWS",
        copy: "Three headlines. You predict UP, DOWN, or FLAT before seeing what markets did.",
        eyebrow: "★ Signature Moment",
        activityKind: "predict-reveal",
        activityData: {
          rounds: [
            {
              headline: "Apple beats earnings by 20%. Record quarter.",
              direction: "up",
              magnitude: 6.2,
              correctExplanation: "Strong results improved expectations. Buyers moved in.",
              wrongExplanation: "Markets saw better-than-expected results. Expectations shifted upward.",
            },
            {
              headline: "Major product recall announced. 2M units affected.",
              direction: "down",
              magnitude: 8.1,
              correctExplanation: "Bad news changes the picture fast.",
              wrongExplanation: "A recall damages expectations. Sellers moved first.",
            },
            {
              headline: "Company announces new CEO. Markets react with caution.",
              direction: "flat",
              magnitude: 0.3,
              correctExplanation: "Mixed signal. Neither side dominated.",
              wrongExplanation: "Unclear news = unclear pressure. Neither buyers nor sellers won.",
            },
          ],
        },
      },
      {
        id: "framework",
        title: "Markets react to expectations. Not just headlines.",
        copy: "Better-than-expected news → more buyers → price tends to rise.\nWorse-than-expected news → more sellers → price tends to fall.\nUnclear news → mixed signals → no dominant direction.",
        eyebrow: "The pattern",
        noteLabel: "The key",
        note: "It's not the word in the headline. It's what changed in the expected future.",
      },
    ],
  },
  practice: {
    mechanicTitle: "Good news or bad news?",
    mechanicSummary: "Read the headline. Call it before the reveal.",
    prompt: "How does the market read this headline?",
    question: "",
    activityKind: "rapid-fire-streak",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Finish all four headlines",
    activityData: {
      streakLabel: "SIGNAL",
      perfectReward: "You can read the news like a trader.",
      cards: [
        {
          id: "h1",
          prompt: "BREAKING: Sales beat expectations by 18%. Record quarter.",
          optionA: "Good for expectations",
          optionB: "Bad for expectations",
          correct: "A",
          explanation: "Beating expectations improves the market's outlook. Buyers step in.",
        },
        {
          id: "h2",
          prompt: "BREAKING: Product recall — 3 million units pulled from shelves.",
          optionA: "Good for expectations",
          optionB: "Bad for expectations",
          correct: "B",
          explanation: "Recalls damage trust and future revenue expectations. Sellers move first.",
        },
        {
          id: "h3",
          prompt: "BREAKING: Company announces expansion into 3 new markets.",
          optionA: "Good for expectations",
          optionB: "Bad for expectations",
          correct: "A",
          explanation: "New growth moves generally improve the future outlook. Market reads it as positive.",
        },
        {
          id: "h4",
          prompt: "BREAKING: Costs jumped unexpectedly this quarter. Margins compressed.",
          optionA: "Good for expectations",
          optionB: "Bad for expectations",
          correct: "B",
          explanation: "Unexpected cost increases squeeze profits and hurt future expectations.",
        },
      ],
    },
    supportActivities: [],
    options: [],
    explanation: "Stronger-than-expected sales usually improve the market's expectations.",
  },
  check: {
    question: "Why might a stock jump after strong earnings?",
    type: "multiple",
    options: [
      opt("a", "Because all sellers permanently disappeared", false, "Sellers always exist. Results just shifted the balance."),
      opt("b", "Because expectations improved", true),
      opt("c", "Because the company guaranteed future profits", false, "Strong results don't create guarantees — just better expectations."),
      opt("d", "Because dividends automatically went up", false, "Dividends and price movement are separate mechanisms."),
    ],
    explanation: "Better news → better outlook → buyers stepped in.",
    reviewPrompt: "expectations-news",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 9 — WHAT A CAREFUL BEGINNER DOES
// Screen flow: The Trap panel → Sequence builder (practice) → Check
// Emotional target: Earned humility. "I could've made that mistake."
// ─────────────────────────────────────────────────────────────────────────────
const foundations9: AuthoredLessonExperienceV2 = {
  objective: "Build the observation-first habit by making the user make the mistake before being taught.",
  rewardLine: "You didn't fall for it this time.",
  masteryTags: ["beginner-mindset"],
  learn: {
    title: "Quick — what's this stock doing?",
    visual: "checklist",
    explanation: "Good beginners observe before predicting. They zoom out before they act.",
    whatThisMeans: "One clue isn't the whole story. Careful beginners zoom out before they act.",
    commonMistake: "Jumping straight to certainty turns one clue into a fake answer.",
    labMoment: "Build the right order of beginner actions.",
    supportActivities: [],
    panels: [
      {
        id: "the-trap",
        title: "Quick — what's this stock doing?",
        copy: "The chart is going up. Sharply. Looks obvious.\n\n...\n\nWait.\n\nYou only saw the last 10 days.\n\nZoom out. The recent uptick is a tiny blip on a 2-year downtrend.\n\nWhat looked obvious was incomplete.",
        eyebrow: "The trap",
        note: "One clue isn't the whole story. Careful beginners zoom out before they act.",
        noteLabel: "What this means",
      },
    ],
  },
  practice: {
    mechanicTitle: "What does a careful beginner do?",
    mechanicSummary: "Tap the 5 steps in the right order.",
    prompt: "Put the beginner actions in the right order.",
    question: "Which step belongs first for a careful beginner?",
    activityKind: "sequence-lab",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Order all 5 steps first",
    activityData: {
      title: "Careful beginner order",
      steps: [
        { id: "observe", label: "Observe", description: "Look before you predict." },
        { id: "check-chart", label: "Check the chart", description: "See the price behavior first." },
        { id: "check-business", label: "Check the business context", description: "Add the company's story." },
        { id: "ask-changed", label: "Ask what changed", description: "Find the catalyst." },
        { id: "interpretation", label: "Form a careful interpretation", description: "Evidence first, confidence second." },
      ],
      distractors: ["Jump to a prediction", "Claim certainty"],
    },
    supportActivities: [],
    options: [
      opt("a", "Observe", true),
      opt("b", "Jump to a prediction", false, "Prediction comes too early. A careful beginner starts by observing."),
      opt("c", "Claim certainty", false, "Certainty is not the starting point for a careful beginner."),
    ],
    explanation: "Observation is the first move. Every time.",
  },
  check: {
    question: "You see a stock that jumped 15% today. What should a careful beginner do first?",
    type: "multiple",
    options: [
      opt("a", "Immediately buy it", false, "That's the trap. One number isn't the full picture."),
      opt("b", "Immediately sell short", false, "Equally hasty in the other direction."),
      opt("c", "Observe and look for context", true),
      opt("d", "Assume it will keep rising", false, "Past momentum doesn't promise future direction."),
    ],
    explanation: "First look. Then think. Then decide. In that order.",
    reviewPrompt: "beginner-mindset",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LESSON 10 — BOSS: OWNERSHIP WALKTHROUGH
// Screen flow: Intro → Story Branch simulation (6 steps) → Final check
// Signature Moment: Full branching investment story with real consequences
// Boss XP: 20
// ─────────────────────────────────────────────────────────────────────────────
const foundations10: AuthoredLessonExperienceV2 = {
  objective: "Synthesize all Foundations concepts in a branching investment simulation.",
  rewardLine: "Module 1 complete. You understand ownership. Everything else builds on this.",
  masteryTags: [
    "ownership-basics",
    "capital-raising",
    "expectations-news",
    "gain-loss-basics",
    "dividends-vs-price-gain",
  ],
  learn: {
    title: "You are the investor now.",
    visual: "sandbox",
    explanation: "This simulation combines ownership, capital raising, expectations, gain/loss, and dividends in one scenario.",
    whatThisMeans: "You are no longer isolating one concept. You are reading the full sequence.",
    commonMistake: "The biggest mistake is collapsing everything into guaranteed profit.",
    labMoment: "Every decision you make will have visible consequences.",
    supportActivities: [],
    panels: [
      {
        id: "boss-intro",
        title: "You are the investor now.",
        copy: "Not a student. An investor.\n\n3 decisions. Real outcomes.\n\nEvery concept from this module will appear in the simulation.",
        eyebrow: "★ Boss Lesson",
      },
    ],
  },
  practice: {
    mechanicTitle: "Stoked Corp Investment Simulation",
    mechanicSummary: "Walk through a full investment year. Make 3 decisions. See the consequences.",
    prompt: "Enter the simulation.",
    question: "Which summary is best?",
    activityKind: "story-branch",
    useActivityAsPractice: true,
    actionLabel: "See the final check",
    readinessLabel: "Complete the simulation first",
    activityData: {
      company: "STOKED CORP",
      startPrice: 20,
      startCash: 1000,
    },
    supportActivities: [],
    options: [],
    explanation: "The simulation brought together all 5 Foundations concepts in one experience.",
  },
  check: {
    question: "Which summary is the most accurate?",
    type: "multiple",
    options: [
      opt(
        "a",
        "Owning stock means guaranteed profit.",
        false,
        "Stock ownership does not guarantee profit.",
      ),
      opt(
        "b",
        "A stock gives ownership, and returns can come from price changes or dividends.",
        true,
      ),
      opt(
        "c",
        "Stock ownership means you are lending money.",
        false,
        "That confuses stock ownership with lending.",
      ),
      opt(
        "d",
        "Price only moves randomly and never reacts to expectations.",
        false,
        "Markets do react to changing expectations, even though nothing is guaranteed.",
      ),
    ],
    explanation:
      "B is the best summary: ownership, price change, and dividends each play their own role.",
    reviewPrompt: "foundations-boss",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — merge this into authoredLessonExperiences
// ─────────────────────────────────────────────────────────────────────────────
export const foundationsV2LessonExperiences: Record<
  string,
  AuthoredLessonExperienceV2
> = {
  "foundations-1": foundations1,
  "foundations-2": foundations2,
  "foundations-3": foundations3,
  "foundations-4": foundations4,
  "foundations-5": foundations5,
  "foundations-6": foundations6,
  "foundations-7": foundations7,
  "foundations-8": foundations8,
  "foundations-9": foundations9,
  "foundations-10": foundations10,
};
