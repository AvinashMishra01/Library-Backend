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
import {getUserBookings,registerUser, getAllUsers, inactiveUser, userDetails} from "../../controllers/user-controller/userController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers) // get all user list active inactive pagination also 

router.post("/create", authMiddleware, roleMiddleware(["admin"]), registerUser);       // Create user

 router.post('/inactive-user', authMiddleware, roleMiddleware(["admin"]),inactiveUser )


 router.get('/user-detail', authMiddleware, roleMiddleware(["user"]), userDetails)



// Get user bookings
router.get("/bookings",
  // authMiddleware,
  // roleMiddleware("user"),
  getUserBookings
);


export default router; 
