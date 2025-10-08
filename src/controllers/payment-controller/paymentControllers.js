import Payment from "../../models/payment-model/Payment.js";
import User from "../../models/user-panel/user.js";
import Plan from "../../models/admin-panel/Plan.js";
import Library from "../../models/admin-panel/Library.js"
import { calculateEndDate } from "../../utils/dateCalculator.js";

// 1️⃣ Add a payment for a user
export const addPayment = async (req, res) => {
  try {
    const { userId, planId, libraryId, amountPaid, paymentMode, remainingDue, startDate } = req.body;

    // 🔍 Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 🔍 Validate plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    // 🔍 Validate library
    const library = await Library.findById(libraryId);
    if (!library) return res.status(404).json({ success: false, message: "Library not found" });

    // 💾 Save payment
    const payment = new Payment({
      userId,
      planId,
      libraryId,
      amountPaid,
      paymentMode,
      paymentStatus: true,
      remainingDue
    });

    await payment.save();

    // 📅 Calculate end date from plan duration
    const planValidity = calculateEndDate(startDate, plan.durationInDays);

    // 🔍 Find if user already has an entry for this library
    const existingLibraryPlan = user.subscriptions.find(
      p => p.libraryId.toString() === libraryId.toString()
    );

    if (existingLibraryPlan) {
      // 🧾 Update existing plan record for that library
      existingLibraryPlan.planId = planId;
      existingLibraryPlan.startDate = startDate;
      existingLibraryPlan.endDate = planValidity?.planEnd;
      existingLibraryPlan.totalDue += remainingDue;
      existingLibraryPlan.status= planValidity?.planActive

      if (remainingDue > 0) {
        existingLibraryPlan.duePayments.push({
          paymentId: payment._id,
          dueAmount: remainingDue,
        });
      }

    } else {
      // ➕ Add a new plan record for this library
      user.subscriptions.push({
        libraryId,
        planId,
        startDate,
        endDate:planValidity?.planEnd,
        status:planValidity?.planActive,
        totalDue: remainingDue,
        duePayments: remainingDue > 0 ? [{ paymentId: payment._id, dueAmount: remainingDue }] : [],
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: "Payment recorded & plan updated successfully",
      data: {
        payment,
        userSubscription: user.subscriptions
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 2️⃣ Get all payments for a user
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ userId })
      .populate("planId", "name price durationType durationValue")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 3️⃣ Get all payments (for admin)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email mobileNo")
      .populate("planId", "name price");

    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 4️⃣ Check due amount (for showing in UI "Due ₹X")
export const getUserDue = async (req, res) => {
  try {
    const { userId } = req.params;

    const lastPayment = await Payment.findOne({ userId }).sort({ createdAt: -1 });
    if (!lastPayment) {
      return res.status(200).json({ success: true, due: 0 });
    }

    res.status(200).json({
      success: true,
      due: lastPayment.remainingDue
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
