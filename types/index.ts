export type Role = "user" | "assistant";

export type ThresholdState = "locked" | "knocking" | "open";

export type ScreenState = "chatting" | "transitioning" | "final";

export interface SentimentResult {
  score: number;
  label: "shallow" | "seeking" | "sincere";
  passed: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  sentimentScore?: number;
  isRejection?: boolean;
  isDoorOpening?: boolean;
  createdAt: Date;
}

export interface ThresholdResponse {
  passed: boolean;
  state: ThresholdState;
  sentiment: SentimentResult;
  poeticRejection?: string;
}

export interface ChatApiRequest {
  message: string;
  knockCount: number;
  alreadyOpen: boolean;
}

export interface ChatApiResponse {
  message: string;
  door_opened: boolean;
  already_open?: boolean;
  sentiment_score: number;
  is_rejection: boolean;
  error?: string;
}
