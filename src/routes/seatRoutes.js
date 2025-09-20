// import express from "express";

// const router = express.Router();

// // temp test route
// router.get("/", (req, res) => {
//   res.send("Seat route working ✅");
// });

// export default router;


import express from "express";
import {addSeatsToRoom, checkSeatAvailability} from "../controllers/seatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";


const router = express.Router();
// Add a seat to a room (admin only)
router.post(
  "/add/:roomId",
  authMiddleware,
  roleMiddleware(["admin"]),
  addSeatsToRoom
);

// Check seat availability
router.get("/:id/availability",
  //  authMiddleware,
    checkSeatAvailability);

export default router; 
