import express from "express";
import {getLibraryById, getLibraries} from "../controllers/libraryController.js";
// import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/",
    //  authMiddleware,
    getLibraries);
router.get("/:id", 
    // authMiddleware,
   getLibraryById);

export default router; 
