import type { CourseLesson, CourseModule } from "../data/course-data";
import type { AuthoredLessonExperience } from "../data/authored-lessons";
import {
  checkContent,
  learnContent,
  practiceContent,
  type CheckContent,
  type LearnContent,
  type PracticeContent,
} from "./course-data";

export type LessonExperience = {
  objective?: string;
  rewardLine?: string;
  masteryTags?: string[];
  check: CheckContent;
  learn: LearnContent;
  practice: PracticeContent;
};

function cloneLearnPanels(panels?: LearnContent["panels"]) {
  return panels?.map((panel) => ({
    ...panel,
    highlights: panel.highlights ? [...panel.highlights] : undefined,
    activityData: panel.activityData ? { ...panel.activityData } : undefined,
  }));
}

type ThemeConfig = {
  visual: LearnContent["visual"];
  activityKind: PracticeContent["activityKind"];
  learnLead: string;
  whatThisMeans: string;
  commonMistake: string;
  labMoment: string;
  supportActivities: string[];
  practiceSummary: string;
  practicePrompt: string;
  practiceQuestion: string;
  practiceOptions: PracticeContent["options"];
  practiceExplanation: string;
  checkQuestion: string;
  checkOptions?: CheckContent["options"];
  checkCorrectAnswer?: CheckContent["correctAnswer"];
  checkType: CheckContent["type"];
  checkExplanation: string;
  reviewPrompt: string;
};

let authoredExperienceCache: Record<string, AuthoredLessonExperience> | null =
  null;
let authoredExperiencePromise:
  | Promise<Record<string, AuthoredLessonExperience>>
  | null = null;

async function loadAuthoredExperiences() {
  if (authoredExperienceCache) {
    return authoredExperienceCache;
  }

  if (!authoredExperiencePromise) {
    authoredExperiencePromise = Promise.all([
      import("../data/authored-lessons"),
      import("../data/authored-lessons-advanced"),
      import("../data/authored-lessons-synthesis"),
    ]).then(([core, advanced, synthesis]) => {
      authoredExperienceCache = {
        ...core.authoredLessonExperiences,
        ...advanced.advancedAuthoredLessonExperiences,
        ...synthesis.synthesisAuthoredLessonExperiences,
      };
      return authoredExperienceCache;
    });
  }

  return authoredExperiencePromise;
}

const moduleThemes: Record<string, ThemeConfig> = {
  "chart-basics": {
    visual: "sandbox",
    activityKind: "chart-lab",
    learnLead:
      "A chart is a compact picture of price and time. It helps beginners slow down, zoom out, and see behavior instead of reacting to one dramatic move.",
    whatThisMeans:
      "Charts show context first. One candle or one spike never tells the whole story by itself.",
    commonMistake:
      "Beginners often zoom in too far and treat a tiny move like a major signal without checking the larger chart structure.",
    labMoment:
      "Use the chart lab to compare movement labels, zoom levels, and simple pattern shapes before making a judgment.",
    supportActivities: [
      "Compare a quiet chart with a choppy chart.",
      "Label the chart as steady, volatile, trend, or pullback.",
      "Zoom out before choosing the cleanest interpretation.",
    ],
    practiceSummary:
      "Work with chart labels and movement patterns until the picture feels easier to read.",
    practicePrompt:
      "The goal is not prediction. The goal is recognizing what the chart is actually showing you.",
    practiceQuestion: "Which habit helps a beginner read a chart more clearly?",
    practiceOptions: [
      {
        id: "a",
        text: "Zooming out for context before reacting",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Judging the stock from one sharp candle",
        correct: false,
        reviewPrompt: "Review why chart context matters more than one dramatic move.",
      },
      {
        id: "c",
        text: "Ignoring timeframes completely",
        correct: false,
        reviewPrompt: "Go back to how charts combine price and time together.",
      },
    ],
    practiceExplanation:
      "Correct. A clean chart read starts with context, timeframe, and structure before any snap conclusion.",
    checkType: "multiple",
    checkQuestion: "A stock chart mainly helps you see:",
    checkOptions: [
      {
        id: "a",
        text: "How price moved across time",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Guaranteed future returns",
        correct: false,
        reviewPrompt: "Review what charts show versus what they cannot guarantee.",
      },
      {
        id: "c",
        text: "The CEO's personal opinions",
        correct: false,
        reviewPrompt: "Go back to the idea that charts are price-and-time tools.",
      },
    ],
    checkExplanation:
      "Exactly. Charts help you observe price action through time, not promise what happens next.",
    reviewPrompt: "Review the chart basics lesson and focus on price plus time.",
  },
  "trend-and-momentum": {
    visual: "timeline",
    activityKind: "timeline",
    learnLead:
      "Trend tells you direction. Momentum tells you how strongly price is moving in that direction. They are related, but they are not the same thing.",
    whatThisMeans:
      "A strong trend often shows consistent movement, while momentum hints at whether that move still has force behind it.",
    commonMistake:
      "Beginners often assume a strong move means it will continue forever, even when momentum is fading.",
    labMoment:
      "Use the slider to compare slower, steadier movement with faster, more forceful movement and notice how the feel changes.",
    supportActivities: [
      "Compare uptrend, downtrend, and sideways movement.",
      "Notice when movement looks strong versus tired.",
      "Separate direction from speed and urgency.",
    ],
    practiceSummary:
      "Move along the timeline and compare what feels patient, forceful, weak, or stretched.",
    practicePrompt:
      "You are building intuition for whether price is climbing smoothly or surging with extra force.",
    practiceQuestion: "Momentum is best described as:",
    practiceOptions: [
      {
        id: "a",
        text: "The strength behind a move",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "A guarantee the move keeps going",
        correct: false,
        reviewPrompt: "Review why strong movement still needs context and can fade.",
      },
      {
        id: "c",
        text: "The company’s annual revenue",
        correct: false,
        reviewPrompt: "Go back to the distinction between chart behavior and company fundamentals.",
      },
    ],
    practiceExplanation:
      "Right. Momentum is about the force or urgency behind the move, not a certainty about the future.",
    checkType: "truefalse",
    checkQuestion: "A stock can stay in an uptrend even while momentum weakens.",
    checkCorrectAnswer: true,
    checkExplanation:
      "Yes. Direction and momentum are different. A trend can continue even as the move loses strength.",
    reviewPrompt: "Revisit the lesson on trend versus momentum and compare direction with force.",
  },
  "support-and-resistance": {
    visual: "sandbox",
    activityKind: "chart-lab",
    learnLead:
      "Support and resistance are zones where price has reacted before. They help beginners organize the chart, not control it.",
    whatThisMeans:
      "These levels suggest areas worth attention because buyers or sellers showed up there before.",
    commonMistake:
      "A level is not a promise. Support can fail and resistance can break, especially when context changes.",
    labMoment:
      "Use the chart labels to compare clean reaction zones with noisy areas that only look important at first glance.",
    supportActivities: [
      "Mark likely support zones rather than razor-thin lines.",
      "Compare repeated reactions versus random noise.",
      "Notice where price previously stalled or bounced.",
    ],
    practiceSummary:
      "Use chart labels to test whether you are spotting a real reaction zone or just forcing a line onto the chart.",
    practicePrompt:
      "The goal is to build calm pattern recognition, not to pretend a single line can predict everything.",
    practiceQuestion: "Support or resistance is most useful as:",
    practiceOptions: [
      {
        id: "a",
        text: "A zone worth paying attention to",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "A guaranteed turning point",
        correct: false,
        reviewPrompt: "Review why these areas help with context but never promise a bounce or rejection.",
      },
      {
        id: "c",
        text: "A company earnings metric",
        correct: false,
        reviewPrompt: "Go back to the chart context and keep it separate from company numbers.",
      },
    ],
    practiceExplanation:
      "Correct. These zones help you focus attention on important areas, but they are not guarantees.",
    checkType: "truefalse",
    checkQuestion: "Support always holds if enough traders are watching it.",
    checkCorrectAnswer: false,
    checkExplanation:
      "False. Support is an area of interest, not a law of nature. It can fail when selling pressure takes over.",
    reviewPrompt: "Review the lesson on support and resistance as zones, not certainties.",
  },
  "breakouts-and-volume": {
    visual: "news",
    activityKind: "news-chart",
    learnLead:
      "Breakouts matter more when the move has conviction behind it. Volume helps beginners see whether attention and participation increased with the move.",
    whatThisMeans:
      "A breakout with stronger participation can feel more meaningful than a move that drifts through a level quietly.",
    commonMistake:
      "A breakout does not guarantee more upside. False breakouts happen, and weak volume can be a warning.",
    labMoment:
      "Use the demand slider and mini chart reaction to compare stronger participation with weaker follow-through.",
    supportActivities: [
      "Compare strong and weak breakout attempts.",
      "Notice how participation can confirm or weaken the move.",
      "Watch how a breakout can still fail after the first push.",
    ],
    practiceSummary:
      "You are testing what changes when price moves through a level with more or less participation behind it.",
    practicePrompt:
      "The point is not to chase the breakout. The point is to read the quality of the move.",
    practiceQuestion: "Volume is most useful during a breakout because it can:",
    practiceOptions: [
      {
        id: "a",
        text: "Show whether participation increased with the move",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Guarantee the breakout succeeds",
        correct: false,
        reviewPrompt: "Review why stronger volume can help confirm attention without guaranteeing follow-through.",
      },
      {
        id: "c",
        text: "Replace chart context completely",
        correct: false,
        reviewPrompt: "Go back to the idea that volume supports context rather than replacing it.",
      },
    ],
    practiceExplanation:
      "Exactly. Volume can help you judge the quality of the move, but it does not remove uncertainty.",
    checkType: "multiple",
    checkQuestion: "A false breakout means:",
    checkOptions: [
      {
        id: "a",
        text: "Price pushed through a level and then failed to hold it",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "The chart is no longer useful",
        correct: false,
        reviewPrompt: "Review how failed moves still teach you something about the market.",
      },
      {
        id: "c",
        text: "Volume never matters",
        correct: false,
        reviewPrompt: "Go back to the lesson and compare confirmation with certainty.",
      },
    ],
    checkExplanation:
      "Right. A false breakout is when price moves through a level but cannot maintain that move.",
    reviewPrompt: "Review the breakout lesson and compare confirmation versus guarantee.",
  },
  "business-fundamentals": {
    visual: "checklist",
    activityKind: "checklist",
    learnLead:
      "A stock is tied to a real business. Before reading numbers or chart setups, beginners should understand what the company sells, who it serves, and why it might matter.",
    whatThisMeans:
      "The market may price expectations quickly, but long-term confidence still depends on understanding the business itself.",
    commonMistake:
      "Beginners sometimes learn the ticker before learning the business, which leads to shallow conviction and weak questions.",
    labMoment:
      "Use the checklist to start with the business model, customer, and risk questions that matter most first.",
    supportActivities: [
      "Start with what the company sells.",
      "Identify who pays the company and why.",
      "Separate excitement from actual business quality.",
    ],
    practiceSummary:
      "The checklist keeps the lesson grounded in the business before the market story takes over.",
    practicePrompt:
      "Ask simple, durable questions first so the stock stops feeling abstract.",
    practiceQuestion: "A strong first business question is:",
    practiceOptions: [
      {
        id: "a",
        text: "How does the company make money?",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Is the stock popular this week?",
        correct: false,
        reviewPrompt: "Review why business understanding comes before hype and short-term noise.",
      },
      {
        id: "c",
        text: "Is the logo memorable?",
        correct: false,
        reviewPrompt: "Go back to the checklist and focus on business mechanics first.",
      },
    ],
    practiceExplanation:
      "Correct. You build better stock judgment when you begin with how the business works.",
    checkType: "truefalse",
    checkQuestion: "A great company can still become a bad stock at the wrong price.",
    checkCorrectAnswer: true,
    checkExplanation:
      "Yes. Business quality and stock price are related, but they are not identical decisions.",
    reviewPrompt: "Revisit the business fundamentals lesson and separate company quality from stock price.",
  },
  "market-cap-and-revenue": {
    visual: "marketcap",
    activityKind: "market-cap-board",
    learnLead:
      "Market cap helps you measure size, while revenue helps you understand how much business activity the company is generating. Together they give better context than share price alone.",
    whatThisMeans:
      "A $20 stock can still represent a much larger company than a $200 stock if the total share count is different.",
    commonMistake:
      "Beginners often confuse low share price with cheapness and high share price with expensiveness.",
    labMoment:
      "Use the comparison board to combine price and shares outstanding, then connect that size picture with revenue growth.",
    supportActivities: [
      "Compare price with total size.",
      "Notice how revenue growth changes the story.",
      "Avoid assuming small price means small company.",
    ],
    practiceSummary:
      "This board makes company size feel more concrete by showing how shares and price work together.",
    practicePrompt:
      "Think about scale first, then ask what kind of business activity supports it.",
    practiceQuestion: "Market cap is most helpful because it shows:",
    practiceOptions: [
      {
        id: "a",
        text: "The total value of all shares together",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Only the price of one share",
        correct: false,
        reviewPrompt: "Review the formula behind market cap and why it goes beyond one share price.",
      },
      {
        id: "c",
        text: "Guaranteed company quality",
        correct: false,
        reviewPrompt: "Go back to how size and quality answer different questions.",
      },
    ],
    practiceExplanation:
      "Exactly. Market cap describes total size, which is more informative than share price alone.",
    checkType: "multiple",
    checkQuestion: "Revenue growth mainly tells you:",
    checkOptions: [
      {
        id: "a",
        text: "Whether the business is bringing in more sales over time",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "That the stock must immediately go up",
        correct: false,
        reviewPrompt: "Review why good company numbers still do not guarantee a price move.",
      },
      {
        id: "c",
        text: "How many shares exist",
        correct: false,
        reviewPrompt: "Go back to the difference between company activity and share count.",
      },
    ],
    checkExplanation:
      "Right. Revenue growth is about business sales growth, not a guarantee about the stock itself.",
    reviewPrompt: "Review market cap versus revenue and keep price, size, and business activity separate.",
  },
  "eps-and-pe-ratios": {
    visual: "marketcap",
    activityKind: "market-cap-board",
    learnLead:
      "EPS and P/E try to connect profit and price. They are useful because they give beginners a language for expectations, but they still need context.",
    whatThisMeans:
      "A higher ratio can reflect optimism, and a lower ratio can reflect caution, but neither one is automatically good or bad.",
    commonMistake:
      "Beginners often memorize a ratio as if it were a rule. Ratios only become useful when you compare them in context.",
    labMoment:
      "Use the comparison board to think about what price is asking you to pay relative to earnings power.",
    supportActivities: [
      "Compare higher and lower P/E readings.",
      "Ask what expectations might be embedded in the price.",
      "Separate useful signals from rigid rules.",
    ],
    practiceSummary:
      "This exercise makes valuation feel more conversational and less like a formula to memorize.",
    practicePrompt:
      "You are practicing interpretation, not hunting for a single perfect ratio.",
    practiceQuestion: "A P/E ratio is most useful when you:",
    practiceOptions: [
      {
        id: "a",
        text: "Use it with business context and expectations",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Treat one number as a final verdict",
        correct: false,
        reviewPrompt: "Review why P/E becomes more useful with context instead of as a rigid rule.",
      },
      {
        id: "c",
        text: "Ignore earnings completely",
        correct: false,
        reviewPrompt: "Go back to the relationship between price and earnings.",
      },
    ],
    practiceExplanation:
      "Correct. Ratios are decision aids, not absolute commands.",
    checkType: "truefalse",
    checkQuestion: "A high P/E ratio is always bad for a beginner stock review.",
    checkCorrectAnswer: false,
    checkExplanation:
      "False. A high P/E can reflect growth expectations, not automatically a poor opportunity.",
    reviewPrompt: "Review EPS and P/E with a focus on context over rigid rules.",
  },
  "putting-it-together": {
    visual: "checklist",
    activityKind: "checklist",
    learnLead:
      "Putting it together means moving through a calm beginner workflow: business first, chart second, numbers third, and uncertainty always acknowledged.",
    whatThisMeans:
      "A good beginner walkthrough is organized. It does not confuse one good signal with total confidence.",
    commonMistake:
      "People often jump to a conclusion before gathering business context, chart context, and number context together.",
    labMoment:
      "Use the checklist to assemble a balanced beginner summary instead of a hype-driven conclusion.",
    supportActivities: [
      "Start with the business story.",
      "Then read the chart structure.",
      "Then check whether the numbers support the story.",
    ],
    practiceSummary:
      "The goal is to build a repeatable sequence for your thinking so analysis feels calmer and cleaner.",
    practicePrompt:
      "You are not trying to sound advanced. You are trying to be systematic and honest.",
    practiceQuestion: "A balanced beginner workflow usually starts with:",
    practiceOptions: [
      {
        id: "a",
        text: "Understanding the business first",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Choosing a target price immediately",
        correct: false,
        reviewPrompt: "Review the importance of context before jumping to a conclusion.",
      },
      {
        id: "c",
        text: "Assuming the chart explains everything",
        correct: false,
        reviewPrompt: "Go back to the multi-part workflow that combines business, chart, and numbers.",
      },
    ],
    practiceExplanation:
      "Exactly. Business understanding gives the rest of the walkthrough a cleaner foundation.",
    checkType: "multiple",
    checkQuestion: "Putting it together well means:",
    checkOptions: [
      {
        id: "a",
        text: "Combining business, chart, and numbers thoughtfully",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Following only one favorite metric",
        correct: false,
        reviewPrompt: "Review how each layer adds useful context to the final read.",
      },
      {
        id: "c",
        text: "Pretending uncertainty is gone",
        correct: false,
        reviewPrompt: "Go back to the idea that careful stock reading still leaves uncertainty.",
      },
    ],
    checkExplanation:
      "Right. Good beginner analysis is organized and humble, not overconfident.",
    reviewPrompt: "Review the integrated walkthrough and focus on sequence plus uncertainty.",
  },
  "final-mastery": {
    visual: "sandbox",
    activityKind: "chart-lab",
    learnLead:
      "Final mastery is not about certainty. It is about showing that you can slow down, read carefully, and explain what you see without overreaching.",
    whatThisMeans:
      "A strong beginner walkthrough identifies the business, the chart structure, the important numbers, and the remaining uncertainty.",
    commonMistake:
      "The last mistake beginners make is sounding confident when they have skipped part of the process.",
    labMoment:
      "Use the chart lab and tags to practice turning observations into a calm, careful summary.",
    supportActivities: [
      "Label the chart structure first.",
      "Mention the business and the numbers clearly.",
      "Finish with a cautious takeaway rather than a prediction.",
    ],
    practiceSummary:
      "This final interaction brings together observation, context, and careful language.",
    practicePrompt:
      "You are practicing confidence through clarity, not confidence through certainty.",
    practiceQuestion: "A strong final walkthrough sounds:",
    practiceOptions: [
      {
        id: "a",
        text: "Clear, structured, and cautious",
        correct: true,
        reviewPrompt: "",
      },
      {
        id: "b",
        text: "Certain about the exact future",
        correct: false,
        reviewPrompt: "Review why careful stock reading still leaves room for uncertainty.",
      },
      {
        id: "c",
        text: "Focused only on hype",
        correct: false,
        reviewPrompt: "Go back to the final workflow and how it combines observation with discipline.",
      },
    ],
    practiceExplanation:
      "Correct. The premium outcome here is calm confidence backed by a clear process.",
    checkType: "truefalse",
    checkQuestion: "A careful beginner stock walkthrough should still mention uncertainty.",
    checkCorrectAnswer: true,
    checkExplanation:
      "Yes. Thoughtful analysis leaves room for what you do not know yet.",
    reviewPrompt: "Review the final mastery lesson and focus on clarity without overconfidence.",
  },
};

function cloneOptions(options: PracticeContent["options"]) {
  return options.map((option) => ({ ...option }));
}

function cloneCheckOptions(options?: CheckContent["options"]) {
  return options?.map((option) => ({ ...option }));
}

function getFoundationsExperience(lesson: CourseLesson): LessonExperience {
  const authored = authoredExperienceCache?.[lesson.id];

  if (authored) {
    return {
      objective: authored.objective,
      rewardLine: authored.rewardLine,
      masteryTags: [...authored.masteryTags],
      learn: {
        ...authored.learn,
        supportActivities: [...authored.learn.supportActivities],
        panels: cloneLearnPanels(authored.learn.panels),
      },
      practice: {
        ...authored.practice,
        options: cloneOptions(authored.practice.options),
        supportActivities: [...authored.practice.supportActivities],
      },
      check: {
        ...authored.check,
        options: cloneCheckOptions(authored.check.options),
      },
    };
  }

  const learn = learnContent[`${lesson.lessonNumber}-1`] ?? learnContent["1-1"];
  const practice = practiceContent[`${lesson.lessonNumber}-2`] ?? practiceContent["1-2"];
  const check = checkContent[`${lesson.lessonNumber}-3`] ?? checkContent["1-3"];

  return {
    learn: {
      ...learn,
      title: lesson.title,
    },
    practice: {
      ...practice,
      options: cloneOptions(practice.options),
    },
    check: {
      ...check,
      options: cloneCheckOptions(check.options),
    },
  };
}

function getThemedExperience(
  module: CourseModule,
  lesson: CourseLesson,
): LessonExperience {
  const fallbackTheme: ThemeConfig = {
    visual: "sandbox",
    activityKind: "chart-lab",
    learnLead:
      "This lesson builds a clean, beginner-first mental model before you apply it.",
    whatThisMeans:
      "Focus on the one idea being taught and the one action you're taking.",
    commonMistake:
      "Rushing the concept without checking the core signal being taught.",
    labMoment:
      "Use the interaction to make the concept feel concrete before you move on.",
    supportActivities: ["Focus the signal", "Use the interaction", "Confirm the idea"],
    practiceSummary:
      "Apply the idea in a fresh way instead of repeating the same step.",
    practicePrompt:
      "Use the interaction to prove you understand the concept, not to guess.",
    practiceQuestion: "Which statement best matches this lesson?",
    practiceOptions: [
      { id: "a", text: "The concept is applied carefully", correct: true, reviewPrompt: "" },
      {
        id: "b",
        text: "The concept is skipped",
        correct: false,
        reviewPrompt: "Revisit the lesson and focus on the core signal.",
      },
    ],
    practiceExplanation:
      "Right. The practice step should confirm the concept, not bypass it.",
    checkType: "multiple",
    checkQuestion: "What is the core idea from this lesson?",
    checkOptions: [
      { id: "a", text: "The main concept being taught", correct: true, reviewPrompt: "" },
      {
        id: "b",
        text: "A random detail",
        correct: false,
        reviewPrompt: "Focus on the lesson's core concept.",
      },
    ],
    checkExplanation:
      "Correct. The check confirms the lesson's core concept.",
    reviewPrompt: "Review the core concept and try again.",
  };
  const theme = moduleThemes[module.slug] ?? fallbackTheme;

  return {
    learn: {
      title: lesson.title,
      visual: theme.visual,
      explanation: theme.learnLead,
      whatThisMeans: theme.whatThisMeans,
      commonMistake: theme.commonMistake,
      labMoment: theme.labMoment,
      supportActivities: [...theme.supportActivities],
    },
    practice: {
      mechanicTitle: `${lesson.title} practice`,
      mechanicSummary: theme.practiceSummary,
      prompt: theme.practicePrompt,
      question: theme.practiceQuestion,
      options: cloneOptions(theme.practiceOptions),
      explanation: theme.practiceExplanation,
      activityKind: theme.activityKind,
      supportActivities: [...theme.supportActivities],
    },
    check: {
      question: theme.checkQuestion,
      type: theme.checkType,
      correctAnswer: theme.checkCorrectAnswer,
      options: cloneCheckOptions(theme.checkOptions),
      explanation: theme.checkExplanation,
      reviewPrompt: theme.reviewPrompt,
    },
  };
}

function buildExperienceFromAuthored(
  authored: AuthoredLessonExperience,
): LessonExperience {
  return {
    objective: authored.objective,
    rewardLine: authored.rewardLine,
    masteryTags: [...authored.masteryTags],
    learn: {
      ...authored.learn,
      supportActivities: [...authored.learn.supportActivities],
      panels: cloneLearnPanels(authored.learn.panels),
    },
    practice: {
      ...authored.practice,
      options: cloneOptions(authored.practice.options),
      supportActivities: [...authored.practice.supportActivities],
    },
    check: {
      ...authored.check,
      options: cloneCheckOptions(authored.check.options),
    },
  };
}

export function getLessonExperienceFallback(
  module: CourseModule,
  lesson: CourseLesson,
): LessonExperience {
  if (module.slug === "foundations") {
    return getFoundationsExperience(lesson);
  }

  return getThemedExperience(module, lesson);
}

export async function getLessonExperienceAsync(
  module: CourseModule,
  lesson: CourseLesson,
): Promise<LessonExperience> {
  const authoredExperiences = await loadAuthoredExperiences();
  const authored = authoredExperiences[lesson.id];

  if (authored) {
    return buildExperienceFromAuthored(authored);
  }

  return getLessonExperienceFallback(module, lesson);
}
