import { QUESTIONNAIRE_QUESTIONS } from "../questionnaire";

export const QUESTIONNAIRE_MAX_SCORE = QUESTIONNAIRE_QUESTIONS.reduce(
  (sum, q) => sum + q.maxPoints,
  0
);

export const QUESTIONNAIRE_MIN_SCORE = QUESTIONNAIRE_QUESTIONS.reduce(
  (sum, q) => sum + q.minPoints,
  0
);
