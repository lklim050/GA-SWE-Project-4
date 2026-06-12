import express from "express";
import {
  getAllUsers,
  loginUser,
  logoutUser,
  refreshAccess,
  registerUser,
} from "../controllers/users.js";
import { auth, authAdmin } from "../middlewares/users.js";

const router = express.Router();

router.get("/", authAdmin, getAllUsers);
router.put("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccess);
router.post("/logout", logoutUser);

export default router;
