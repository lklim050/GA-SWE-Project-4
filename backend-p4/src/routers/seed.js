import express from "express";
import { seedDatabase } from "../controllers/seed.js";
import { authAdmin } from "../middlewares/users.js";

const router = express.Router();

router.put("/", authAdmin, seedDatabase);

export default router;
