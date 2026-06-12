import express from "express";
import {
  readAllSurveys,
  readPublishedSurveys,
} from "../controllers/surveys.js";
import { auth } from "../middlewares/users.js";

const router = express.Router();

router.get("/", auth, readAllSurveys);
router.get("/public", auth, readPublishedSurveys);

export default router;
