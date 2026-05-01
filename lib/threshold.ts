import type { SentimentResult, ThresholdResponse, ThresholdState } from "@/types";

const POETIC_REJECTIONS = [
  "The dust doesn't settle for strangers.",
  "Some doors open only when the right words are spoken.",
  "Knock again. Lighter this time.",
  "The wind has carried heavier things than that.",
  "Not yet. The badge is still on.",
  "I've heard that sound before. It's not the right one.",
  "The sheriff hasn't laid down his guns yet.",
  "Say it like you mean it.",
  "There's a long road behind this door. Come with all of it.",
  "The canyon doesn't echo for passing travelers.",
];

export function getPoeticRejection(knockCount: number): string {
  return POETIC_REJECTIONS[knockCount % POETIC_REJECTIONS.length];
}

export function evaluateThreshold(
  sentiment: SentimentResult,
  knockCount: number
): ThresholdResponse {
  if (sentiment.passed) {
    return { passed: true, state: "open" as ThresholdState, sentiment };
  }

  return {
    passed: false,
    state: (knockCount === 0 ? "locked" : "knocking") as ThresholdState,
    sentiment,
    poeticRejection: getPoeticRejection(knockCount),
  };
}
