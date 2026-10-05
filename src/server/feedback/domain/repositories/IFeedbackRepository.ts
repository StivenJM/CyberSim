import type { FeedbackPayload, FeedbackResponse } from "../models/Feedback.js";

export interface IFeedbackRepository {
  generateFeedback(payload: FeedbackPayload): Promise<FeedbackResponse>;
}
