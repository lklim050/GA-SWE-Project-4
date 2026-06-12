import express from "express";
import { getAllUsers, login, refresh, register } from "../controllers/auth.js";
import {
  validateLoginData,
  validateRegistrationData,
} from "../../validators/auth.js";
import checkError from "../../validators/checkErrors.js";
import { authAdmin } from "../../middlewares/ref/auth.js";

const router = express.Router();

router.get("/users", authAdmin, getAllUsers);
router.put("/register", validateRegistrationData, checkError, register);
router.post("/login", validateLoginData, checkError, login);
router.post("/refresh", refresh);

export default router;
