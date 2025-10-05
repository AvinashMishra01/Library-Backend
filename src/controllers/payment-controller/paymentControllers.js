import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";

// 1️⃣ Add a payment for a user
export const addPayment = async (req, res) => {
  try {
    const { userId, planId, amountPaid, paymentMode } = req.body;

    // 🔍 Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 🔍 Validate plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    // 🔎 Calculate due from plan price
    let remainingDue = plan.price - amountPaid;
    let status = "paid";

    if (remainingDue > 0 && amountPaid > 0) status = "partial";
    if (remainingDue === plan.price) status = "due";

    // 💾 Save payment
    const payment = new Payment({
      userId,
      planId,
      amountPaid,
      paymentMode,
      status,
      remainingDue
    });

    await payment.save();

    // ✅ Update User's current plan info
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (plan.durationValue || 30)); // fallback 30 days

    user.planId = planId;
    user.startDate = startDate;
    user.endDate = endDate;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment
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
