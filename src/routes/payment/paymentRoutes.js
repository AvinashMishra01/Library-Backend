import express from "express";
import { addPayment, getUserDueHistory, clearAllDue } from "../../controllers/payment-controller/paymentControllers.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post('/update-plan', authMiddleware, roleMiddleware(["admin"]), addPayment );
router.post('/user-due-history', authMiddleware, roleMiddleware(["admin", "user"]), getUserDueHistory );
router.post('/clear-all-due', authMiddleware, roleMiddleware(["admin", "user"]), clearAllDue );


export default router; 















