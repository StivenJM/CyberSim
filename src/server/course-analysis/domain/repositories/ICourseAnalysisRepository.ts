import type { CourseAnalysisPayload, CourseAnalysisResponse } from "../models/CourseAnalysis.js";

export interface ICourseAnalysisRepository {
  generateAnalysis(payload: CourseAnalysisPayload): Promise<CourseAnalysisResponse>;
}
