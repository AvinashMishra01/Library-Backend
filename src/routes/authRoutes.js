// import express from "express";
// import { registerUser, loginUser } from "../controllers/auth.controlers.js";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);

// export default router;


import  express from "express";
import {adminLogin,adminSignup, userLogin, userSignup } from "../controllers/authControllers.js";

const router = express.Router();
// Admin
router.post("/admin/signup",adminSignup);
router.post("/admin/login", adminLogin);

// User
router.post("/user/signup", userSignup);
router.post("/user/login", userLogin);

export default router; 
