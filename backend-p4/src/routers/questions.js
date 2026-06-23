import express from "express";
import {
  createQuestion,
  deleteQuestion,
  readQuestionsBySurveyId,
  updateQuestion,
} from "../controllers/questions.js";
import { authHost } from "../middlewares/users.js";
import {
  validateQuestionCreation,
  validateQuestionIdParam,
  validateSurveyIdParam,
} from "../validators/surveys.js";
import checkError from "../validators/checkErrors.js";

const router = express.Router();

router.put("/", authHost, validateQuestionCreation, checkError, createQuestion);
router.get(
  "/survey/:surveyId",
  authHost,
  validateSurveyIdParam,
  checkError,
  readQuestionsBySurveyId,
);
router.patch(
  "/:questionId",
  authHost,
  validateQuestionIdParam,
  checkError,
  updateQuestion,
);
router.delete(
  "/:questionId",
  authHost,
  validateQuestionIdParam,
  checkError,
  deleteQuestion,
);
export default router;
