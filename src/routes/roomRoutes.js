// import express from "express";

// const router = express.Router();

// // temp test route
// router.get("/", (req, res) => {
//   res.send("Room route working ✅");
// });

// export default router;

import express from "express";
import {createRoom, getRoomsByLibrary } from "../controllers/roomController.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
// Create a room inside a library (admin only)
router.post(
  "/create",
  // authMiddleware,
  // roleMiddleware("admin"),
   createRoom
);

// Get rooms for a specific library
router.get(
  "/library/:libraryId",
  // authMiddleware,
 getRoomsByLibrary
);

export default router; 
