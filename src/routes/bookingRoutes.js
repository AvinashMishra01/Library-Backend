// import express from "express";

// const router = express.Router();

// // temp test route
// router.get("/", (req, res) => {
//   res.send("Booking route working ✅");
// });

// export default router;


import express from "express";
import {cancelBooking, bookSeat} from "../controllers/admin-controller/bookingController.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
// Book a seat (user only)
router.post(
  "/book",
  // authMiddleware,
  // roleMiddleware("user"),
  bookSeat
);

// Cancel a booking (user only)
router.put(
  "/:id/cancel",
  // authMiddleware,
  // roleMiddleware("user"),
  cancelBooking
);

export default router; 
