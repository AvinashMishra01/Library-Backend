import express from "express";
import {createPlan, getPlansByLibrary} from "../controllers/planController.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
// Create a new plan (admin only)
router.post(
  "/create",
  // authMiddleware,
  // roleMiddleware("admin"),
 createPlan
);

// Get plans for a library
router.get("/library/:libraryId",
  //  authMiddleware,
    getPlansByLibrary);

export default router; 
