import  express from "express";
import  {createLibrary} from "../controllers/adminController.js";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
// Admin can create libraries
router.post(
  "/create-library",
//   authMiddleware,
  // roleMiddleware("admin"),
 createLibrary
);

export default router; 
