import express from "express";
import {
  createAppt,
  deleteAppt,
  postAppt,
  readAllAppts,
  seedAppts,
  updateAppt,
} from "../controllers/ref/appts.js";

const router = express.Router({ mergeParams: true });

router.get("/appts/seed", seedAppts);
router.get("/appts", readAllAppts);
router.put("/appts", createAppt);
router.post("/appts/:apptId", postAppt);
router.patch("/appts/:apptId", updateAppt);
router.delete("/appts/:apptId", deleteAppt);

export default router;
