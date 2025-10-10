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
 // 📅 Calculate end date from plan duration
    const planValidity = calculateEndDate(startDate, plan.durationInDays);


    // 💾 Save payment
    const payment = new Payment({
      userId,
      planId,
      libraryId,
      amountPaid,
      paymentMode,
      paymentStatus: true,
      remainingDue,
      startDate: startDate,
      endDate: planValidity?.planEnd
    });

    await payment.save();

   

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


export const getUserDueHistory = async (req, res) => {
  try {
    const { paymentIds } = req.body;

    if (!Array.isArray(paymentIds) || !paymentIds.length) {
      return res.status(400).json({
        success: false,
        message: "paymentIds array is required",
      });
    }

    // Fetch payment details
    const payments = await Payment.find({ _id: { $in: paymentIds } })
      .populate("planId", "name durationInDays price")
      .populate("libraryId", "name address")
      .sort({ createdAt: -1 })
      .lean();

    if (!payments.length) {
      return res.status(404).json({ success: false, message: "No payments found" });
    }

    // Build response
    const results = payments.map(payment => ({
      paymentId: payment._id,
      amountPaid: payment.amountPaid,
      dueAmount: payment.remainingDue ?? 0,
      paymentMode: payment.paymentMode,
      paymentStatus: payment.paymentStatus,
      paymentDate: payment.paymentDate,
      startDate: payment.startDate,
      endDate: payment.endDate,
      plan: payment.planId
        ? {
            name: payment.planId.name,
            durationInDays: payment.planId.durationInDays,
            price: payment.planId.price,
          }
        : null,
      library: payment.libraryId
        ? {
            name: payment.libraryId.name,
            address: payment.libraryId.address,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      count: results.length,
      dueHistory: results,
    });
  } catch (error) {
    console.error("❌ getUserDueHistory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const clearAllDue = async ( req, res)=>{
  console.log("clear due call ");
  
   try {
    const { userId, paymentIds } = req.body;

    if (!Array.isArray(paymentIds) || !paymentIds.length) {
      return res.status(400).json({
        success: false,
        message: "paymentIds array is required",
      });
    }
   const payments = await Payment.find({ _id: { $in: paymentIds } }).lean();

       if (!payments.length) {
      return res.status(404).json({ success: false, message: "No payments found" });
    }

   
    // 2️⃣ Update all payments → mark dues as cleared
    await Payment.updateMany(
      { _id: { $in: paymentIds } },
      { $set: { remainingDue: 0, paymentStatus: true } }
    );
   const users = await User.findById(userId)
 if(!users)
 {
        return res.status(404).json({ success: false, message: "No user found" });

 }
   
   // 4️⃣ For each subscription, remove cleared payments and update totalDue
    users.subscriptions.forEach(sub => {
      // Calculate how much due we are clearing in this subscription
      let clearedAmount = 0;

      sub.duePayments = sub.duePayments.filter(dp => {
        const isCleared = paymentIds.includes(dp.paymentId.toString());
        if (isCleared) clearedAmount += dp.dueAmount || 0;
        return !isCleared;
      });

      // Subtract clearedAmount from totalDue
      if (clearedAmount > 0) {
        sub.totalDue = Math.max(0, (sub.totalDue || 0) - clearedAmount);
      }
    });

    await users.save();

    res.status(200).json({
      success: true,
      message: "Dues cleared successfully",
    });
  }
  catch (error) {
    console.error("❌ clear due  error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
    

}

