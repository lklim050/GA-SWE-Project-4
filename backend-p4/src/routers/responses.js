import express from "express";
import { auth } from "../middlewares/users.js";
import { submitSurveyResponse } from "../controllers/responses.js";

const router = express.Router();

router.put("/submit", auth, submitSurveyResponse);

export default router;
