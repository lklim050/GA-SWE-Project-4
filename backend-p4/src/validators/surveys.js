import { body, param } from "express-validator";

// SURVEY SCHEMAS
export const validateSurveyCreation = [
  body("title", "Survey title is required").trim().notEmpty(),
  body("points_reward", "Points reward must be a number").isNumeric(),
];

export const validateSurveyIdParam = [
  param("surveyId", "Valid Survey ID parameter is required").isNumeric(),
];

// QUESTION SCHEMAS
export const validateQuestionCreation = [
  body("survey_id", "Survey ID is required and must be numerical").isNumeric(),
  body("question_text", "Question text cannot be empty").trim().notEmpty(),
  body("type", "Type must be RADIO, CHECKBOX, SELECT, or TEXT").isIn([
    "RADIO",
    "CHECKBOX",
    "SELECT",
    "TEXT",
  ]),
  body("options", "Options array is required")
    .if(body("type").not().equals("TEXT"))
    .isArray(),
];

export const validateQuestionIdParam = [
  param("questionId", "Valid Question ID parameter is required").isNumeric(),
];

// RESPONSE / SUBMISSION SCHEMAS
export const validateResponseSubmission = [
  body("survey_id", "Survey ID is required").isNumeric(),
  body("answers_payload", "Answers payload must be an array").isArray(),
];
