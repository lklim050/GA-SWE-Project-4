import express from "express";
import {
  createSurvey,
  deleteSurvey,
  getSurveyById,
  readAllSurveys,
  readPublishedSurveys,
  updateSurvey,
} from "../controllers/surveys.js";
import { auth, authHost } from "../middlewares/users.js";
import { getSurveyResults } from "../controllers/responses.js";

const router = express.Router();

router.get("/", auth, readAllSurveys);
router.get("/public", auth, readPublishedSurveys);
router.put("/", authHost, createSurvey);
router.patch("/:surveyId", authHost, updateSurvey);
router.delete("/:surveyId", authHost, deleteSurvey);
router.post("/:surveyId", auth, getSurveyById);
router.get("/:surveyId/results", authHost, getSurveyResults);

export default router;
