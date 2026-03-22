import type {
  CheckContent,
  LearnContent,
  LearnPanel,
  PracticeContent,
  PracticeOption,
} from "../lib/course-data";

export type AuthoredLessonExperience = {
  objective: string;
  rewardLine: string;
  masteryTags: string[];
  learn: LearnContent;
  practice: PracticeContent;
  check: CheckContent;
};

function choice(
  id: string,
  text: string,
  correct: boolean,
  reviewPrompt: string,
  feedback?: string,
): PracticeOption {
  return { id, text, correct, reviewPrompt, feedback };
}

function learnPanel(
  id: string,
  title: string,
  copy: string,
  config: Omit<LearnPanel, "id" | "title" | "copy"> = {},
): LearnPanel {
  return {
    id,
    title,
    copy,
    ...config,
  };
}

export const authoredLessonExperiences: Record<string, AuthoredLessonExperience> = {
  "foundations-1": {
    objective: "Teach that owning a stock means owning a small piece of a company.",
    rewardLine: "You now know that buying stock means owning part of a company.",
    masteryTags: ["ownership-basics"],
    learn: {
      title: "You can own a piece of a company",
      visual: "ownership",
      explanation:
        "A stock means ownership. In this example company, your slice depends on how many of the 1,000 total shares you own.",
      whatThisMeans:
        "A share is ownership, not a salary or a loan.",
      commonMistake:
        "Owning stock is different from lending money or earning wages.",
      labMoment:
        "Learn one ownership idea at a time.",
      supportActivities: [
        "Spot what ownership sounds like.",
        "See the slice change in one example company.",
        "Notice that bigger is still not the whole company.",
      ],
    },
    practice: {
      mechanicTitle: "Ownership or not?",
      mechanicSummary:
        "Sort each statement into ownership or not ownership.",
      prompt: "Place each statement where it belongs.",
      question: "",
      activityKind: "bucket-sort",
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Sort every statement first",
      activityData: {
        buckets: ["Ownership", "Not ownership"],
        cards: [
          {
            id: "own-piece",
            label: "You own a small piece of the business.",
            description:
              "Buying shares gives you an ownership claim on part of the company.",
            target: "Ownership",
          },
          {
            id: "salary",
            label: "The company owes you wages.",
            description:
              "Wages come from a job, not from owning stock.",
            target: "Not ownership",
          },
          {
            id: "loan",
            label: "You lent money and expect repayment.",
            description:
              "That is lending, not ownership.",
            target: "Not ownership",
          },
          {
            id: "bought-shares",
            label: "You bought shares in the company.",
            description: "Buying shares means buying an ownership slice.",
            target: "Ownership",
          },
        ],
      },
      supportActivities: [
        "Sort ownership statements from non-ownership statements.",
        "Use relationship language instead of percentage language.",
        "Reinforce what stock ownership actually means.",
      ],
      options: [],
      explanation:
        "Right. Ownership means you own part of the company.",
    },
    check: {
      question: "What does buying stock mainly give you?",
      type: "multiple",
      options: [
        choice(
          "a",
          "Ownership in the company",
          true,
          "",
        ),
        choice(
          "b",
          "A fixed interest payment",
          false,
          "ownership-basics",
          "That sounds more like a bond or loan idea. Stock is ownership, not fixed interest.",
        ),
        choice(
          "c",
          "A guaranteed paycheck",
          false,
          "ownership-basics",
          "Stock ownership does not mean you work for the company or get paid a salary.",
        ),
        choice(
          "d",
          "Control of every business decision",
          false,
          "ownership-basics",
          "Owning shares does not mean total control of the business.",
        ),
      ],
      explanation: "Buying stock gives you ownership in the company.",
      reviewPrompt: "ownership-basics",
    },
  },
  "foundations-2": {
    objective: "Teach that companies sell stock to raise money.",
    rewardLine: "You now know why companies sell shares.",
    masteryTags: ["capital-raising"],
    learn: {
      title: "Why would a company sell shares?",
      visual: "funding",
      explanation:
        "Companies may sell stock to raise capital. That money can help them grow, invest, and expand.",
      whatThisMeans:
        "Selling stock can fund new products, hiring, expansion, or broader growth. It does not guarantee success.",
      commonMistake:
        "Issuing shares does not magically remove risk or guarantee the stock goes up. It is a financing choice, not a promise.",
      labMoment:
        "Sort possible reasons into real financing logic versus false promises.",
      supportActivities: [
        "Compare growth uses of capital with unrealistic promises.",
        "Look for financing logic rather than guaranteed outcomes.",
        "Notice that raising money is about resources, not certainty.",
      ],
    },
    practice: {
      mechanicTitle: "Company funding board",
      mechanicSummary:
        "Sort reasons a company might sell shares into the right bucket and watch the growth board fill in.",
      prompt: "Why would a company sell shares?",
      question: "Which reason belongs in the real financing bucket?",
      activityKind: "bucket-sort",
      activityData: {
        title: "Why sell stock?",
        buckets: ["Real reasons to sell stock", "Not real reasons"],
        cards: [
          {
            id: "expand",
            label: "Expand operations",
            description: "Open new locations, hire more people, or build capacity.",
            target: "Real reasons to sell stock",
          },
          {
            id: "raise-money",
            label: "Raise money",
            description: "Bring in capital the company can put to work.",
            target: "Real reasons to sell stock",
          },
          {
            id: "fund-growth",
            label: "Fund growth",
            description: "Support bigger plans without pretending risk disappears.",
            target: "Real reasons to sell stock",
          },
          {
            id: "guarantee-profit",
            label: "Guarantee profit",
            description: "A promise like this is not real financing logic.",
            target: "Not real reasons",
          },
          {
            id: "buy-every-competitor",
            label: "Buy every competitor",
            description: "That is not a realistic built-in reason to issue shares.",
            target: "Not real reasons",
          },
        ],
      },
      supportActivities: [
        "Sort realistic reasons into the financing bucket.",
        "Leave false promises out of the real-reason bucket.",
        "Use the board to connect capital with growth.",
      ],
      options: [
        choice(
          "a",
          "guarantee profit",
          false,
          "capital-raising",
          "That is a false promise. Selling stock raises capital, but it does not guarantee results.",
        ),
        choice(
          "b",
          "raise money for growth",
          true,
          "",
        ),
        choice(
          "c",
          "avoid ever reporting results",
          false,
          "capital-raising",
          "Selling shares does not remove the need to report business results.",
        ),
      ],
      explanation:
        "Correct. Companies often issue shares to raise money for growth, investment, and expansion.",
    },
    check: {
      question: "Which is the strongest reason a company might issue shares?",
      type: "multiple",
      options: [
        choice(
          "a",
          "To magically eliminate risk",
          false,
          "capital-raising",
          "That is a false promise, not a real financing reason.",
        ),
        choice(
          "b",
          "To raise money for growth",
          true,
          "",
        ),
        choice(
          "c",
          "To guarantee the stock goes up",
          false,
          "capital-raising",
          "Issuing shares does not guarantee the stock rises.",
        ),
        choice(
          "d",
          "To avoid ever reporting results",
          false,
          "capital-raising",
          "Selling stock does not remove reporting responsibilities.",
        ),
      ],
      explanation:
        "B is correct because companies often issue stock to raise capital for growth.",
      reviewPrompt: "capital-raising",
    },
  },
  "foundations-3": {
    objective: "Teach that stock markets match buyers and sellers.",
    rewardLine: "You understand the basic market match.",
    masteryTags: ["buyer-seller-mechanics"],
    learn: {
      title: "What happens if more people want to buy than sell?",
      visual: "exchange",
      explanation:
        "Markets match buyers and sellers. When buying pressure is stronger, price may rise. When selling pressure is stronger, price may fall.",
      whatThisMeans:
        "The market is a matching system. Price moves when one side is more eager than the other.",
      commonMistake:
        "A stock market is not a fixed-price shelf. Prices react when buyer and seller pressure becomes unbalanced.",
      labMoment:
        "Tilt the pressure bar and compare eager buyers with heavy sellers.",
      supportActivities: [
        "Move buyer and seller pressure.",
        "Compare balanced interest with one-sided pressure.",
        "Notice how price pressure changes with demand.",
      ],
    },
    practice: {
      mechanicTitle: "Buyer vs seller pressure",
      mechanicSummary:
        "Move the pressure sliders, watch the bar tilt, and then tap the scenario with stronger buying pressure.",
      prompt: "Tap the scenario with stronger buying pressure.",
      question: "Tap the scenario with stronger buying pressure.",
      activityKind: "news-chart",
      activityData: {
        variant: "pressure-balance",
        scenarios: [
          "Many eager buyers, few sellers",
          "Many sellers, weak demand",
          "Equal interest on both sides",
        ],
        headlines: [
          "Demand rises fast",
          "Sellers take control",
          "Balance holds",
        ],
      },
      supportActivities: [
        "Move buying and selling pressure.",
        "Watch the balance shift.",
        "Choose the strongest buying-pressure scenario.",
      ],
      options: [
        choice(
          "a",
          "Many eager buyers, few sellers",
          true,
          "",
        ),
        choice(
          "b",
          "Many sellers, weak demand",
          false,
          "buyer-seller-mechanics",
          "That is stronger selling pressure, not stronger buying pressure.",
        ),
        choice(
          "c",
          "Equal interest on both sides",
          false,
          "buyer-seller-mechanics",
          "Balanced interest does not create the strongest upward pressure.",
        ),
      ],
      explanation:
        "Right. When buyers are eager and sellers are limited, upward pressure gets stronger.",
    },
    check: {
      question: "Which situation usually creates upward price pressure?",
      type: "multiple",
      options: [
        choice(
          "a",
          "More sellers than buyers",
          false,
          "buyer-seller-mechanics",
          "More sellers than buyers usually adds downward, not upward, pressure.",
        ),
        choice(
          "b",
          "More buyers than sellers",
          true,
          "",
        ),
        choice(
          "c",
          "No one trading",
          false,
          "buyer-seller-mechanics",
          "No trading does not create upward price pressure.",
        ),
        choice(
          "d",
          "Fixed guaranteed price",
          false,
          "buyer-seller-mechanics",
          "Stock prices are not guaranteed or fixed that way in an open market.",
        ),
      ],
      explanation:
        "B is correct because stronger demand can push price up.",
      reviewPrompt: "buyer-seller-mechanics",
    },
  },
  "foundations-4": {
    objective: "Connect demand imbalance to price movement.",
    rewardLine: "You can now connect demand pressure to price direction.",
    masteryTags: ["price-pressure"],
    learn: {
      title: "Push the market toward buyers or sellers",
      visual: "news",
      explanation:
        "More buying interest can push price upward. More selling interest can push price downward. Sometimes the picture is mixed.",
      whatThisMeans:
        "Price pressure comes from imbalance. Stronger demand and limited supply usually lean upward. Heavy selling can lean downward.",
      commonMistake:
        "Not every move is clear. Mixed pressure can leave price roughly unchanged instead of forcing a clean up or down story.",
      labMoment:
        "Use the balance bar and then classify what each scenario likely means.",
      supportActivities: [
        "Move the handle toward buyers or sellers.",
        "Watch mixed pressure settle near the middle.",
        "Classify scenarios as up, down, or unclear.",
      ],
    },
    practice: {
      mechanicTitle: "Push-pull balance bar",
      mechanicSummary:
        "Move the handle toward buyers or sellers, then classify the market pressure behind three quick scenarios.",
      prompt: "Classify each scenario by likely price direction.",
      question: "If demand jumps while supply stays limited, what is the cleanest read?",
      activityKind: "news-chart",
      activityData: {
        variant: "classification-board",
        classifications: [
          { scenario: "Strong demand after good news", result: "Up" },
          { scenario: "Heavy selling after bad results", result: "Down" },
          { scenario: "Mixed reaction, little change", result: "Unclear" },
        ],
      },
      supportActivities: [
        "Push the handle toward buyers or sellers.",
        "Read each scenario once before classifying it.",
        "Leave mixed evidence in the unclear bucket.",
      ],
      options: [
        choice(
          "a",
          "Price pressure upward",
          true,
          "",
        ),
        choice(
          "b",
          "Price guaranteed flat",
          false,
          "price-pressure",
          "A demand jump with limited supply does not imply a guaranteed flat price.",
        ),
        choice(
          "c",
          "Company ownership disappears",
          false,
          "price-pressure",
          "Price pressure changes trading conditions, not the existence of ownership.",
        ),
        choice(
          "d",
          "Revenue becomes irrelevant",
          false,
          "price-pressure",
          "Price pressure and business fundamentals are different ideas.",
        ),
      ],
      explanation:
        "Correct. When demand jumps and supply stays limited, pressure leans upward.",
    },
    check: {
      question: "If demand jumps while supply stays limited, what is most likely?",
      type: "multiple",
      options: [
        choice("a", "Price pressure upward", true, ""),
        choice(
          "b",
          "Price guaranteed flat",
          false,
          "price-pressure",
          "That ignores the imbalance. Stronger demand with limited supply usually leans upward.",
        ),
        choice(
          "c",
          "Company ownership disappears",
          false,
          "price-pressure",
          "Ownership does not disappear because demand changes.",
        ),
        choice(
          "d",
          "Revenue becomes irrelevant",
          false,
          "price-pressure",
          "Demand pressure affects price, but it does not erase business context.",
        ),
      ],
      explanation:
        "A is correct. Stronger demand with limited supply usually creates upward pressure.",
      reviewPrompt: "price-pressure",
    },
  },
  "foundations-5": {
    objective: "Teach simple return logic.",
    rewardLine: "You understand basic return outcomes.",
    masteryTags: ["gain-loss-basics"],
    learn: {
      title: "Buy low? Sell high? Test it.",
      visual: "returns",
      explanation:
        "If you sell above your buy price, that is a gain. If you sell below your buy price, that is a loss. The same price is break-even.",
      whatThisMeans:
        "Return starts with comparing where you bought and where you sold. You do not need advanced math to see gain, loss, or flat.",
      commonMistake:
        "A dividend is not the same thing as a gain from selling. This lesson is only about the price difference between buy and sell.",
      labMoment:
        "Move the buy and sell markers on the price bar and watch the outcome badge flip.",
      supportActivities: [
        "Move the buy marker.",
        "Move the sell marker.",
        "Watch the badge switch between gain, loss, and break-even.",
      ],
    },
    practice: {
      mechanicTitle: "Sort the outcomes",
      mechanicSummary:
        "Sort each buy-and-sell scenario into gain, loss, or break-even.",
      prompt: "Place each scenario in the right outcome bucket.",
      question: "",
      activityKind: "bucket-sort",
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Sort every scenario first",
      activityData: {
        buckets: ["Gain", "Loss", "Break-even"],
        bucketStyles: {
          Gain: "gain",
          Loss: "loss",
          "Break-even": "neutral",
        },
        cards: [
          {
            id: "g-20-27",
            label: "Buy at 20, sell at 27",
            description: "+7",
            target: "Gain",
          },
          {
            id: "b-20-20",
            label: "Buy at 20, sell at 20",
            description: "0",
            target: "Break-even",
          },
          {
            id: "l-20-16",
            label: "Buy at 20, sell at 16",
            description: "-4",
            target: "Loss",
          },
          {
            id: "l-15-12",
            label: "Buy at 15, sell at 12",
            description: "-3",
            target: "Loss",
          },
          {
            id: "g-30-35",
            label: "Buy at 30, sell at 35",
            description: "+5",
            target: "Gain",
          },
          {
            id: "b-40-40",
            label: "Buy at 40, sell at 40",
            description: "0",
            target: "Break-even",
          },
        ],
      },
      supportActivities: [
        "Compare sell price with buy price.",
        "Sort gains, losses, and break-even cases.",
        "Use the amount badge as a clue.",
      ],
      options: [],
      explanation:
        "Correct. Selling above your buy price creates a gain.",
    },
    check: {
      question: "Quick outcome check",
      type: "multiple",
      variant: "rapid-fire",
      rapidFireCases: [
        {
          id: "loss-case",
          prompt: "Buy at 30, sell at 24",
          options: [
            choice("a", "Gain", false, "gain-loss-basics", "Selling below your buy price is not a gain."),
            choice("b", "Loss", true, ""),
            choice("c", "Break-even", false, "gain-loss-basics", "Break-even means the prices match."),
          ],
          explanation: "24 is below 30, so this is a loss.",
          reviewPrompt: "gain-loss-basics",
        },
        {
          id: "flat-case",
          prompt: "Buy at 18, sell at 18",
          options: [
            choice("a", "Break-even", true, ""),
            choice("b", "Loss", false, "gain-loss-basics", "A loss would mean selling below 18."),
            choice("c", "Gain", false, "gain-loss-basics", "A gain would mean selling above 18."),
          ],
          explanation: "Same buy and sell price means break-even.",
          reviewPrompt: "gain-loss-basics",
        },
        {
          id: "gain-case",
          prompt: "Buy at 12, sell at 17",
          options: [
            choice("a", "Loss", false, "gain-loss-basics", "Selling above your buy price is not a loss."),
            choice("b", "Break-even", false, "gain-loss-basics", "Break-even means the prices match."),
            choice("c", "Gain", true, ""),
          ],
          explanation: "17 is above 12, so this is a gain.",
          reviewPrompt: "gain-loss-basics",
        },
      ],
      options: [],
      explanation: "Compare the sell price with the buy price and the outcome becomes clear.",
      reviewPrompt: "gain-loss-basics",
    },
  },
  "foundations-6": {
    objective: "Distinguish dividends from price appreciation.",
    rewardLine: "You can now separate dividends from price gains.",
    masteryTags: ["dividends-vs-price-gain"],
    learn: {
      title: "Some returns come from price, some from cash",
      visual: "returns",
      explanation:
        "Price gain comes from selling at a higher price. A dividend is cash paid to shareholders. They are different types of return.",
      whatThisMeans:
        "One return comes from the market price changing. The other comes from cash the company pays out.",
      commonMistake:
        "Beginners often blur dividends and price gains together. They may both help shareholders, but they are not the same mechanism.",
      labMoment:
        "Drop dividend coins into the wallet and compare that with the separate price-gain meter.",
      supportActivities: [
        "Move cash dividends into the wallet.",
        "Compare a sale profit with a dividend payment.",
        "Notice that one comes from the company and the other comes from price change.",
      ],
    },
    practice: {
      mechanicTitle: "Dividend wallet",
      mechanicSummary:
        "Drop dividend coins into the wallet and compare them with a separate price-gain track.",
      prompt: "Match each benefit to the right type of return.",
      question: "Which statement best describes a price gain?",
      activityKind: "return-builder",
      activityData: {
        variant: "dividend-vs-gain",
        matches: [
          { clue: "Cash payment from the company", answer: "Dividend" },
          { clue: "You sold for more than you paid", answer: "Price gain" },
        ],
      },
      supportActivities: [
        "Watch the wallet fill with dividend coins.",
        "Keep the price-gain track separate.",
        "Match each clue to the right return type.",
      ],
      options: [
        choice(
          "a",
          "You sold for more than you paid",
          true,
          "",
        ),
        choice(
          "b",
          "Cash paid to shareholders",
          false,
          "dividends-vs-price-gain",
          "That describes a dividend, not a price gain.",
        ),
        choice(
          "c",
          "A guaranteed doubling of investment",
          false,
          "dividends-vs-price-gain",
          "Neither dividends nor price gains guarantee a doubling.",
        ),
      ],
      explanation:
        "Right. Price gain comes from selling at a higher price than you paid.",
    },
    check: {
      question: "Which statement best describes a dividend?",
      type: "multiple",
      options: [
        choice("a", "Cash paid to shareholders", true, ""),
        choice(
          "b",
          "The stock price going higher",
          false,
          "dividends-vs-price-gain",
          "That is price appreciation, not a dividend.",
        ),
        choice(
          "c",
          "A guaranteed doubling of investment",
          false,
          "dividends-vs-price-gain",
          "Dividends are not guaranteed doublings.",
        ),
        choice(
          "d",
          "A trading fee",
          false,
          "dividends-vs-price-gain",
          "A dividend is a shareholder payment, not a fee.",
        ),
      ],
      explanation: "A dividend is cash paid to shareholders.",
      reviewPrompt: "dividends-vs-price-gain",
    },
  },
  "foundations-7": {
    objective: "Differentiate stocks from other common assets.",
    rewardLine: "You can now separate stocks from bonds and savings.",
    masteryTags: ["asset-type-basics"],
    learn: {
      title: "Not every money product is the same",
      visual: "ownership",
      explanation:
        "Stocks are ownership. Bonds are lending. Savings are stored cash with a bank-style safety profile.",
      whatThisMeans:
        "Different products answer different needs. A stock gives you business ownership, not fixed interest or a deposit balance.",
      commonMistake:
        "A stock is not the same as a bond or savings account just because all three can sit inside a financial life.",
      labMoment:
        "Sort product descriptions into stock, bond, and savings buckets.",
      supportActivities: [
        "Group ownership language together.",
        "Separate lending language from savings language.",
        "Use the definition flips to confirm each bucket.",
      ],
    },
    practice: {
      mechanicTitle: "Asset sort",
      mechanicSummary:
        "Sort descriptions into stock, bond, and savings, then use the flip definitions to check your intuition.",
      prompt: "Sort these cards into stock, bond, or savings.",
      question: "Which description belongs most clearly to a stock?",
      activityKind: "bucket-sort",
      activityData: {
        title: "Three asset types",
        buckets: ["Stock", "Bond", "Savings"],
        cards: [
          { id: "ownership-company", label: "ownership in a company", target: "Stock" },
          { id: "share-upside", label: "share of business upside", target: "Stock" },
          { id: "fixed-interest", label: "fixed interest payment", target: "Bond" },
          { id: "lender-relationship", label: "lender relationship", target: "Bond" },
          { id: "cash-account", label: "cash in savings account", target: "Savings" },
        ],
      },
      supportActivities: [
        "Place ownership descriptions into Stock.",
        "Put lending descriptions into Bond.",
        "Keep cash-account language in Savings.",
      ],
      options: [
        choice(
          "a",
          "You lend money for fixed interest",
          false,
          "asset-type-basics",
          "That is bond language, not stock language.",
        ),
        choice(
          "b",
          "You hold cash in a deposit account",
          false,
          "asset-type-basics",
          "That describes savings, not stock ownership.",
        ),
        choice(
          "c",
          "You own a piece of a company",
          true,
          "",
        ),
        choice(
          "d",
          "You guarantee stable returns",
          false,
          "asset-type-basics",
          "Stocks do not guarantee stable returns.",
        ),
      ],
      explanation:
        "Correct. Stocks represent ownership in a company.",
    },
    check: {
      question: "Which description belongs most clearly to a stock?",
      type: "multiple",
      options: [
        choice("a", "You lend money for fixed interest", false, "asset-type-basics", "That is bond language."),
        choice("b", "You hold cash in a deposit account", false, "asset-type-basics", "That describes savings."),
        choice("c", "You own a piece of a company", true, ""),
        choice("d", "You guarantee stable returns", false, "asset-type-basics", "Stocks do not guarantee stable returns."),
      ],
      explanation: "Owning a piece of a company is the clearest stock description.",
      reviewPrompt: "asset-type-basics",
    },
  },
  "foundations-8": {
    objective: "Teach that prices react to changing expectations.",
    rewardLine: "You understand that markets react to changing expectations.",
    masteryTags: ["expectations-news"],
    learn: {
      title: "Tap each headline and watch expectations change",
      visual: "news",
      explanation:
        "Stock prices react to changing expectations. Good news can improve the outlook. Bad news can weaken it. Mixed news can create uncertain reactions.",
      whatThisMeans:
        "Markets care about what changed in the expected future, not only about the words in a headline by themselves.",
      commonMistake:
        "A good headline does not force a price jump every time, and a bad headline does not explain every move by itself.",
      labMoment:
        "Tap headlines and watch an expectation meter climb, dip, or wobble.",
      supportActivities: [
        "Tap each headline once.",
        "Watch the expectation meter move.",
        "Sort headlines into good, bad, or mixed.",
      ],
    },
    practice: {
      mechanicTitle: "Expectation meter",
      mechanicSummary:
        "Tap headlines and compare how each one changes the outlook before you sort them.",
      prompt: "Sort the headlines into good, bad, or mixed.",
      question: "Which headline most clearly improves expectations?",
      activityKind: "news-chart",
      activityData: {
        variant: "expectation-meter",
        headlines: [
          "Sales beat expectations",
          "Product recall announced",
          "New market expansion",
          "Costs jumped unexpectedly",
        ],
      },
      supportActivities: [
        "Tap each headline to move the meter.",
        "Sort the headline after you observe the reaction.",
        "Look for expectation change, not certainty.",
      ],
      options: [
        choice("a", "Sales beat expectations", true, ""),
        choice(
          "b",
          "Product recall announced",
          false,
          "expectations-news",
          "A recall usually hurts expectations rather than improving them.",
        ),
        choice(
          "c",
          "Costs jumped unexpectedly",
          false,
          "expectations-news",
          "Unexpectedly higher costs usually weaken the outlook.",
        ),
      ],
      explanation:
        "Right. Stronger-than-expected sales usually improve the market’s expectations.",
    },
    check: {
      question: "Why can a stock jump after strong results?",
      type: "multiple",
      options: [
        choice("a", "Because expectations improved", true, ""),
        choice(
          "b",
          "Because price must always rise after earnings",
          false,
          "expectations-news",
          "Strong results can help, but the price is not forced to rise every time.",
        ),
        choice(
          "c",
          "Because all sellers vanish forever",
          false,
          "expectations-news",
          "Markets do not work that way. Sellers can still appear after strong results.",
        ),
        choice(
          "d",
          "Because dividends disappeared",
          false,
          "expectations-news",
          "That does not explain a jump after strong results.",
        ),
      ],
      explanation: "A is correct because stronger results can improve expectations.",
      reviewPrompt: "expectations-news",
    },
  },
  "foundations-9": {
    objective: "Teach careful beginner behavior.",
    rewardLine: "You’ve built a careful beginner mindset.",
    masteryTags: ["beginner-mindset"],
    learn: {
      title: "What should a beginner do first?",
      visual: "checklist",
      explanation:
        "Good beginners observe before predicting. They separate evidence from confidence and avoid acting like one clue explains everything.",
      whatThisMeans:
        "A careful beginner checks the chart, looks at business context, asks what changed, and only then forms a cautious interpretation.",
      commonMistake:
        "Jumping straight to certainty turns one clue into a fake answer. Good analysis starts with observation.",
      labMoment:
        "Build the order of actions a careful beginner should follow.",
      supportActivities: [
        "Put observation first.",
        "Keep prediction later.",
        "Choose the careful interpretation over the careless one.",
      ],
    },
    practice: {
      mechanicTitle: "Beginner sequence",
      mechanicSummary:
        "Build the right order for a beginner and compare careful versus careless interpretation cards.",
      prompt: "Put the beginner actions in the right order.",
      question: "Which step belongs first for a careful beginner?",
      activityKind: "sequence-lab",
      activityData: {
        title: "Careful beginner order",
        steps: [
          {
            id: "observe",
            label: "Observe",
            description: "Look before you predict.",
          },
          {
            id: "check-chart",
            label: "Check the chart",
            description: "See the price behavior first.",
          },
          {
            id: "check-business",
            label: "Check the business context",
            description: "Add the company story next.",
          },
          {
            id: "ask-what-changed",
            label: "Ask what changed",
            description: "Look for the catalyst or shift in expectations.",
          },
          {
            id: "careful-interpretation",
            label: "Form a careful interpretation",
            description: "Use evidence before confidence.",
          },
        ],
        distractors: ["Jump to a prediction", "Claim certainty"],
      },
      supportActivities: [
        "Tap the steps in order.",
        "Leave prediction and certainty out of the early sequence.",
        "Choose careful language over careless language.",
      ],
      options: [
        choice("a", "Observe", true, ""),
        choice(
          "b",
          "Jump to a prediction",
          false,
          "beginner-mindset",
          "Prediction comes too early there. A careful beginner starts by observing.",
        ),
        choice(
          "c",
          "Claim certainty",
          false,
          "beginner-mindset",
          "Certainty is not the starting point for a careful beginner.",
        ),
      ],
      explanation:
        "Right. Observation is the first move in a careful beginner process.",
    },
    check: {
      question: "Which mindset is better for a beginner?",
      type: "multiple",
      options: [
        choice(
          "a",
          "One signal tells me everything.",
          false,
          "beginner-mindset",
          "That mindset is overconfident and ignores context.",
        ),
        choice(
          "b",
          "I should observe first and stay careful.",
          true,
          "",
        ),
        choice(
          "c",
          "I already know the future.",
          false,
          "beginner-mindset",
          "That mindset skips evidence and acts like uncertainty does not exist.",
        ),
        choice(
          "d",
          "Every price move has one obvious cause.",
          false,
          "beginner-mindset",
          "Markets are more complex than that. A careful beginner avoids overclaiming.",
        ),
      ],
      explanation:
        "B is the better beginner mindset because it starts with observation and caution.",
      reviewPrompt: "beginner-mindset",
    },
  },
  "foundations-10": {
    objective: "Combine module 1 concepts in one applied scenario.",
    rewardLine: "Module 1 logic is now locked in.",
    masteryTags: ["ownership-basics", "capital-raising", "expectations-news", "gain-loss-basics"],
    learn: {
      title: "Ownership walkthrough",
      visual: "sandbox",
      explanation:
        "This checkpoint combines ownership, capital raising, expectations, price outcomes, and dividends in one short scenario.",
      whatThisMeans:
        "You are no longer isolating one concept. You are reading the sequence from company action to market reaction to return type.",
      commonMistake:
        "The biggest mistake is collapsing everything into guaranteed profit. Ownership still carries uncertainty, and returns can come from different sources.",
      labMoment:
        "Run the scenario once, then match the cause, the market reaction, and the outcome type.",
      supportActivities: [
        "Buy shares in the mock company.",
        "Watch the company announce a growth plan.",
        "Sort each part of the story into the right concept bucket.",
      ],
    },
    practice: {
      mechanicTitle: "Guided ownership scenario",
      mechanicSummary:
        "Walk through a six-step story and classify each part before the final summary check.",
      prompt: "Use the scenario to match cause, reaction, and return type.",
      question: "The company announces a growth plan. Which concept does that most directly connect to first?",
      activityKind: "sequence-lab",
      activityData: {
        title: "Ownership walkthrough",
        steps: [
          {
            id: "buy-shares",
            label: "Buy shares in the mock company",
            description: "Start with the ownership step.",
          },
          {
            id: "growth-plan",
            label: "Company announces growth plan",
            description: "Notice the business action before the market response.",
          },
          {
            id: "concept-match",
            label: "Match the concept",
            description: "Sort the story into ownership, capital raising, expectations, or dividends.",
          },
          {
            id: "outcome-classify",
            label: "Classify the return outcome",
            description: "Separate price gain, dividend, break-even, and loss.",
          },
          {
            id: "logic-sequence",
            label: "Sequence the logic",
            description: "Company action first, market reaction second.",
          },
        ],
        matches: [
          "capital raising",
          "expectations",
          "dividend",
          "price gain",
        ],
      },
      supportActivities: [
        "Run through the scenario once in order.",
        "Separate company action from price outcome.",
        "Save the full summary for the final check.",
      ],
      options: [
        choice(
          "a",
          "Ownership",
          false,
          "capital-raising",
          "The growth plan points first to why a company raises money and how expectations can change, not just to ownership itself.",
        ),
        choice(
          "b",
          "Capital raising",
          true,
          "",
        ),
        choice(
          "c",
          "Guaranteed dividend",
          false,
          "dividends-vs-price-gain",
          "A growth plan does not automatically mean a dividend payment.",
        ),
        choice(
          "d",
          "Guaranteed profit",
          false,
          "beginner-mindset",
          "Nothing in the scenario guarantees profit.",
        ),
      ],
      explanation:
        "Correct. The growth plan connects first to capital raising and then to changing expectations.",
    },
    check: {
      question: "Which summary is best?",
      type: "multiple",
      options: [
        choice(
          "a",
          "Owning stock means guaranteed profit.",
          false,
          "beginner-mindset",
          "Stock ownership does not guarantee profit.",
        ),
        choice(
          "b",
          "A stock gives ownership, and returns can come from price changes or dividends.",
          true,
          "",
        ),
        choice(
          "c",
          "Stock ownership means you are lending money.",
          false,
          "ownership-basics",
          "That confuses stock ownership with lending.",
        ),
        choice(
          "d",
          "Price only moves randomly and never reacts to expectations.",
          false,
          "expectations-news",
          "Markets do react to changing expectations, even though nothing is guaranteed.",
        ),
      ],
      explanation:
        "B is the best summary because it keeps ownership, price change, and dividends in the right roles.",
      reviewPrompt: "foundations-boss",
    },
  },
  "chart-basics-1": {
    objective: "Teach that a chart shows price over time.",
    rewardLine: "You know what a chart mainly shows.",
    masteryTags: ["chart-price-time"],
    learn: {
      title: "Tap the part that shows time",
      visual: "timeline",
      explanation:
        "Charts show price over time. Time usually runs left to right, and price is shown vertically.",
      whatThisMeans:
        "If you can find time and price, you can start reading a chart the right way.",
      commonMistake:
        "A chart does not show a guaranteed future. It shows how price moved through time.",
      labMoment:
        "Tap the axes, then place Time and Price in the right spots.",
      supportActivities: [
        "Find the x-axis.",
        "Find the y-axis.",
        "Attach the right label to each axis.",
      ],
    },
    practice: {
      mechanicTitle: "Axis labels",
      mechanicSummary:
        "Tap the chart frame and place the Time and Price labels onto the right axes.",
      prompt: "Place the labels onto the chart.",
      question: "",
      activityKind: "chart-lab",
      activityData: {
        variant: "axes",
        labels: [
          { id: "time", label: "Time", target: "x-axis" },
          { id: "price", label: "Price", target: "y-axis" },
        ],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Finish mapping the axes first",
      supportActivities: [
        "Tap the horizontal axis for time.",
        "Tap the vertical axis for price.",
        "Drop the labels after you identify each axis.",
      ],
      options: [],
      explanation:
        "Correct. A stock chart mainly shows price over time.",
    },
    check: {
      question: "What does a stock chart mainly show?",
      type: "multiple",
      options: [
        choice("a", "Price over time", true, ""),
        choice("b", "Guaranteed future price", false, "chart-price-time", "Charts do not guarantee future prices."),
        choice("c", "Company mission statement", false, "chart-price-time", "That is not what the chart is for."),
        choice("d", "Employee count only", false, "chart-price-time", "That is not the chart’s main purpose."),
      ],
      explanation: "A chart mainly shows price over time.",
      reviewPrompt: "chart-price-time",
    },
  },
  "chart-basics-2": {
    objective: "Teach chronology on charts.",
    rewardLine: "You can now read chart time in the right direction.",
    masteryTags: ["chart-chronology"],
    learn: {
      title: "Put these chart snapshots in time order",
      visual: "timeline",
      explanation:
        "On most stock charts, the left side is earlier and the right side is later.",
      whatThisMeans:
        "If you read time backward, you misread the chart. Chronology matters before interpretation.",
      commonMistake:
        "Beginners sometimes forget that the most recent point is usually on the right edge.",
      labMoment:
        "Reorder chart snapshots from earliest to latest, then scrub the chart forward.",
      supportActivities: [
        "Start with the leftmost moment.",
        "Move toward the right for later points.",
        "Use the scrubber to confirm the order.",
      ],
    },
    practice: {
      mechanicTitle: "Chart chronology",
      mechanicSummary:
        "Tap the chart points and confirm which part of the line is earlier, middle, and latest.",
      prompt: "Tap the chart and compare earlier versus later points.",
      question: "",
      activityKind: "chart-lab",
      activityData: {
        variant: "point-compare",
        chartPoints: [28, 38, 34, 46, 58, 52, 70, 82],
        markers: [
          {
            id: "earlier-point",
            badge: "A",
            label: "Earlier point",
            index: 1,
            tone: "secondary",
            timeLabel: "Earlier in time",
            priceLabel: "Left side of the chart",
            detail: "This point appears earlier because it sits farther left.",
            support:
              "Charts usually move from left to right. Earlier points appear first, then later points extend farther right.",
          },
          {
            id: "middle-point",
            badge: "B",
            label: "Middle point",
            index: 4,
            tone: "primary",
            timeLabel: "Middle of the move",
            priceLabel: "Not the newest point",
            detail: "This point has more history than the early one, but the chart still continues after it.",
            support:
              "A middle point helps you see that time keeps flowing across the screen before the chart reaches the newest edge.",
          },
          {
            id: "latest-point",
            badge: "C",
            label: "Latest point",
            index: 7,
            tone: "primary",
            timeLabel: "Latest visible point",
            priceLabel: "Right edge of the chart",
            detail: "This is the newest visible point because the line has extended farthest to the right.",
            support:
              "Later time usually appears on the right edge. That is where the newest visible point lives on most simple stock charts.",
          },
        ],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Inspect the chart points first",
      supportActivities: [
        "Tap the earlier point.",
        "Compare it with the middle point.",
        "Finish on the latest point at the right edge.",
      ],
      options: [],
      explanation: "Right. Later points usually appear on the right side of the chart.",
    },
    check: {
      question: "On most stock charts, where is the most recent point?",
      type: "multiple",
      options: [
        choice("a", "Left side", false, "chart-chronology", "Left is earlier."),
        choice("b", "Right side", true, ""),
        choice("c", "Top edge", false, "chart-chronology", "Top is price direction, not chronology."),
        choice("d", "Bottom edge", false, "chart-chronology", "Bottom is not where time becomes most recent."),
      ],
      explanation: "The most recent point is usually on the right side.",
      reviewPrompt: "chart-chronology",
    },
  },
  "chart-basics-3": {
    objective: "Teach vertical price reading.",
    rewardLine: "You can now read higher and lower prices on the chart.",
    masteryTags: ["vertical-price-reading"],
    learn: {
      title: "Which point is more expensive?",
      visual: "timeline",
      explanation:
        "Higher on the chart usually means higher price. Lower on the chart means lower price.",
      whatThisMeans:
        "Vertical placement carries price information. That is different from the left-to-right time direction.",
      commonMistake:
        "Do not confuse vertical height with recency. A higher point is not necessarily later; it is usually more expensive.",
      labMoment:
        "Compare two points and place higher/lower tags on them.",
      supportActivities: [
        "Look at the y-axis first.",
        "Compare two marked points.",
        "Tag the higher and lower point correctly.",
      ],
    },
    practice: {
      mechanicTitle: "Higher vs lower",
      mechanicSummary:
        "Compare chart points and attach higher/lower tags before answering the price question.",
      prompt: "Which point is more expensive?",
      question: "",
      activityKind: "chart-lab",
      activityData: {
        variant: "point-compare",
        points: ["Lower point", "Higher point"],
        chartPoints: [18, 26, 34, 52, 61, 78],
        tags: ["Higher price", "Lower price"],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Compare the points first",
      supportActivities: [
        "Compare the two points.",
        "Place the higher/lower tags.",
        "Keep time and price separate in your head.",
      ],
      options: [],
      explanation: "Correct. A higher point on the y-axis usually means a higher price.",
    },
    check: {
      question: "If one point is higher on the y-axis than another, what usually changed?",
      type: "multiple",
      options: [
        choice("a", "Price is higher", true, ""),
        choice("b", "Time went backward", false, "vertical-price-reading", "That confuses price with time."),
        choice("c", "Volume disappeared", false, "vertical-price-reading", "This lesson is about price position, not volume."),
        choice("d", "Revenue doubled automatically", false, "vertical-price-reading", "A chart point’s height does not prove that."),
      ],
      explanation: "A higher y-axis point usually means a higher price.",
      reviewPrompt: "vertical-price-reading",
    },
  },
  "chart-basics-4": {
    objective: "Teach broad chart reading.",
    rewardLine: "You can now summarize a simple line chart without overclaiming.",
    masteryTags: ["line-chart-reading"],
    learn: {
      title: "Trace the chart with your cursor",
      visual: "sandbox",
      explanation:
        "A line chart helps you see the overall path. Start by reading broad direction, not tiny wiggles.",
      whatThisMeans:
        "A good first read is usually a calm summary such as mostly rising, mostly falling, or mostly flat.",
      commonMistake:
        "Tiny wiggles are not the main story. Zoomed-out direction comes first.",
      labMoment:
        "Trace the path from left to right before you choose a summary sentence.",
      supportActivities: [
        "Follow the line from start to finish.",
        "Ignore tiny wiggles at first.",
        "Choose the best broad summary.",
      ],
    },
    practice: {
      mechanicTitle: "Line chart trace",
      mechanicSummary:
        "Trace the path, then pick the broad description that fits it best.",
      prompt: "Trace the chart and describe the broad path.",
      question: "",
      activityKind: "chart-lab",
      activityData: {
        variant: "trace-path",
        chartPoints: [20, 28, 36, 45, 60, 72, 84],
        summaryChoices: ["Mostly rising over time", "Guaranteed to keep rising", "No price movement at all"],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Trace the chart first",
      supportActivities: [
        "Trace first.",
        "Summarize second.",
        "Avoid prediction language.",
      ],
      options: [],
      explanation: "Correct. This chart is best described as mostly rising over time.",
    },
    check: {
      question: "Which summary best fits this chart?",
      type: "multiple",
      options: [
        choice("a", "Mostly rising over time", true, ""),
        choice("b", "Guaranteed to keep rising", false, "line-chart-reading", "That turns a summary into a prediction."),
        choice("c", "Means the company is perfect", false, "line-chart-reading", "A price chart does not say that."),
        choice("d", "Shows no price movement at all", false, "line-chart-reading", "The line clearly moved."),
      ],
      explanation: "Mostly rising over time is the best broad summary.",
      reviewPrompt: "line-chart-reading",
    },
  },
  "chart-basics-5": {
    objective: "Teach basic direction classification.",
    rewardLine: "You can now classify flat, rising, and falling moves quickly.",
    masteryTags: ["direction-classification"],
    learn: {
      title: "Sort these charts",
      visual: "sandbox",
      explanation:
        "Rising means generally moving higher. Falling means generally moving lower. Flat means little net movement.",
      whatThisMeans:
        "You do not need precision at first. You need clear direction recognition.",
      commonMistake:
        "One spike does not automatically change the whole direction label.",
      labMoment:
        "Sort small chart cards into Rising, Falling, or Flat.",
      supportActivities: [
        "Look for the net direction.",
        "Sort one chart at a time.",
        "Use the badge reveal to check yourself.",
      ],
    },
    practice: {
      mechanicTitle: "Direction buckets",
      mechanicSummary:
        "Sort mini charts into rising, falling, and flat, then lock in the simplest direction word.",
      prompt: "Sort these mini charts into direction buckets.",
      question: "",
      activityKind: "bucket-sort",
      activityData: {
        title: "Chart directions",
        buckets: ["Rising", "Falling", "Flat"],
        cards: [
          {
            id: "chart-1",
            label: "Steady climb",
            description: "Price finishes clearly above where it started.",
            points: [24, 30, 38, 47, 56, 68],
            target: "Rising",
          },
          {
            id: "chart-2",
            label: "Long slide",
            description: "Price keeps stepping lower over time.",
            points: [78, 70, 60, 52, 40, 30],
            target: "Falling",
          },
          {
            id: "chart-3",
            label: "Tight range",
            description: "Small moves with little net change.",
            points: [52, 54, 51, 53, 52, 54],
            target: "Flat",
          },
          {
            id: "chart-4",
            label: "Up with pauses",
            description: "Some pullbacks, but the net move is higher.",
            points: [18, 30, 24, 42, 38, 58],
            target: "Rising",
          },
          {
            id: "chart-5",
            label: "Mostly sideways",
            description: "Noise appears, but the chart finishes near where it began.",
            points: [48, 52, 46, 54, 50, 49],
            target: "Flat",
          },
        ],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Sort every chart first",
      supportActivities: [
        "Sort the charts quickly.",
        "Check the direction badge.",
        "Focus on overall movement, not tiny noise.",
      ],
      options: [],
      explanation: "Correct. Little overall movement is best described as flat.",
    },
    check: {
      question: "Which word best describes a chart with little overall movement?",
      type: "multiple",
      options: [
        choice("a", "Flat", true, ""),
        choice("b", "Explosive", false, "direction-classification", "That overstates what the chart is doing."),
        choice("c", "Guaranteed", false, "direction-classification", "That is not a direction label."),
        choice("d", "Earnings-based", false, "direction-classification", "That is unrelated to direction classification."),
      ],
      explanation: "Flat is the right label for little overall movement.",
      reviewPrompt: "direction-classification",
    },
  },
  "chart-basics-6": {
    objective: "Teach chart range extremes.",
    rewardLine: "You can now spot the peak and the low in a chart range.",
    masteryTags: ["chart-range-extremes"],
    learn: {
      title: "Find the peak and the low",
      visual: "sandbox",
      explanation:
        "The highest point shows the peak in the visible range. The lowest point shows the low in the visible range.",
      whatThisMeans:
        "A chart range has extremes. Spotting them helps you understand the spread of movement on the screen.",
      commonMistake:
        "The highest visible point is not the next guaranteed price. It is only the peak in the displayed range.",
      labMoment:
        "Tap the highest point, then the lowest point, and reveal the range bar.",
      supportActivities: [
        "Tap the top point first.",
        "Tap the bottom point second.",
        "Watch the range bar fill between them.",
      ],
    },
    practice: {
      mechanicTitle: "Peak and low finder",
      mechanicSummary:
        "Tap the high and low points on the chart and reveal the visible range.",
      prompt: "Find the highest point and the lowest point.",
      question: "",
      activityKind: "chart-lab",
      activityData: {
        variant: "high-low",
        points: ["Peak", "Low", "Middle pullback"],
        chartPoints: [28, 72, 46, 32, 78],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Find the peak and low first",
      supportActivities: [
        "Tap the peak first.",
        "Tap the low next.",
        "Use the revealed range as your check.",
      ],
      options: [],
      explanation: "Correct. The highest visible point shows the peak price in the displayed range.",
    },
    check: {
      question: "What does the highest visible point on a chart show?",
      type: "multiple",
      options: [
        choice("a", "The peak price in the displayed range", true, ""),
        choice("b", "The next guaranteed price", false, "chart-range-extremes", "A peak does not guarantee what comes next."),
        choice("c", "The company’s profit margin", false, "chart-range-extremes", "That confuses chart reading with business metrics."),
        choice("d", "The number of shares outstanding", false, "chart-range-extremes", "A visible peak is not about share count."),
      ],
      explanation: "The highest visible point is the peak price in the displayed range.",
      reviewPrompt: "chart-range-extremes",
    },
  },
  "chart-basics-7": {
    objective: "Compare slope and pace.",
    rewardLine: "You can now compare faster and slower moves on a chart.",
    masteryTags: ["slope-and-pace"],
    learn: {
      title: "Which move rose faster?",
      visual: "timeline",
      explanation:
        "A steeper rise often means price moved faster. Similar direction does not mean the same speed.",
      whatThisMeans:
        "Two moves can both be upward, but one can still have stronger pace than the other.",
      commonMistake:
        "Direction and speed are not the same thing. Rising is not enough by itself; pace matters too.",
      labMoment:
        "Compare chart segments and rank them from slowest to fastest.",
      supportActivities: [
        "Look at steepness.",
        "Compare segments with similar direction.",
        "Rank them by pace.",
      ],
    },
    practice: {
      mechanicTitle: "Slope rank",
      mechanicSummary:
        "Compare three rising segments and rank them from slowest to fastest.",
      prompt: "Rank the rises from slowest to fastest.",
      question: "",
      activityKind: "sequence-lab",
      activityData: {
        title: "Slowest to fastest",
        steps: [
          {
            id: "gentle-rise",
            label: "Gentle rise",
            description: "Higher over time, but with a shallow slope.",
            points: [34, 38, 42, 46, 51, 56],
          },
          {
            id: "medium-rise",
            label: "Medium rise",
            description: "Still controlled, but with a stronger climb.",
            points: [26, 34, 42, 52, 63, 74],
          },
          {
            id: "steep-rise",
            label: "Steep rise",
            description: "Price covers more vertical ground quickly.",
            points: [14, 28, 46, 64, 82, 92],
          },
        ],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Rank every rise first",
      supportActivities: [
        "Start with the flattest rise.",
        "Finish with the steepest rise.",
        "Use pace, not just direction.",
      ],
      options: [],
      explanation: "Correct. The steeper rise usually suggests faster upward movement.",
    },
    check: {
      question: "Which chart segment suggests faster upward movement?",
      type: "multiple",
      options: [
        choice("a", "The steeper rise", true, ""),
        choice("b", "The flattest line", false, "slope-and-pace", "Flatter usually means slower."),
        choice("c", "The side label", false, "slope-and-pace", "The slope itself is the clue."),
        choice("d", "The oldest data point", false, "slope-and-pace", "Age and speed are different ideas."),
      ],
      explanation: "The steeper rise is the stronger pace clue.",
      reviewPrompt: "slope-and-pace",
    },
  },
  "chart-basics-8": {
    objective: "Introduce chart formats.",
    rewardLine: "You can now separate line-chart simplicity from candlestick detail.",
    masteryTags: ["chart-format-basics"],
    learn: {
      title: "Toggle between line and candlestick view",
      visual: "sandbox",
      explanation:
        "Line charts are simpler for broad direction. Candlesticks show more detail about price movement.",
      whatThisMeans:
        "Beginners usually start faster with line charts, then add candlestick detail later.",
      commonMistake:
        "More detail is not always better for a first read. Too much detail can hide the broad path.",
      labMoment:
        "Flip the chart view and match each format to its best use.",
      supportActivities: [
        "Toggle the view.",
        "Compare simplicity against detail.",
        "Match each format to its purpose.",
      ],
    },
    practice: {
      mechanicTitle: "Chart view toggle",
      mechanicSummary:
        "Flip between the two chart styles and match each one to the right purpose.",
      prompt: "Match the chart format to its best use.",
      question: "",
      activityKind: "chart-lab",
      activityData: {
        variant: "toggle-view",
        leftLabel: "Line chart",
        rightLabel: "Candlestick chart",
        matches: [
          { clue: "simpler overview", answer: "Line chart" },
          { clue: "more detailed session info", answer: "Candlestick chart" },
        ],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Compare the chart views first",
      supportActivities: [
        "Flip the view once.",
        "Match each purpose after comparing them.",
        "Keep the beginner-first use case in mind.",
      ],
      options: [],
      explanation: "Correct. A line chart is usually easier for a beginner’s first chart read.",
    },
    check: {
      question: "Which format is usually easier for a beginner’s first chart read?",
      type: "multiple",
      options: [
        choice("a", "Line chart", true, ""),
        choice("b", "Candlestick chart only", false, "chart-format-basics", "Candlesticks are useful later, but they add more detail."),
        choice("c", "Spreadsheet view", false, "chart-format-basics", "That is not the chart reading format we want."),
        choice("d", "News ticker", false, "chart-format-basics", "A news ticker is not a chart format."),
      ],
      explanation: "Line charts are usually the simpler first step for beginners.",
      reviewPrompt: "chart-format-basics",
    },
  },
  "chart-basics-9": {
    objective: "Teach careful interpretation.",
    rewardLine: "You now know that charts are history, not certainty.",
    masteryTags: ["chart-history-not-certainty"],
    learn: {
      title: "Which statement is more careful?",
      visual: "checklist",
      explanation:
        "Charts are history. They help you observe behavior. They do not guarantee what happens next.",
      whatThisMeans:
        "A careful chart read summarizes what happened and keeps room for future uncertainty.",
      commonMistake:
        "The biggest mistake is turning a chart summary into a certainty claim about the future.",
      labMoment:
        "Sort statements into careful and overconfident.",
      supportActivities: [
        "Read each interpretation sentence once.",
        "Put the careful statement in the right bucket.",
        "Flip the explanation card to see why certainty is the wrong move.",
      ],
    },
    practice: {
      mechanicTitle: "Careful vs overconfident",
      mechanicSummary:
        "Sort interpretation sentences by whether they stay careful or overclaim the future.",
      prompt: "Which statement is more careful?",
      question: "",
      activityKind: "bucket-sort",
      activityData: {
        title: "Interpretation style",
        buckets: ["Careful", "Overconfident"],
        cards: [
          {
            id: "careful-history",
            label: "The chart shows what happened, but future moves still need context.",
            target: "Careful",
          },
          {
            id: "must-rise-forever",
            label: "The chart rose, so it must rise forever.",
            target: "Overconfident",
          },
        ],
      },
      useActivityAsPractice: true,
      actionLabel: "Continue to check",
      readinessLabel: "Sort the statements first",
      supportActivities: [
        "Choose the careful sentence first.",
        "Put certainty claims in the overconfident bucket.",
        "Keep chart history separate from future certainty.",
      ],
      options: [],
      explanation:
        "Correct. Charts show what happened and help with interpretation, but they do not guarantee the future.",
    },
    check: {
      question: "Which statement is most accurate?",
      type: "multiple",
      options: [
        choice("a", "Charts show the future exactly", false, "chart-history-not-certainty", "That overclaims what a chart can do."),
        choice("b", "Charts show what happened and help with interpretation", true, ""),
        choice("c", "Charts replace all business analysis", false, "chart-history-not-certainty", "Charts are one lens, not the whole picture."),
        choice("d", "Charts guarantee certainty", false, "chart-history-not-certainty", "Charts do not remove uncertainty."),
      ],
      explanation:
        "B is the most accurate because charts show history and support interpretation.",
      reviewPrompt: "chart-history-not-certainty",
    },
  },
  "chart-basics-10": {
    objective: "Combine chart basics into one full reading.",
    rewardLine: "Chart Basics complete.",
    masteryTags: ["chart-price-time", "chart-chronology", "chart-range-extremes", "chart-history-not-certainty"],
    learn: {
      title: "Chart decoding walkthrough",
      visual: "sandbox",
      explanation:
        "This boss lesson combines axes, direction, range, and careful interpretation in one clean walkthrough.",
      whatThisMeans:
        "You are moving from isolated chart basics to a full first-pass chart read.",
      commonMistake:
        "The main mistake is skipping the structure and jumping straight to a certainty claim.",
      labMoment:
        "Tap the chart in the right order, then finish with the best summary.",
      supportActivities: [
        "Find time axis.",
        "Find price axis.",
        "Read direction, high, low, and then summary.",
      ],
    },
    practice: {
      mechanicTitle: "Guided chart walkthrough",
      mechanicSummary:
        "Follow the chart-reading order from axes to direction to range before making the final summary choice.",
      prompt: "Work through the chart from structure first to summary second.",
      question: "Which direction best fits the chart before the final summary?",
      activityKind: "chart-lab",
      activityData: {
        variant: "boss-walkthrough",
        chartPoints: [16, 24, 38, 34, 48, 66, 84],
        checklist: [
          "Tap time axis",
          "Tap price axis",
          "Choose direction",
          "Tap highest point",
          "Tap lowest point",
        ],
      },
      supportActivities: [
        "Start with the axes.",
        "Read direction next.",
        "Leave the full summary for the final check.",
      ],
      options: [
        choice("a", "Rising", true, ""),
        choice("b", "Falling", false, "chart-price-time", "The walkthrough chart is meant to be read as mostly rising."),
        choice("c", "Flat", false, "chart-price-time", "The chart shows more than flat movement."),
      ],
      explanation:
        "Right. This walkthrough chart is mostly rising, but the final summary still needs caution.",
    },
    check: {
      question: "Which summary is best?",
      type: "multiple",
      options: [
        choice(
          "a",
          "The chart shows price over time, appears mostly rising, and history does not guarantee the future.",
          true,
          "",
        ),
        choice(
          "b",
          "The chart proves the stock will keep rising.",
          false,
          "chart-history-not-certainty",
          "That turns a chart read into a certainty claim, which is the mistake this module is trying to remove.",
        ),
        choice(
          "c",
          "The chart only shows company revenue.",
          false,
          "chart-price-time",
          "A stock chart is showing price over time, not revenue only.",
        ),
        choice(
          "d",
          "The chart means no uncertainty remains.",
          false,
          "chart-history-not-certainty",
          "A chart can improve your read, but it never removes uncertainty completely.",
        ),
      ],
      explanation:
        "A is best because it captures price over time, broad direction, and the correct cautious mindset.",
      reviewPrompt: "chart-basics-boss",
    },
  },
};

const authoredLearnPanelsByLesson: Record<string, LearnPanel[]> = {
  "foundations-1": [
    learnPanel(
      "ownership-definition",
      "A stock means ownership",
      "Buying shares means owning part of a company.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "You bought shares in a company.",
          actionLabel: "Show me",
          revealTitle: "What that means",
          revealCopy: "You now own part of that company.",
          highlightText: "own part",
        },
      },
    ),
    learnPanel(
      "ownership-comparison",
      "Switch the share count",
      "Example company: 10,000 total shares. Switch between 1, 100, and 1,000 shares to see how your company slice changes.",
      {
        eyebrow: "Learn",
        activityKind: "ownership-board",
        activityStartValue: 1,
        activityData: {
          variant: "ownership-example",
          presentation: "growth",
          totalShares: 10000,
          states: [
            {
              id: "one-share",
              label: "1 share",
              shares: 1,
              detail: "1 out of 10,000 shares = 0.01% ownership.",
              support: "Small does not mean fake. It is still ownership.",
            },
            {
              id: "one-hundred-shares",
              label: "100 shares",
              shares: 100,
              detail: "100 out of 10,000 shares = 1.0%.",
              support: "In the same company, more shares means a bigger ownership slice.",
            },
            {
              id: "one-thousand-shares",
              label: "1,000 shares",
              shares: 1000,
              detail: "1,000 out of 10,000 shares = 10.0%.",
              support: "That is much bigger than 1 share, but it is still only part of the company.",
            },
          ],
        },
      },
    ),
    learnPanel(
      "ownership-not-control",
      "Ownership is not total control",
      "A bigger stake is still usually only part of the company.",
      {
        eyebrow: "Lock-in",
        activityKind: "reveal-card",
        activityData: {
          statement: "Owning 1,000 of 10,000 shares sounds big.",
          actionLabel: "What does that mean?",
          revealTitle: "Still not the whole company",
          revealCopy:
            "It means 10% ownership. That is bigger, but it is still far from owning all of it.",
          highlightText: "10% ownership",
        },
      },
    ),
  ],
  "foundations-2": [
    learnPanel(
      "hook",
      "Companies sell shares to bring in capital",
      "Start by sorting realistic reasons from fake promises. The real logic is about raising money for growth.",
      {
        eyebrow: "Hook",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Real reasons", "Not real reasons"],
          cards: [
            { id: "expand", label: "Expand operations", target: "Real reasons" },
            { id: "raise", label: "Raise money", target: "Real reasons" },
            { id: "growth", label: "Fund growth", target: "Real reasons" },
            { id: "magic", label: "Guarantee profit", target: "Not real reasons" },
            { id: "riskless", label: "Eliminate all risk", target: "Not real reasons" },
          ],
        },
        highlights: [
          "Selling stock can raise capital.",
          "Capital helps a company invest and expand.",
          "Selling stock does not promise success.",
        ],
      },
    ),
    learnPanel(
      "board",
      "More capital usually means giving up more ownership",
      "Use the slider to see the tradeoff. A company can raise more money by selling more ownership, but control gets diluted.",
      {
        eyebrow: "Learn",
        activityKind: "funding-simulator",
        activityStartValue: 72,
        noteLabel: "Why it matters",
        note: "This is why issuing shares is a financing decision. It changes who owns what while giving the company more cash to use.",
      },
    ),
    learnPanel(
      "mistake",
      "Capital helps growth. It does not make outcomes certain.",
      "A company can raise money for hiring, products, or expansion and still fail. Financing gives resources, not guarantees.",
      {
        eyebrow: "Watch for",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Growth use", "False promise"],
          cards: [
            { id: "hire", label: "Hire more people", target: "Growth use" },
            { id: "products", label: "Build new products", target: "Growth use" },
            { id: "must-rise", label: "Guarantee the stock goes up", target: "False promise" },
            { id: "never-report", label: "Avoid reporting results", target: "False promise" },
          ],
        },
        noteLabel: "Common mistake",
        note: "Beginners sometimes hear “company sold stock” and think the business must be weak or the stock must soar. Neither is automatic.",
      },
    ),
  ],
  "foundations-3": [
    learnPanel(
      "hook",
      "Price pressure starts with who is more eager",
      "Move buyers and sellers. When one side is stronger, price pressure can tilt in that direction.",
      {
        eyebrow: "Hook",
        activityKind: "news-chart",
        activityStartValue: 68,
        activityData: {
          variant: "pressure-balance",
          scenarios: [
            "Many eager buyers, few sellers",
            "Many sellers, weak demand",
            "Balanced interest on both sides",
          ],
        },
        highlights: [
          "Markets match buyers and sellers.",
          "Imbalance creates pressure.",
          "Pressure is not the same thing as certainty.",
        ],
      },
    ),
    learnPanel(
      "flow",
      "A trade needs both sides to meet",
      "Put the simple flow in order. A market works by matching interest, not by posting one guaranteed fixed price forever.",
      {
        eyebrow: "Learn",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            { id: "buyer-interest", label: "Buyers place interest", description: "People show what they are willing to pay." },
            { id: "seller-interest", label: "Sellers place interest", description: "Other people decide what price they will accept." },
            { id: "match-trade", label: "The market matches them", description: "When prices align, a trade can happen." },
          ],
          orderedSteps: [
            { id: "1", label: "Start" },
            { id: "2", label: "Then" },
            { id: "3", label: "Trade" },
          ],
        },
        noteLabel: "What this really means",
        note: "The market is a matching system. It is not a vending machine with one fixed price.",
      },
    ),
    learnPanel(
      "compare",
      "Read the pressure before you read the price move",
      "Sort the situations by what they imply. This trains you to look for buying pressure, selling pressure, or balance first.",
      {
        eyebrow: "Micro example",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Buying pressure", "Selling pressure", "Balanced"],
          cards: [
            { id: "buyers", label: "Many eager buyers, few sellers", target: "Buying pressure" },
            { id: "sellers", label: "Many sellers, weak demand", target: "Selling pressure" },
            { id: "equal", label: "Equal interest on both sides", target: "Balanced" },
          ],
        },
        noteLabel: "Common mistake",
        note: "Price does not move because a label says it should. It moves because buyers and sellers are not equally eager.",
      },
    ),
  ],
  "foundations-4": [
    learnPanel(
      "hook",
      "Push the market toward buyers or sellers",
      "Use the balance. Stronger demand can push price upward. Stronger selling can push it downward.",
      {
        eyebrow: "Hook",
        activityKind: "news-chart",
        activityStartValue: 60,
        activityData: {
          variant: "pressure-balance",
          scenarios: [
            "Strong demand after good news",
            "Heavy selling after bad results",
            "Mixed reaction, little change",
          ],
        },
        highlights: [
          "More buyers can lift price pressure.",
          "More sellers can drag price pressure lower.",
          "Sometimes the picture stays mixed.",
        ],
      },
    ),
    learnPanel(
      "examples",
      "Classify pressure before you predict",
      "Sort these quick situations. Upward, downward, and unclear outcomes come from different pressure setups.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Up", "Down", "Unclear"],
          cards: [
            { id: "good-news", label: "Strong demand after good news", target: "Up" },
            { id: "bad-results", label: "Heavy selling after bad results", target: "Down" },
            { id: "mixed", label: "Mixed reaction, little change", target: "Unclear" },
          ],
        },
        noteLabel: "Why it matters",
        note: "A beginner’s job is to read the pressure correctly before jumping to a certainty claim.",
      },
    ),
    learnPanel(
      "mistake",
      "Unclear is a real answer",
      "Not every market setup points cleanly in one direction. Sometimes the most careful read is that the signal is mixed.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Demand can be stronger.",
          "Supply can be stronger.",
          "Sometimes neither side clearly wins.",
        ],
        noteLabel: "Common mistake",
        note: "Beginners often force every situation into up or down. Mixed conditions are real and worth naming.",
      },
    ),
  ],
  "foundations-5": [
    learnPanel(
      "hook",
      "Move the sell marker",
      "Watch the outcome change live. Sell above buy = gain, below = loss, same price = break-even.",
      {
        eyebrow: "Hook",
        activityKind: "return-builder",
        activityStartValue: 20,
        activityData: {
          variant: "gain-loss",
          buy: 20,
          min: 10,
          max: 30,
          sell: 20,
        },
      },
    ),
    learnPanel(
      "cases",
      "Read the outcome from the line",
      "Tap each scenario to see how buy and sell positions create gain, loss, or break-even.",
      {
        eyebrow: "Learn",
        activityKind: "return-builder",
        activityData: {
          variant: "scenario-gallery",
          scenarios: [
            {
              id: "gain",
              label: "Gain example",
              buy: 20,
              sell: 27,
              outcome: "Gain",
              amount: "+7",
              explanation: "Sell above buy and the result is a gain.",
            },
            {
              id: "loss",
              label: "Loss example",
              buy: 20,
              sell: 16,
              outcome: "Loss",
              amount: "-4",
              explanation: "Sell below buy and the result is a loss.",
            },
            {
              id: "flat",
              label: "Break-even example",
              buy: 20,
              sell: 20,
              outcome: "Break-even",
              amount: "0",
              explanation: "Same buy and sell price means break-even.",
            },
          ],
        },
      },
    ),
  ],
  "foundations-6": [
    learnPanel(
      "hook",
      "Some return comes from price. Some comes from cash.",
      "Move the controls and compare the two buckets of return. A dividend is cash from the company. A price gain comes from selling above your buy price.",
      {
        eyebrow: "Hook",
        activityKind: "return-builder",
        activityStartValue: 60,
        activityData: {
          variant: "dividend-vs-gain",
          matches: [
            { clue: "Cash payment from the company", answer: "Dividend" },
            { clue: "You sold for more than you paid", answer: "Price gain" },
          ],
        },
      },
    ),
    learnPanel(
      "compare",
      "Match the clue to the return type",
      "Use the examples to separate cash coming from the company from price change coming from the market.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Dividend", "Price gain"],
          cards: [
            { id: "cash", label: "Cash paid to shareholders", target: "Dividend" },
            { id: "sold-higher", label: "You sold for more than you paid", target: "Price gain" },
            { id: "company-payout", label: "Company sends part of earnings as cash", target: "Dividend" },
            { id: "higher-sale", label: "Market price rose before you sold", target: "Price gain" },
          ],
        },
        noteLabel: "Why it matters",
        note: "These are different sources of return. You want the learner mindset that can name each one separately.",
      },
    ),
    learnPanel(
      "mistake",
      "One does not automatically imply the other",
      "A stock can pay a dividend without delivering a big price gain, and a stock can rise without paying a dividend.",
      {
        eyebrow: "Micro example",
        highlights: [
          "Dividends are cash.",
          "Price gains come from the sale price.",
          "They can happen together, but they are not the same.",
        ],
        noteLabel: "Common mistake",
        note: "Beginners often use one word for both kinds of return. Keeping them separate makes later analysis much cleaner.",
      },
    ),
  ],
  "foundations-7": [
    learnPanel(
      "hook",
      "Not every money product works the same way",
      "Sort the descriptions. Some describe ownership, some describe lending, and some describe storing cash safely.",
      {
        eyebrow: "Hook",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Stock", "Bond", "Savings"],
          cards: [
            { id: "ownership", label: "Ownership in a company", target: "Stock" },
            { id: "upside", label: "Share of business upside", target: "Stock" },
            { id: "interest", label: "Fixed interest payment", target: "Bond" },
            { id: "lender", label: "Lender relationship", target: "Bond" },
            { id: "cash", label: "Cash in a savings account", target: "Savings" },
          ],
        },
      },
    ),
    learnPanel(
      "contrast",
      "Ownership, lending, and storage answer different needs",
      "Stocks are about ownership. Bonds are about lending. Savings is about holding cash with a bank-style safety profile.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Ownership language", "Lending language", "Cash storage language"],
          cards: [
            { id: "piece", label: "Own a piece of the business", target: "Ownership language" },
            { id: "repayment", label: "Expect fixed interest and repayment", target: "Lending language" },
            { id: "deposit", label: "Hold cash in an account", target: "Cash storage language" },
          ],
        },
        noteLabel: "What this means",
        note: "When you know which relationship you are entering, the product stops feeling abstract.",
      },
    ),
    learnPanel(
      "mistake",
      "Do not ask stocks to behave like savings",
      "A stock can move up or down. That is different from the purpose of a savings account, which is mainly to store cash.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Stock = ownership.",
          "Bond = lending.",
          "Savings = stored cash.",
        ],
        noteLabel: "Common mistake",
        note: "A lot of beginner confusion comes from expecting ownership assets to act like deposit products.",
      },
    ),
  ],
  "foundations-8": [
    learnPanel(
      "hook",
      "Tap the headlines and watch expectations move",
      "Markets react to changing expectations. Good news can lift the outlook. Bad news can weaken it. Mixed news can create uncertainty.",
      {
        eyebrow: "Hook",
        activityKind: "news-chart",
        activityStartValue: 40,
        activityData: {
          variant: "expectation-meter",
          headlines: [
            "Sales beat expectations",
            "Product recall announced",
            "New market expansion",
            "Costs jumped unexpectedly",
          ],
        },
      },
    ),
    learnPanel(
      "sort",
      "Sort the news before you predict the move",
      "Use the buckets to separate clearly positive, clearly negative, and mixed headlines. That is the mental step before you interpret price reaction.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Good", "Bad", "Mixed"],
          cards: [
            { id: "beat", label: "Sales beat expectations", target: "Good" },
            { id: "recall", label: "Product recall announced", target: "Bad" },
            { id: "expand", label: "New market expansion", target: "Good" },
            { id: "costs", label: "Costs jumped unexpectedly", target: "Bad" },
            { id: "mixed", label: "Sales rose, but margins shrank", target: "Mixed" },
          ],
        },
        noteLabel: "Why it matters",
        note: "Price reaction starts with how the market updates its expectations, not with a magical rule that every headline moves price the same way.",
      },
    ),
    learnPanel(
      "mistake",
      "Good news does not mean a guaranteed jump",
      "Expectations can improve without creating a perfect straight-line reaction. Markets can still respond in mixed ways.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Good news can improve the outlook.",
          "Bad news can hurt the outlook.",
          "Mixed news can leave the read unclear.",
        ],
        noteLabel: "Common mistake",
        note: "Beginners often turn “good news” into “must go up.” That skips the idea of expectations and uncertainty.",
      },
    ),
  ],
  "foundations-9": [
    learnPanel(
      "hook",
      "Good beginners observe before they predict",
      "Build the order first. A careful learner starts with observation, then context, then interpretation.",
      {
        eyebrow: "Hook",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            { id: "observe", label: "Observe", description: "Start by seeing what is there, not by guessing the ending." },
            { id: "chart", label: "Check the chart", description: "Read the visible price behavior." },
            { id: "business", label: "Check the business context", description: "Separate price action from business facts." },
            { id: "change", label: "Ask what changed", description: "Look for the clue that shifted the setup." },
            { id: "careful", label: "Form a careful interpretation", description: "Only now is it time to summarize." },
          ],
        },
      },
    ),
    learnPanel(
      "compare",
      "Careful language sounds different from careless language",
      "Sort the mindsets. One style stays curious and careful. The other jumps to certainty too fast.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Careful", "Careless"],
          cards: [
            { id: "observe-first", label: "Observe first and stay careful", target: "Careful" },
            { id: "one-signal", label: "One signal tells me everything", target: "Careless" },
            { id: "future", label: "I already know the future", target: "Careless" },
            { id: "separate", label: "Separate evidence from confidence", target: "Careful" },
          ],
        },
        noteLabel: "What this means",
        note: "The beginner edge is not prediction. It is reading evidence in the right order.",
      },
    ),
    learnPanel(
      "mistake",
      "Do not force one clue to explain everything",
      "A single headline, candle, or number rarely explains the whole stock story. Better thinking comes from combining clues slowly.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Observe first.",
          "Separate price from business context.",
          "Use careful language.",
        ],
        noteLabel: "Common mistake",
        note: "The fastest way to sound confident is usually the fastest way to miss what matters.",
      },
    ),
  ],
  "foundations-10": [
    learnPanel(
      "hook",
      "Start with ownership",
      "You buy shares in a mock company. Your first job is to recognize that this creates ownership, not a loan or a paycheck.",
      {
        eyebrow: "Boss setup",
        activityKind: "tap-sort",
        activityData: {
          buckets: ["Ownership", "Not what buying shares means"],
          cards: [
            {
              id: "boss-own-part",
              label: "You own part of the company",
              target: "Ownership",
              description: "A stock share represents ownership.",
            },
            {
              id: "boss-loan",
              label: "You made a loan to the company",
              target: "Not what buying shares means",
              description: "A bond is lending. A stock is not.",
            },
            {
              id: "boss-paycheck",
              label: "You now get a company salary",
              target: "Not what buying shares means",
              description: "Owning shares does not create a paycheck.",
            },
            {
              id: "boss-more-shares",
              label: "More shares can mean a bigger ownership slice",
              target: "Ownership",
              description: "More shares in the same company can increase your ownership.",
            },
            {
              id: "boss-control",
              label: "Owning shares means you control every decision",
              target: "Not what buying shares means",
              description: "Ownership is not the same thing as total control.",
            },
          ],
        },
        noteLabel: "Checkpoint",
        note: "Start the boss by separating real ownership from common beginner mistakes.",
      },
    ),
    learnPanel(
      "cause",
      "Now connect capital raising and expectations",
      "The company announces a growth plan. That can connect to capital raising and to changing expectations in the market.",
      {
        eyebrow: "Learn",
        activityKind: "funding-simulator",
        activityStartValue: 66,
        noteLabel: "Why it matters",
        note: "Strong analysis links company action to market reaction instead of treating price as random noise.",
      },
    ),
    learnPanel(
      "returns",
      "Returns can come from more than one place",
      "Finish by separating price gain, dividend, break-even, and loss. You are combining ownership, expectations, and return logic in one flow.",
      {
        eyebrow: "Apply",
        activityKind: "return-builder",
        activityData: {
          variant: "boss-return-map",
          cases: [
            {
              id: "price-gain",
              label: "Sold above your buy",
              source: "Market price",
              buy: 22,
              sell: 30,
              outcome: "Gain",
              amount: "+8",
              explanation: "Selling above your buy creates a price gain.",
              support: "This return comes from the market price moving higher before you sell.",
            },
            {
              id: "dividend",
              label: "Company paid you cash",
              source: "Company cash",
              buy: 22,
              sell: 22,
              outcome: "Dividend",
              amount: "$1 cash",
              explanation: "A dividend is cash paid from the company to shareholders.",
              support: "The return came from the business paying cash out, not from selling at a higher price.",
            },
            {
              id: "break-even",
              label: "Sold at the same price",
              source: "Market price",
              buy: 22,
              sell: 22,
              outcome: "Break-even",
              amount: "0",
              explanation: "If the buy and sell prices match, the price result is break-even.",
              support: "There is no price gain or loss when the sale price matches what you paid.",
            },
            {
              id: "loss",
              label: "Sold below your buy",
              source: "Market price",
              buy: 22,
              sell: 17,
              outcome: "Loss",
              amount: "-5",
              explanation: "Selling below your buy creates a loss.",
              support: "This return came from the market price moving against you before you sold.",
            },
          ],
        },
        noteLabel: "Checkpoint",
        note: "This checkpoint is earned when you can connect ownership, capital raising, expectations, and return types in one clean story.",
      },
    ),
  ],
  "chart-basics-1": [
    learnPanel(
      "hook",
      "A chart has two jobs: show time and show price",
      "Tap the horizontal and vertical axes first. If you can name those two dimensions, you can start reading any simple chart.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "axes",
          labels: [
            { id: "time", label: "Time", target: "x-axis" },
            { id: "price", label: "Price", target: "y-axis" },
          ],
        },
        highlights: [
          "Time usually runs left to right.",
          "Price is plotted vertically.",
          "That gives you the basic chart map.",
        ],
      },
    ),
    learnPanel(
      "difference",
      "Do not mix up time and price",
      "A point can be later without being higher. A point can be higher without being later. The chart uses one direction for time and one for price.",
      {
        eyebrow: "Learn",
        activityKind: "chart-lab",
        activityData: {
          variant: "point-compare",
          chartPoints: [30, 74, 66, 58, 50, 38],
          markers: [
            {
              id: "higher-earlier",
              badge: "A",
              label: "Higher, but earlier",
              index: 1,
              tone: "primary",
              timeLabel: "Earlier in time",
              priceLabel: "Higher price",
              detail:
                "This point sits farther left, so it happened earlier. It also sits higher, so the price is higher.",
              support:
                "The point is earlier because it is leftward, not because it is lower. Time and price are separate axes.",
            },
            {
              id: "later-lower",
              badge: "B",
              label: "Later, but lower",
              index: 5,
              tone: "secondary",
              timeLabel: "Later in time",
              priceLabel: "Lower price",
              detail:
                "This point sits farther right, so it happened later. It sits lower, so the price is lower.",
              support:
                "A point can be later without being higher. Horizontal position shows time. Vertical position shows price.",
            },
          ],
        },
        noteLabel: "Why it matters",
        note: "Most chart confusion disappears once you keep horizontal time and vertical price separate.",
      },
    ),
    learnPanel(
      "mistake",
      "A chart is not a prophecy screen",
      "Its first job is to describe what happened over time. Prediction comes later and still requires uncertainty.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Find time first.",
          "Find price second.",
          "Read the chart before you predict.",
        ],
        noteLabel: "Common mistake",
        note: "Beginners often skip the axes and jump straight to a future claim. That is the wrong order.",
      },
    ),
  ],
  "chart-basics-2": [
    learnPanel(
      "hook",
      "Order the snapshots from early to late",
      "Time on a chart moves left to right. Rebuild the sequence so the history makes sense.",
      {
        eyebrow: "Hook",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            {
              id: "early-snapshot",
              label: "Early snapshot",
              description: "Only the first stretch of the move is visible.",
              points: [28, 38, 34, 46],
            },
            {
              id: "middle-snapshot",
              label: "Middle snapshot",
              description: "More history appears, including a pullback.",
              points: [28, 38, 34, 46, 58, 52],
            },
            {
              id: "late-snapshot",
              label: "Latest snapshot",
              description: "The full move extends farther to the right.",
              points: [28, 38, 34, 46, 58, 52, 70, 82],
            },
          ],
          orderedSteps: [
            { id: "slot-1", label: "Earliest" },
            { id: "slot-2", label: "Middle" },
            { id: "slot-3", label: "Latest" },
          ],
        },
      },
    ),
    learnPanel(
      "reveal",
      "Reveal the chart from left to right",
      "Use the slider to uncover more of the path. As more points appear to the right, the chart becomes more recent.",
      {
        eyebrow: "Learn",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [28, 38, 34, 46, 58, 52, 70, 82],
          summaryChoices: ["Earlier → later", "Later → earlier", "Top → bottom"],
        },
        noteLabel: "What this means",
        note: "The right edge is where the newest visible information usually lives.",
      },
    ),
    learnPanel(
      "mistake",
      "Do not read the chart backward",
      "If you reverse time, you reverse the story. Chronology has to come before interpretation.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Left = earlier.",
          "Right = later.",
          "Most recent point sits on the right edge.",
        ],
        noteLabel: "Common mistake",
        note: "A lot of beginner errors come from noticing a dramatic point and forgetting where it sits in time.",
      },
    ),
  ],
  "chart-basics-3": [
    learnPanel(
      "hook",
      "Higher on the chart usually means higher price",
      "Tap the two points and compare their vertical positions before you read the label.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "point-compare",
          points: ["Lower point", "Higher point"],
          lowIndex: 1,
          highIndex: 5,
          chartPoints: [18, 26, 34, 52, 61, 78],
        },
      },
    ),
    learnPanel(
      "compare",
      "Vertical height says more about price than time",
      "A point can be high on the screen even if it is not the newest point. Height and recency answer different questions.",
      {
        eyebrow: "Learn",
        activityKind: "chart-lab",
        activityData: {
          variant: "point-compare",
          points: ["Earlier but lower", "Later and higher"],
          lowIndex: 0,
          highIndex: 4,
          chartPoints: [22, 28, 44, 38, 68, 60],
        },
        noteLabel: "Why it matters",
        note: "When you know what the y-axis means, you stop guessing what “higher on the chart” is trying to tell you.",
      },
    ),
    learnPanel(
      "mistake",
      "Do not confuse higher with newer",
      "Higher is about price. Newer is about position on the x-axis. Good chart reading keeps those ideas separate.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Higher point = higher price.",
          "Right side = later time.",
          "Those are different clues.",
        ],
        noteLabel: "Common mistake",
        note: "If you merge vertical and horizontal meaning together, the chart quickly becomes misleading.",
      },
    ),
  ],
  "chart-basics-4": [
    learnPanel(
      "hook",
      "Read the broad path before the tiny wiggles",
      "Trace the line from start to finish. Your first task is to summarize the overall move, not memorize every wiggle.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [20, 28, 36, 45, 60, 72, 84],
          summaryChoices: ["Mostly rising over time", "Tiny wiggles matter most", "Guaranteed to keep rising"],
        },
      },
    ),
    learnPanel(
      "contrast",
      "Broad summary comes before prediction",
      "A useful first read sounds like “mostly rising,” “mostly falling,” or “mostly flat.” It does not turn into a forecast yet.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Useful summary", "Overreach"],
          cards: [
            { id: "mostly-rising", label: "Mostly rising over time", target: "Useful summary" },
            { id: "must-rise", label: "Guaranteed to keep rising", target: "Overreach" },
            { id: "perfect-company", label: "The company must be perfect", target: "Overreach" },
          ],
        },
        noteLabel: "Why it matters",
        note: "Charts become easier when you learn to summarize direction without slipping into certainty.",
      },
    ),
    learnPanel(
      "mistake",
      "Zoomed-in noise is not the first lesson",
      "The point of a simple line chart is to help you see the path clearly. Small wiggles matter later, after the broad read is stable.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Start broad.",
          "Summarize simply.",
          "Add detail after direction.",
        ],
        noteLabel: "Common mistake",
        note: "Many beginners zoom in too early and lose the overall story of the chart.",
      },
    ),
  ],
  "chart-basics-5": [
    learnPanel(
      "hook",
      "Direction should feel obvious after a quick look",
      "Sort the mini charts by net direction. The goal is fast recognition, not perfect math.",
      {
        eyebrow: "Hook",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Rising", "Falling", "Flat"],
          cards: [
            { id: "rise-a", label: "Steady climb", description: "Finishes clearly above the start.", points: [24, 30, 38, 47, 56, 68], target: "Rising" },
            { id: "fall-a", label: "Long slide", description: "Keeps stepping lower.", points: [78, 70, 60, 52, 40, 30], target: "Falling" },
            { id: "flat-a", label: "Tight range", description: "Little net change.", points: [52, 54, 51, 53, 52, 54], target: "Flat" },
          ],
        },
      },
    ),
    learnPanel(
      "compare",
      "A chart can wiggle and still be flat overall",
      "Use the second set to compare noisy but sideways movement against charts that truly end much higher or lower.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Rising", "Falling", "Flat"],
          cards: [
            { id: "rise-b", label: "Up with pauses", description: "Pullbacks happen, but the net move is still higher.", points: [18, 30, 24, 42, 38, 58], target: "Rising" },
            { id: "flat-b", label: "Mostly sideways", description: "There is noise, but the finish is near the start.", points: [48, 52, 46, 54, 50, 49], target: "Flat" },
            { id: "fall-b", label: "Lower with bounces", description: "Short pops do not change the overall slide.", points: [74, 66, 70, 58, 52, 44], target: "Falling" },
          ],
        },
        noteLabel: "What this means",
        note: "Direction is about the net path, not about whether the line ever paused or bounced.",
      },
    ),
    learnPanel(
      "mistake",
      "One spike does not always change the label",
      "A single dramatic move can grab attention, but the overall direction still depends on the whole path.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Rising = generally higher.",
          "Falling = generally lower.",
          "Flat = little net movement.",
        ],
        noteLabel: "Common mistake",
        note: "Beginners sometimes label a chart from its noisiest moment instead of its full path.",
      },
    ),
  ],
  "chart-basics-6": [
    learnPanel(
      "hook",
      "Every visible chart range has a high and a low",
      "Tap the highest point and the lowest point. Those two anchors tell you the visible range.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "high-low",
          points: ["Peak", "Low"],
          chartPoints: [42, 78, 56, 24, 64],
        },
      },
    ),
    learnPanel(
      "compare",
      "The visible peak is about the screen you are looking at",
      "A chart can have a visible high without saying anything about what comes next. It is the top of the displayed range, not a prediction.",
      {
        eyebrow: "Learn",
        activityKind: "chart-lab",
        activityData: {
          variant: "point-compare",
          chartPoints: [42, 78, 56, 24, 64],
          markers: [
            {
              id: "visible-peak",
              badge: "A",
              label: "Visible peak",
              index: 1,
              tone: "primary",
              timeLabel: "Earlier in the visible range",
              priceLabel: "Highest visible price",
              detail:
                "This is the peak inside the chart view you are looking at right now.",
              support:
                "A visible peak is about the displayed range on screen. It does not promise the chart will return there later.",
            },
            {
              id: "visible-low",
              badge: "B",
              label: "Visible low",
              index: 3,
              tone: "secondary",
              timeLabel: "Later in the visible range",
              priceLabel: "Lowest visible price",
              detail:
                "This is the low inside the same chart view. It anchors the bottom of the visible range.",
              support:
                "The range is what you can see on this screen. The high and low describe the display, not the future.",
            },
          ],
        },
        noteLabel: "Why it matters",
        note: "Spotting highs and lows helps you read the range first, which is a calmer starting point than guessing what comes next.",
      },
    ),
    learnPanel(
      "mistake",
      "Peak does not mean guaranteed future target",
      "The highest visible point is just the highest visible point. It does not promise a return there later.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Peak = highest visible price in range.",
          "Low = lowest visible price in range.",
          "Neither is a guarantee.",
        ],
        noteLabel: "Common mistake",
        note: "A lot of bad chart reads happen when a learner turns a past high into a future promise.",
      },
    ),
  ],
  "chart-basics-7": [
    learnPanel(
      "hook",
      "Two upward moves can rise at very different speeds",
      "Rank the slopes from slowest to fastest. Steepness is your visual clue for pace.",
      {
        eyebrow: "Hook",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            {
              id: "gentle-rise",
              label: "Gentle rise",
              description: "Still climbing, but with a shallow slope.",
              points: [34, 38, 42, 46, 51, 56],
            },
            {
              id: "medium-rise",
              label: "Medium rise",
              description: "A clearer climb with stronger pace.",
              points: [26, 34, 42, 52, 63, 74],
            },
            {
              id: "steep-rise",
              label: "Steep rise",
              description: "Much more vertical movement in the same span.",
              points: [14, 28, 46, 64, 82, 92],
            },
          ],
        },
      },
    ),
    learnPanel(
      "compare",
      "Direction and speed are not the same thing",
      "All three moves rise. Only one rises fastest. Pace is about how quickly price covers vertical ground.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Faster pace", "Slower pace"],
          cards: [
            { id: "steep-card", label: "Steeper rise", description: "More vertical move in less horizontal space.", points: [18, 30, 48, 66, 84], target: "Faster pace" },
            { id: "flat-card", label: "Flatter rise", description: "Still up, but covering less ground per step.", points: [36, 40, 45, 49, 54], target: "Slower pace" },
          ],
        },
        noteLabel: "What this means",
        note: "When you separate direction from speed, trend lessons later become much easier to understand.",
      },
    ),
    learnPanel(
      "mistake",
      "Up is not enough by itself",
      "A beginner who only sees “up” misses a second question: how forcefully is price moving in that direction?",
      {
        eyebrow: "Watch for",
        highlights: [
          "Both moves can be upward.",
          "One can still be clearly faster.",
          "Slope is the quick visual clue.",
        ],
        noteLabel: "Common mistake",
        note: "Learners often stop at direction and ignore pace, even when the chart is clearly showing it.",
      },
    ),
  ],
  "chart-basics-8": [
    learnPanel(
      "hook",
      "Toggle the same price story two ways",
      "Flip between a line chart and a candlestick chart. One is simpler. One shows more detail.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "toggle-view",
        },
      },
    ),
    learnPanel(
      "match",
      "Match each format to the job it does best",
      "Line charts help with broad direction. Candlesticks add session-by-session detail.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Line chart", "Candlestick chart"],
          cards: [
            { id: "overview", label: "Simpler overview", target: "Line chart" },
            { id: "detail", label: "More detailed session info", target: "Candlestick chart" },
            { id: "beginner", label: "Best first broad read", target: "Line chart" },
          ],
        },
        noteLabel: "Why it matters",
        note: "Beginners usually understand the big picture faster when they start with the simpler view.",
      },
    ),
    learnPanel(
      "mistake",
      "More detail is not always more helpful",
      "A denser chart can feel impressive while making the first read harder. Simplicity has a real teaching advantage.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Line chart = broad path.",
          "Candlestick chart = more detail.",
          "Detail is useful after the big picture is clear.",
        ],
        noteLabel: "Common mistake",
        note: "New learners often assume the more detailed chart must be the better chart. That is not always true for first reads.",
      },
    ),
  ],
  "chart-basics-9": [
    learnPanel(
      "hook",
      "Choose the careful statement",
      "A chart is history. The better interpretation describes what happened without pretending the future is guaranteed.",
      {
        eyebrow: "Hook",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Careful", "Overconfident"],
          cards: [
            { id: "careful-history", label: "The chart shows what happened, but future moves still need context.", target: "Careful" },
            { id: "must-rise", label: "The chart rose, so it must rise forever.", target: "Overconfident" },
            { id: "no-uncertainty", label: "No uncertainty remains.", target: "Overconfident" },
          ],
        },
      },
    ),
    learnPanel(
      "visual",
      "The chart can be useful without being certain",
      "Trace the move, then compare the kinds of sentences a careful beginner should use afterward.",
      {
        eyebrow: "Learn",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [18, 26, 44, 52, 60, 72],
          summaryChoices: [
            "Mostly rising over time",
            "Guaranteed to keep rising",
            "No uncertainty remains",
          ],
        },
        noteLabel: "What this means",
        note: "The right chart habit is observation first, certainty never.",
      },
    ),
    learnPanel(
      "mistake",
      "History helps, but it does not decide the future",
      "That careful mindset is what keeps chart reading educational instead of overconfident.",
      {
        eyebrow: "Watch for",
        highlights: [
          "Charts show what happened.",
          "They support interpretation.",
          "They do not remove uncertainty.",
        ],
        noteLabel: "Common mistake",
        note: "The most common chart-reading mistake is to turn a summary into a promise.",
      },
    ),
  ],
  "chart-basics-10": [
    learnPanel(
      "hook",
      "Start with the structure",
      "In a full chart read, you begin by naming the axes and orienting yourself before you summarize anything.",
      {
        eyebrow: "Boss setup",
        activityKind: "chart-lab",
        activityData: {
          variant: "boss-walkthrough",
          chartPoints: [16, 24, 38, 34, 48, 66, 84],
          checklist: [
            "Tap time axis",
            "Tap price axis",
            "Choose direction",
            "Tap highest point",
            "Tap lowest point",
          ],
        },
      },
    ),
    learnPanel(
      "direction",
      "Then read direction and range",
      "Only after you know the chart frame should you decide whether the path is mostly rising, falling, or flat and where the visible extremes sit.",
      {
        eyebrow: "Learn",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [16, 24, 38, 34, 48, 66, 84],
          summaryChoices: [
            "Mostly rising over time",
            "Perfect certainty",
            "No movement at all",
          ],
        },
        noteLabel: "Why it matters",
        note: "A calm chart read is a sequence: orient, summarize, then interpret carefully.",
      },
    ),
    learnPanel(
      "careful",
      "Finish with a careful summary",
      "The strongest chart summary keeps the right facts and leaves room for uncertainty.",
      {
        eyebrow: "Careful interpretation",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Careful summary", "Overreach"],
          cards: [
            { id: "careful", label: "Price over time, mostly rising, but history does not guarantee the future.", target: "Careful summary" },
            { id: "must-rise", label: "The chart proves the stock will keep rising.", target: "Overreach" },
            { id: "no-uncertainty", label: "The chart removes uncertainty.", target: "Overreach" },
          ],
        },
        noteLabel: "Checkpoint",
        note: "This boss lesson works when the learner can read structure, direction, range, and caution in one pass.",
      },
    ),
  ],
};

const authoredPracticeCopyPatches: Record<
  string,
  Partial<Pick<PracticeContent, "mechanicSummary" | "prompt" | "supportActivities">>
> = {
  "foundations-5": {
    mechanicSummary:
      "Move the buy and sell levels and watch the outcome badge update live.",
    prompt: "Move the buy and sell levels and watch what changes.",
  },
  "chart-basics-1": {
    mechanicSummary:
      "Tap the chart frame and then place the Time and Price labels onto the right axes.",
    prompt: "Place the labels onto the chart.",
    supportActivities: [
      "Tap the horizontal axis for time.",
      "Tap the vertical axis for price.",
      "Place the labels after you identify each axis.",
    ],
  },
  "chart-basics-5": {
    prompt: "Sort these mini charts into direction buckets.",
  },
};

for (const [lessonId, panels] of Object.entries(authoredLearnPanelsByLesson)) {
  const lesson = authoredLessonExperiences[lessonId];

  if (lesson) {
    lesson.learn.panels = panels;
  }
}

for (const [lessonId, patch] of Object.entries(authoredPracticeCopyPatches)) {
  const lesson = authoredLessonExperiences[lessonId];

  if (lesson) {
    Object.assign(lesson.practice, patch);
  }
}

const normalizedTargetLearnPanelsByLesson: Record<string, LearnPanel[]> = {
  "foundations-2": [
    learnPanel(
      "capital-hook",
      "Selling shares can raise cash",
      "A company can sell part of itself to bring in money for growth.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "A company wants money for expansion.",
          actionLabel: "Show me",
          revealTitle: "One financing path",
          revealCopy: "It can issue shares to raise capital.",
          highlightText: "raise capital",
        },
      },
    ),
    learnPanel(
      "capital-tradeoff",
      "More cash usually means less ownership kept",
      "Use the slider once. Raising more money often means selling more ownership.",
      {
        eyebrow: "Learn",
        activityKind: "funding-simulator",
        activityStartValue: 72,
        noteLabel: "What this means",
        note: "Issuing shares is a financing decision. It brings in resources, but it also dilutes ownership.",
      },
    ),
    learnPanel(
      "capital-use",
      "Capital is for growth, not guarantees",
      "Sort realistic uses of capital away from fake promises.",
      {
        eyebrow: "Lock-in",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Growth use", "False promise"],
          cards: [
            { id: "hire-team", label: "Hire more people", target: "Growth use" },
            { id: "new-product", label: "Build new products", target: "Growth use" },
            { id: "open-site", label: "Expand operations", target: "Growth use" },
            { id: "guarantee-up", label: "Guarantee the stock goes up", target: "False promise" },
            { id: "remove-risk", label: "Remove all risk", target: "False promise" },
          ],
        },
        noteLabel: "Common mistake",
        note: "Selling shares can fund growth. It never guarantees success.",
      },
    ),
  ],
  "foundations-3": [
    learnPanel(
      "market-hook",
      "A trade needs both sides",
      "A stock trade only happens when a buyer and seller meet.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "One person wants to buy shares.",
          actionLabel: "What else is needed?",
          revealTitle: "The missing side",
          revealCopy: "Someone else has to be willing to sell.",
          highlightText: "buyer and seller",
        },
      },
    ),
    learnPanel(
      "market-pressure",
      "Pressure changes when one side is more eager",
      "Move buyers and sellers once. The imbalance is what tilts price pressure.",
      {
        eyebrow: "Learn",
        activityKind: "news-chart",
        activityStartValue: 62,
        activityData: {
          variant: "pressure-balance",
          scenarios: [
            "Many eager buyers, few sellers",
            "Many sellers, weak demand",
            "Balanced interest on both sides",
          ],
        },
        noteLabel: "What this means",
        note: "More eager buyers can lift price pressure. More eager sellers can lean it down.",
      },
    ),
    learnPanel(
      "market-flow",
      "The order is interest first, trade second",
      "Build the simple flow once so the market stops feeling like a fixed-price shelf.",
      {
        eyebrow: "Lock-in",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            { id: "buyers-show", label: "Buyers show interest", description: "They decide what they will pay." },
            { id: "sellers-show", label: "Sellers show interest", description: "They decide what they will accept." },
            { id: "match-trade", label: "The market matches them", description: "When prices line up, a trade happens." },
          ],
          orderedSteps: [
            { id: "1", label: "Start" },
            { id: "2", label: "Then" },
            { id: "3", label: "Trade" },
          ],
        },
        noteLabel: "Common mistake",
        note: "Stocks are not sold off a shelf at one permanent fixed price.",
      },
    ),
  ],
  "foundations-4": [
    learnPanel(
      "pressure-hook",
      "Price pressure starts with imbalance",
      "Watch demand lean the market first. The cleanest read comes from who is stronger.",
      {
        eyebrow: "Hook",
        activityKind: "news-chart",
        activityStartValue: 60,
        activityData: {
          variant: "pressure-crowd",
          scenarios: [
            "Demand jumps after good news",
            "Heavy selling after bad results",
            "Mixed reaction, little change",
          ],
        },
      },
    ),
    learnPanel(
      "pressure-classify",
      "Up, down, and unclear are different reads",
      "Sort each situation by the pressure it creates.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Up", "Down", "Unclear"],
          cards: [
            { id: "up-case", label: "Demand jumps after good news", target: "Up" },
            { id: "down-case", label: "Heavy selling after bad results", target: "Down" },
            { id: "mixed-case", label: "Mixed reaction, little change", target: "Unclear" },
          ],
        },
        noteLabel: "What this means",
        note: "A careful reader can say the pressure is mixed instead of forcing every setup into up or down.",
      },
    ),
    learnPanel(
      "pressure-lock",
      "Unclear is still a real answer",
      "Sometimes neither side has a clean edge yet.",
      {
        eyebrow: "Lock-in",
        activityKind: "reveal-card",
        activityData: {
          statement: "Buyers and sellers are reacting in mixed ways.",
          actionLabel: "So what?",
          revealTitle: "Careful read",
          revealCopy: "The clean answer can be unclear, not forced certainty.",
          highlightText: "unclear",
        },
      },
    ),
  ],
  "foundations-6": [
    learnPanel(
      "dividend-hook",
      "Some return comes from cash",
      "A dividend is cash the company pays to shareholders. That is different from selling at a higher price.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "The company sends cash to shareholders.",
          actionLabel: "Name it",
          revealTitle: "Return type",
          revealCopy: "That cash payment is a dividend.",
          highlightText: "dividend",
        },
      },
    ),
    learnPanel(
      "dividend-compare",
      "Price gain and dividend come from different places",
      "Move the wallet and compare company cash with market-price return.",
      {
        eyebrow: "Learn",
        activityKind: "return-builder",
        activityStartValue: 60,
        activityData: {
          variant: "dividend-vs-gain",
          matches: [
            { clue: "Cash payment from the company", answer: "Dividend" },
            { clue: "You sold for more than you paid", answer: "Price gain" },
          ],
        },
        noteLabel: "What this means",
        note: "One return comes from the company. The other comes from the price you sold at.",
      },
    ),
    learnPanel(
      "dividend-lock",
      "They can happen separately",
      "A stock can pay a dividend without a big price gain, and it can rise without paying a dividend.",
      {
        eyebrow: "Lock-in",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Dividend clue", "Price gain clue"],
          cards: [
            { id: "cash-paid", label: "Cash paid to shareholders", target: "Dividend clue" },
            { id: "sold-higher", label: "You sold above your buy price", target: "Price gain clue" },
            { id: "company-payout", label: "Company sends part of earnings as cash", target: "Dividend clue" },
            { id: "market-rise", label: "The market price rose before you sold", target: "Price gain clue" },
          ],
        },
        noteLabel: "Common mistake",
        note: "They can both help shareholders, but they are not the same mechanism.",
      },
    ),
  ],
  "foundations-7": [
    learnPanel(
      "asset-hook",
      "A stock is ownership",
      "Start with the cleanest relationship first. Stock means owning part of a company.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "You bought stock in a company.",
          actionLabel: "What relationship is that?",
          revealTitle: "Core relationship",
          revealCopy: "You now own part of the business.",
          highlightText: "own part",
        },
      },
    ),
    learnPanel(
      "asset-map",
      "Stocks, bonds, and savings do different jobs",
      "Match each need to the product that fits it best so the differences feel real.",
      {
        eyebrow: "Learn",
        activityKind: "tap-sort",
        activityData: {
          buckets: ["Stock", "Bond", "Savings"],
          cards: [
            {
              id: "own-business",
              label: "You want to own part of a company",
              target: "Stock",
              description: "This is an ownership relationship, not lending or cash storage.",
            },
            {
              id: "lend-money",
              label: "You want fixed interest and repayment",
              target: "Bond",
              description: "This is a lending relationship.",
            },
            {
              id: "park-cash",
              label: "You want to hold cash in an account",
              target: "Savings",
              description: "This is about storing cash safely and staying liquid.",
            },
          ],
        },
        noteLabel: "What this means",
        note: "Different products answer different needs. They should not all feel interchangeable.",
      },
    ),
    learnPanel(
      "asset-lock",
      "Do not ask one product to behave like another",
      "Sort the language into the right relationship so the product stops feeling abstract.",
      {
        eyebrow: "Lock-in",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Ownership language", "Lending language", "Cash storage language"],
          cards: [
            { id: "piece-business", label: "Own a piece of the business", target: "Ownership language" },
            { id: "interest-repayment", label: "Expect fixed interest and repayment", target: "Lending language" },
            { id: "deposit-cash", label: "Hold cash in an account", target: "Cash storage language" },
          ],
        },
        noteLabel: "Common mistake",
        note: "A lot of beginner confusion comes from expecting ownership assets to act like savings products.",
      },
    ),
  ],
  "foundations-8": [
    learnPanel(
      "news-hook",
      "Prices react when expectations change",
      "Tap the headlines and watch the outlook shift before you label anything.",
      {
        eyebrow: "Hook",
        activityKind: "news-chart",
        activityStartValue: 40,
        activityData: {
          variant: "expectation-meter",
          headlines: [
            "Sales beat expectations",
            "Product recall announced",
            "New market expansion",
            "Costs jumped unexpectedly",
          ],
        },
      },
    ),
    learnPanel(
      "news-sort",
      "The market is reacting to the change in outlook",
      "Sort the headlines by how they change expectations.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Improves outlook", "Weakens outlook", "Mixed"],
          cards: [
            { id: "beat-sales", label: "Sales beat expectations", target: "Improves outlook" },
            { id: "recall", label: "Product recall announced", target: "Weakens outlook" },
            { id: "expansion", label: "New market expansion", target: "Improves outlook" },
            { id: "cost-jump", label: "Costs jumped unexpectedly", target: "Weakens outlook" },
            { id: "mixed-margin", label: "Sales rose, but margins shrank", target: "Mixed" },
          ],
        },
        noteLabel: "What this means",
        note: "The key word is expectations. Markets react to what changed in the future view.",
      },
    ),
    learnPanel(
      "news-lock",
      "Good news is not a guaranteed jump",
      "A stronger outlook can help the stock, but the next move is never automatic.",
      {
        eyebrow: "Lock-in",
        activityKind: "reveal-card",
        activityData: {
          statement: "The company reports strong results.",
          actionLabel: "So the stock must jump?",
          revealTitle: "Careful read",
          revealCopy: "The outlook may improve, but the price move is never guaranteed.",
          highlightText: "never guaranteed",
        },
      },
    ),
  ],
  "foundations-9": [
    learnPanel(
      "mindset-hook",
      "Good beginners observe first",
      "The first move is not prediction. It is careful observation.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "A stock makes a big move.",
          actionLabel: "First move?",
          revealTitle: "Start here",
          revealCopy: "Observe what happened before you predict what happens next.",
          highlightText: "Observe",
        },
      },
    ),
    learnPanel(
      "mindset-order",
      "Careful analysis has an order",
      "Build the workflow one move at a time so the process feels automatic.",
      {
        eyebrow: "Learn",
        activityKind: "checklist",
        activityData: {
          orderedItems: [
            { id: "observe", label: "Observe", detail: "See what is there before you explain it." },
            { id: "chart", label: "Check the chart", detail: "Read the visible price behavior." },
            { id: "business", label: "Check the business context", detail: "Add the company lens next." },
            { id: "change", label: "Ask what changed", detail: "Look for the shift in expectations." },
            { id: "careful", label: "Form a careful interpretation", detail: "Only now is it time to summarize." },
          ],
        },
        noteLabel: "What this means",
        note: "Evidence comes before confidence.",
      },
    ),
    learnPanel(
      "mindset-language",
      "Careful language sounds different",
      "Sort the statements by whether they stay evidence-first or jump to certainty.",
      {
        eyebrow: "Lock-in",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Careful", "Careless"],
          cards: [
            { id: "observe-first", label: "Observe first and stay careful", target: "Careful" },
            { id: "one-signal", label: "One signal tells me everything", target: "Careless" },
            { id: "future-known", label: "I already know the future", target: "Careless" },
            { id: "separate-confidence", label: "Separate evidence from confidence", target: "Careful" },
          ],
        },
        noteLabel: "Common mistake",
        note: "Fast certainty feels good, but it usually hides weak thinking.",
      },
    ),
  ],
  "chart-basics-2": [
    learnPanel(
      "time-hook",
      "The right edge is the newest part",
      "A chart unfolds from left to right. The newest visible point usually sits on the right edge.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "You are looking at a stock chart.",
          actionLabel: "Where is the newest point?",
          revealTitle: "Time direction",
          revealCopy: "The chart usually gets more recent as you move right.",
          highlightText: "move right",
        },
      },
    ),
    learnPanel(
      "time-order",
      "Rebuild the chart history in order",
      "Put the snapshots from earliest to latest so the time flow feels obvious.",
      {
        eyebrow: "Learn",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            {
              id: "early-snapshot",
              label: "Snapshot A",
              description: "Shortest chart view. Only the first part of the move has appeared.",
              points: [28, 38, 34, 46],
            },
            {
              id: "middle-snapshot",
              label: "Snapshot B",
              description: "More of the path is visible, including a middle pullback.",
              points: [28, 38, 34, 46, 58, 52],
            },
            {
              id: "late-snapshot",
              label: "Snapshot C",
              description: "The line stretches farthest right and ends after the strongest rise.",
              points: [28, 38, 34, 46, 58, 52, 70, 82],
            },
          ],
          orderedSteps: [
            { id: "slot-1", label: "Earliest" },
            { id: "slot-2", label: "Middle" },
            { id: "slot-3", label: "Latest" },
          ],
        },
      },
    ),
    learnPanel(
      "time-reveal",
      "More of the line means later time",
      "Scrub forward and watch the path extend to the right.",
      {
        eyebrow: "Lock-in",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [28, 38, 34, 46, 58, 52, 70, 82],
          summaryChoices: ["Earlier → later", "Later → earlier", "Top → bottom"],
        },
        noteLabel: "Common mistake",
        note: "If you read the chart backward, you reverse the story before you even start.",
      },
    ),
  ],
  "chart-basics-3": [
    learnPanel(
      "price-hook",
      "Higher on the chart usually means higher price",
      "Tap the two points and compare their height before you read the label.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "point-compare",
          points: ["Lower point", "Higher point"],
          lowIndex: 1,
          highIndex: 5,
          chartPoints: [18, 26, 34, 52, 61, 78],
        },
      },
    ),
    learnPanel(
      "price-lock",
      "Higher is about price, not recency",
      "A point can be higher without being newer. Vertical height and left-to-right time are different signals.",
      {
        eyebrow: "Learn",
        activityKind: "reveal-card",
        activityData: {
          statement: "One point sits higher, but another point is later in time.",
          actionLabel: "What changed?",
          revealTitle: "Separate the signals",
          revealCopy: "Height tells you price. Left-to-right position tells you time.",
          highlightText: "price",
        },
      },
    ),
    learnPanel(
      "price-mistake",
      "Do not mix the axes together",
      "Good chart reading keeps vertical price and horizontal time separate from the start.",
      {
        eyebrow: "Lock-in",
        highlights: [
          "Higher point = higher price.",
          "Right side = later time.",
          "Those clues answer different questions.",
        ],
        noteLabel: "Common mistake",
        note: "If you merge those two meanings together, the chart becomes misleading fast.",
      },
    ),
  ],
  "chart-basics-5": [
    learnPanel(
      "direction-hook",
      "Start with the net path",
      "A chart can wiggle and still be mostly rising, mostly falling, or mostly flat.",
      {
        eyebrow: "Hook",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [48, 52, 46, 54, 50, 49],
          summaryChoices: ["Little net movement", "Strong trend", "Guaranteed breakout"],
        },
      },
    ),
    learnPanel(
      "direction-compare",
      "The label comes from the whole path",
      "Sort the charts by net direction, not by the loudest wiggle.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Rising", "Falling", "Flat"],
          cards: [
            { id: "rise-card", label: "Up with pauses", points: [18, 30, 24, 42, 38, 58], target: "Rising" },
            { id: "flat-card", label: "Mostly sideways", points: [48, 52, 46, 54, 50, 49], target: "Flat" },
            { id: "fall-card", label: "Lower with bounces", points: [74, 66, 70, 58, 52, 44], target: "Falling" },
          ],
        },
        noteLabel: "What this means",
        note: "Direction is a net read. It is not a vote about the noisiest candle.",
      },
    ),
    learnPanel(
      "direction-lock",
      "One spike does not own the whole label",
      "The full path matters more than one dramatic moment.",
      {
        eyebrow: "Lock-in",
        activityKind: "reveal-card",
        activityData: {
          statement: "A chart has one dramatic spike.",
          actionLabel: "Does that decide everything?",
          revealTitle: "Better habit",
          revealCopy: "No. The direction label should still come from the whole path.",
          highlightText: "whole path",
        },
      },
    ),
  ],
  "chart-basics-7": [
    learnPanel(
      "pace-hook",
      "Steeper usually means faster",
      "Two moves can go the same direction and still move at different speeds.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "Both chart segments are rising.",
          actionLabel: "What makes one faster?",
          revealTitle: "Pace clue",
          revealCopy: "The steeper rise usually shows faster movement.",
          highlightText: "steeper rise",
        },
      },
    ),
    learnPanel(
      "pace-rank",
      "Rank the moves by pace",
      "Use the slopes, not the direction word, to order the rises from slowest to fastest.",
      {
        eyebrow: "Learn",
        activityKind: "sequence-lab",
        activityData: {
          steps: [
            {
              id: "gentle-rise",
              label: "Gentle rise",
              description: "Still climbing, but with a shallow slope.",
              points: [34, 38, 42, 46, 51, 56],
            },
            {
              id: "medium-rise",
              label: "Medium rise",
              description: "A clearer climb with stronger pace.",
              points: [26, 34, 42, 52, 63, 74],
            },
            {
              id: "steep-rise",
              label: "Steep rise",
              description: "Much more vertical movement in the same span.",
              points: [14, 28, 46, 64, 82, 92],
            },
          ],
        },
      },
    ),
    learnPanel(
      "pace-lock",
      "Direction and speed are not the same",
      "Seeing “up” is only step one. Pace asks how forcefully price moved there.",
      {
        eyebrow: "Lock-in",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Faster pace", "Slower pace"],
          cards: [
            { id: "steep-card", label: "Steeper rise", points: [18, 30, 48, 66, 84], target: "Faster pace" },
            { id: "flat-card", label: "Flatter rise", points: [36, 40, 45, 49, 54], target: "Slower pace" },
          ],
        },
        noteLabel: "Common mistake",
        note: "Many beginners stop at direction and never read the speed of the move.",
      },
    ),
  ],
  "chart-basics-9": [
    learnPanel(
      "history-hook",
      "A chart is history first",
      "A useful chart read starts by describing what happened, not by promising what happens next.",
      {
        eyebrow: "Hook",
        activityKind: "reveal-card",
        activityData: {
          statement: "This chart rose over time.",
          actionLabel: "What can you really say?",
          revealTitle: "Careful read",
          revealCopy: "You can say it rose. You cannot say the future is guaranteed.",
          highlightText: "not guaranteed",
        },
      },
    ),
    learnPanel(
      "history-sort",
      "Careful statements sound different",
      "Sort the chart interpretations by whether they describe history or overclaim the future.",
      {
        eyebrow: "Learn",
        activityKind: "bucket-sort",
        activityData: {
          buckets: ["Careful", "Overconfident"],
          cards: [
            { id: "careful-history", label: "The chart shows what happened, but future moves still need context.", target: "Careful" },
            { id: "must-rise", label: "The chart rose, so it must rise forever.", target: "Overconfident" },
            { id: "no-uncertainty", label: "No uncertainty remains.", target: "Overconfident" },
          ],
        },
        noteLabel: "What this means",
        note: "Charts are useful without becoming certainty machines.",
      },
    ),
    learnPanel(
      "history-trace",
      "Observation comes before confidence",
      "Trace the move once, then keep the careful sentence.",
      {
        eyebrow: "Lock-in",
        activityKind: "chart-lab",
        activityData: {
          variant: "trace-path",
          chartPoints: [18, 26, 44, 52, 60, 72],
          summaryChoices: [
            "Mostly rising over time",
            "Guaranteed to keep rising",
            "No uncertainty remains",
          ],
        },
        noteLabel: "Common mistake",
        note: "The most common chart-reading mistake is turning a summary into a promise.",
      },
    ),
  ],
};

const normalizedTargetPracticePatches: Record<
  string,
  Partial<PracticeContent>
> = {
  "foundations-3": {
    mechanicTitle: "Pressure sort",
    mechanicSummary: "Sort each situation by whether buying pressure, selling pressure, or balance is stronger.",
    prompt: "Place each market setup in the right pressure bucket.",
    question: "",
    activityKind: "bucket-sort",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Sort every setup first",
    activityData: {
      buckets: ["Buying pressure", "Selling pressure", "Balanced"],
      cards: [
        { id: "buyers", label: "Many eager buyers, few sellers", target: "Buying pressure" },
        { id: "sellers", label: "Many sellers, weak demand", target: "Selling pressure" },
        { id: "equal", label: "Equal interest on both sides", target: "Balanced" },
        { id: "demand-jump", label: "Demand surges after good news", target: "Buying pressure" },
      ],
    },
    options: [],
    explanation: "When buyers are more eager than sellers, upward pressure gets stronger.",
  },
  "foundations-4": {
    mechanicTitle: "Pressure outcomes",
    mechanicSummary: "Sort each situation into up, down, or unclear before you try to summarize it.",
    prompt: "Place each pressure setup in the right outcome bucket.",
    question: "",
    activityKind: "bucket-sort",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Sort every setup first",
    activityData: {
      buckets: ["Up", "Down", "Unclear"],
      cards: [
        { id: "good-news", label: "Demand jumps after good news", target: "Up" },
        { id: "bad-news", label: "Heavy selling after bad results", target: "Down" },
        { id: "mixed-news", label: "Good and bad clues arrive together", target: "Unclear" },
        { id: "tight-supply", label: "Buyers outnumber sellers", target: "Up" },
      ],
    },
    options: [],
    explanation: "Price pressure comes from the imbalance, and mixed evidence can stay unclear.",
  },
  "foundations-6": {
    mechanicTitle: "Return type sort",
    mechanicSummary: "Sort each clue into dividend or price gain without mixing them together.",
    prompt: "Place each clue in the right return bucket.",
    question: "",
    activityKind: "bucket-sort",
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Sort every clue first",
    activityData: {
      buckets: ["Dividend", "Price gain"],
      cards: [
        { id: "cash-paid", label: "Cash paid to shareholders", target: "Dividend" },
        { id: "sold-higher", label: "You sold above your buy price", target: "Price gain" },
        { id: "company-payout", label: "Company sends part of earnings as cash", target: "Dividend" },
        { id: "market-rise", label: "The stock rose before you sold", target: "Price gain" },
      ],
    },
    options: [],
    explanation: "Dividend and price gain can both help shareholders, but they come from different places.",
  },
  "foundations-7": {
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Sort every description first",
    question: "",
    options: [],
  },
  "chart-basics-5": {
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Sort every chart first",
    question: "",
    options: [],
  },
  "chart-basics-9": {
    useActivityAsPractice: true,
    actionLabel: "Continue to check",
    readinessLabel: "Sort every statement first",
    question: "",
    options: [],
  },
};

const normalizedTargetCheckPatches: Record<string, Partial<CheckContent>> = {
  "foundations-4": {
    question: "Pressure check",
    type: "multiple",
    variant: "rapid-fire",
    rapidFireCases: [
      {
        id: "up-pressure",
        prompt: "Demand jumps while supply stays tight",
        options: [
          choice("a", "Up", true, ""),
          choice("b", "Down", false, "price-pressure", "That setup leans upward, not downward."),
          choice("c", "Unclear", false, "price-pressure", "This one has a cleaner upward imbalance than that."),
        ],
        explanation: "Stronger demand with tight supply leans upward.",
        reviewPrompt: "price-pressure",
      },
      {
        id: "down-pressure",
        prompt: "Sellers rush out after weak results",
        options: [
          choice("a", "Unclear", false, "price-pressure", "This one leans more clearly downward."),
          choice("b", "Down", true, ""),
          choice("c", "Up", false, "price-pressure", "Heavy selling is not the upward case."),
        ],
        explanation: "Heavy selling after weak results leans downward.",
        reviewPrompt: "price-pressure",
      },
      {
        id: "mixed-pressure",
        prompt: "Some buyers step in, but sellers keep pushing back",
        options: [
          choice("a", "Down", false, "price-pressure", "That forces the read too hard."),
          choice("b", "Up", false, "price-pressure", "That also overstates the setup."),
          choice("c", "Unclear", true, ""),
        ],
        explanation: "Mixed pressure can stay unclear.",
        reviewPrompt: "price-pressure",
      },
    ],
    options: [],
    explanation: "Read the imbalance first, then name the likely pressure.",
    reviewPrompt: "price-pressure",
  },
  "foundations-6": {
    question: "Return type check",
    type: "multiple",
    variant: "rapid-fire",
    rapidFireCases: [
      {
        id: "dividend-case",
        prompt: "The company sends cash to shareholders",
        options: [
          choice("a", "Dividend", true, ""),
          choice("b", "Price gain", false, "dividends-vs-price-gain", "That is company cash, not a sale outcome."),
          choice("c", "Break-even", false, "dividends-vs-price-gain", "Break-even is about buy and sell price matching."),
        ],
        explanation: "Cash from the company is a dividend.",
        reviewPrompt: "dividends-vs-price-gain",
      },
      {
        id: "price-gain-case",
        prompt: "You sold for more than you paid",
        options: [
          choice("a", "Price gain", true, ""),
          choice("b", "Dividend", false, "dividends-vs-price-gain", "A dividend is cash paid by the company."),
          choice("c", "Savings interest", false, "dividends-vs-price-gain", "That is a different product entirely."),
        ],
        explanation: "Selling above your buy price is a price gain.",
        reviewPrompt: "dividends-vs-price-gain",
      },
      {
        id: "same-price-case",
        prompt: "You sold at the same price you bought",
        options: [
          choice("a", "Dividend", false, "dividends-vs-price-gain", "No company cash was described."),
          choice("b", "Price gain", false, "dividends-vs-price-gain", "There is no price gain if buy and sell are the same."),
          choice("c", "Break-even", true, ""),
        ],
        explanation: "Same buy and sell price means break-even.",
        reviewPrompt: "dividends-vs-price-gain",
      },
    ],
    options: [],
    explanation: "Keep company cash, sale price, and break-even separate.",
    reviewPrompt: "dividends-vs-price-gain",
  },
  "chart-basics-5": {
    question: "Direction check",
    type: "multiple",
    variant: "rapid-fire",
    rapidFireCases: [
      {
        id: "rise-case",
        prompt: "The chart finishes clearly above where it started",
        options: [
          choice("a", "Rising", true, ""),
          choice("b", "Flat", false, "direction-classification", "That is more than little net movement."),
          choice("c", "Falling", false, "direction-classification", "That is the opposite direction."),
        ],
        explanation: "Finishing clearly higher is the rising case.",
        reviewPrompt: "direction-classification",
      },
      {
        id: "flat-case",
        prompt: "The chart wiggles but ends near where it began",
        options: [
          choice("a", "Falling", false, "direction-classification", "That overstates the move."),
          choice("b", "Flat", true, ""),
          choice("c", "Rising", false, "direction-classification", "That also overstates the move."),
        ],
        explanation: "Little net movement is the flat case.",
        reviewPrompt: "direction-classification",
      },
      {
        id: "fall-case",
        prompt: "The chart keeps stepping lower overall",
        options: [
          choice("a", "Flat", false, "direction-classification", "This one has clearer downward direction than that."),
          choice("b", "Falling", true, ""),
          choice("c", "Rising", false, "direction-classification", "That is the opposite read."),
        ],
        explanation: "A lower overall path is the falling case.",
        reviewPrompt: "direction-classification",
      },
    ],
    options: [],
    explanation: "Use the net path, not the loudest wiggle.",
    reviewPrompt: "direction-classification",
  },
  "chart-basics-7": {
    question: "Pace check",
    type: "multiple",
    variant: "rapid-fire",
    rapidFireCases: [
      {
        id: "fast-case",
        prompt: "Which move looks faster?",
        options: [
          choice("a", "The steeper rise", true, ""),
          choice("b", "The flatter rise", false, "slope-and-pace", "Flatter usually means slower pace."),
          choice("c", "They are always equal", false, "slope-and-pace", "Direction can match even when pace does not."),
        ],
        explanation: "Steeper usually means faster movement.",
        reviewPrompt: "slope-and-pace",
      },
      {
        id: "same-direction-case",
        prompt: "Two charts both rise. What should you compare next?",
        options: [
          choice("a", "The slope or pace", true, ""),
          choice("b", "Whether the word “up” appears", false, "slope-and-pace", "The chart itself gives the pace clue."),
          choice("c", "Nothing else", false, "slope-and-pace", "Direction is not the only clue."),
        ],
        explanation: "After direction, compare pace.",
        reviewPrompt: "slope-and-pace",
      },
      {
        id: "slow-case",
        prompt: "A rise is shallow and gradual. What is the cleaner read?",
        options: [
          choice("a", "Slower move", true, ""),
          choice("b", "Fastest move", false, "slope-and-pace", "Shallow usually means slower, not fastest."),
          choice("c", "No chart exists", false, "slope-and-pace", "The slope is still readable."),
        ],
        explanation: "A shallow rise usually reads as slower pace.",
        reviewPrompt: "slope-and-pace",
      },
    ],
    options: [],
    explanation: "Pace comes from how quickly price covers ground, not just from the direction label.",
    reviewPrompt: "slope-and-pace",
  },
};

for (const [lessonId, panels] of Object.entries(normalizedTargetLearnPanelsByLesson)) {
  const lesson = authoredLessonExperiences[lessonId];

  if (lesson) {
    lesson.learn.panels = panels;
  }
}

for (const [lessonId, patch] of Object.entries(normalizedTargetPracticePatches)) {
  const lesson = authoredLessonExperiences[lessonId];

  if (lesson) {
    Object.assign(lesson.practice, patch);
  }
}

for (const [lessonId, patch] of Object.entries(normalizedTargetCheckPatches)) {
  const lesson = authoredLessonExperiences[lessonId];

  if (lesson) {
    Object.assign(lesson.check, patch);
  }
}

for (const [lessonId, lesson] of Object.entries(authoredLessonExperiences)) {
  if (
    !lessonId.startsWith("foundations-") &&
    !lessonId.startsWith("chart-basics-")
  ) {
    continue;
  }

  if (lesson.practice.activityKind === "bucket-sort") {
    lesson.practice.activityKind = "tap-sort";
  }

  lesson.learn.panels?.forEach((panel) => {
    if (panel.activityKind === "bucket-sort") {
      panel.activityKind = "tap-sort";
    }
  });
}
