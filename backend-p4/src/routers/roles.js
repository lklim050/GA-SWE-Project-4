import express from "express";
import { getAllRoles } from "../controllers/roles.js";

const router = express.Router();

router.get("/", getAllRoles);

export default router;
