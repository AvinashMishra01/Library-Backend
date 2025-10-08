import express from "express";
import { addPayment } from "../../controllers/payment-controller/paymentControllers.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post('/update-plan', authMiddleware, roleMiddleware(["admin"]), addPayment )




export default router; 















