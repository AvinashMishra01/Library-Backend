// import express from "express";
// import { createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/userControler.js";

// const router = express.Router();

// router.get("/", getUsers);          // Get all users
// router.post("/create", createUser);       // Create user
// router.get("/:id", getUserById);    // Get user by ID
// router.put("/:id", updateUser);     // Update user
// router.delete("/:id", deleteUser);  // Delete user

// export default router;


import express from "express";
import {getUserBookings} from "../controllers/userController.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
// Get user bookings
router.get(
  "/bookings",
  // authMiddleware,
  // roleMiddleware("user"),
  getUserBookings
);

export default router; 
