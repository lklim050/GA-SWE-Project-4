import express from "express";
import { getAllRoles } from "../controllers/ref/roles.js";

const router = express.Router();

router.get("/", getAllRoles);

export default router;
