// import express from "express";
// import {createPlan, getPlansByLibrary} from "../controllers/planController.js";
// // import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

// const router = express.Router();
// // Create a new plan (admin only)
// router.post(
//   "/create",
//   // authMiddleware,
//   // roleMiddleware("admin"),
//  createPlan
// );

// // Get plans for a library
// router.get("/library/:libraryId",
//   //  authMiddleware,
//     getPlansByLibrary);

// export default router; 
import express from "express";
import { createPlan, getPlansByLibrary, updatePlan, deletePlan, updateStatus } from "../controllers/planController.js";
import { authMiddleware, } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Admin creates plan
router.post("/", authMiddleware, roleMiddleware(["admin"]), createPlan);

// Get all plans for a library (public)
router.get("/:libraryId", getPlansByLibrary);

// Admin updates plan
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updatePlan);

// Admin deletes plan
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deletePlan);

router.put('/update-status/:id', authMiddleware, roleMiddleware(["admin"]), updateStatus)


export default router;
