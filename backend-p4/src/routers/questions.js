import express from "express";
import {
  createQuestion,
  deleteQuestion,
  readQuestionsBySurveyId,
  updateQuestion,
} from "../controllers/questions.js";
import { authHost } from "../middlewares/users.js";

const router = express.Router();

router.put("/", authHost, createQuestion);
router.get("/survey/:surveyId", authHost, readQuestionsBySurveyId);
router.patch("/:questionId", authHost, updateQuestion);
router.delete("/:questionId", authHost, deleteQuestion);
export default router;
