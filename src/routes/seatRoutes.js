// import express from "express";

// const router = express.Router();

// // temp test route
// router.get("/", (req, res) => {
//   res.send("Seat route working ✅");
// });

// export default router;


import express from "express";
import {addSeat, checkSeatAvailability} from "../controllers/seatController.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
// Add a seat to a room (admin only)
router.post(
  "/add",
  // authMiddleware,
  // roleMiddleware("admin"),
  addSeat
);

// Check seat availability
router.get("/:id/availability",
  //  authMiddleware,
    checkSeatAvailability);

export default router; 
