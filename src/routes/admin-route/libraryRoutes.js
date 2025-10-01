import express from "express";
import {getLibraryById, getLibraries, createLibrary, getLibrariesByAdmin} from "../../controllers/admin-controller/libraryController.js";
import { authMiddleware, } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
const router = express.Router();

router.post('/create', authMiddleware,roleMiddleware(["admin"]), createLibrary)



router.get("/",
     authMiddleware,
    getLibraries);
    
router.get("/:id", 
    authMiddleware,
   getLibraryById);

router.get(
  "/admin/libraries",
  authMiddleware,
  roleMiddleware(["admin"]),   // only admins
  getLibrariesByAdmin
);

export default router; 
