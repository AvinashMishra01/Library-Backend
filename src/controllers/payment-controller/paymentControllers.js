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
// export const getUserPaymentHistory = async (req, res) => {
//   try {
//     const { userId } = req.query;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     // ✅ Check if user exists (for safety)
//     const userExists = await User.exists({ _id: userId });
//     if (!userExists) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // ✅ Fetch payment details with related plan and library info
//     const payments = await Payment.find({ userId })
//       .populate("planId", "name durationInDays price")
//       .populate("libraryId", "name address")
//       .sort({ paymentDate: -1 }) // latest first
//       .lean();

//     if (payments.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No payment history found for this user",
//         paymentHistory: [],
//         totalPayments: 0,
//       });
//     }

//     // ✅ Build formatted view
//     const paymentHistory = payments.map((p) => {
//          const isUpdated = p.updatedAt && p.createdAt && p.updatedAt.getTime() !== p.createdAt.getTime()
// return {
//   paymentId: p._id,
//       amountPaid: p.amountPaid,
//       remainingDue: p.remainingDue,
//       paymentMode: p.paymentMode,
//       paymentStatus: p.paymentStatus,
//       paymentDate: p.paymentDate,
//       startDate: p.startDate,
//       endDate: p.endDate,
//       updatedAt: isUpdated ? p.updatedAt :  p.createdAt , 
//       plan: p.planId
//         ? {
//             name: p.planId.name,
//             durationInDays: p.planId.durationInDays,
//             price: p.planId.price,
//           }
//         : null,
//       library: p.libraryId
//         ? {
//             name: p.libraryId.name,
//             address: p.libraryId.address,
//           }
//         : null,
// }
    
//     });

//     // ✅ Final response
//     res.status(200).json({
//       success: true,
//       message: "User payment history fetched successfully",
//       data:paymentHistory,
//       totalPayments: paymentHistory.length,
//     });
//   } catch (err) {
//     console.error("❌ getUserPaymentHistory error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



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


// export const clearAllDue = async ( req, res)=>{
//   console.log("clear due call ");
  
//    try {
//     const { userId, paymentIds } = req.body;

//     if (!Array.isArray(paymentIds) || !paymentIds.length) {
//       return res.status(400).json({
//         success: false,
//         message: "paymentIds array is required",
//       });
//     }
//    const payments = await Payment.find({ _id: { $in: paymentIds } }).lean();

//        if (!payments.length) {
//       return res.status(404).json({ success: false, message: "No payments found" });
//     }

   
//     // 2️⃣ Update all payments → mark dues as cleared
//     await Payment.updateMany(
//       { _id: { $in: paymentIds } },
//       { $set: { remainingDue: 0, paymentStatus: true } }
//     );
//    const users = await User.findById(userId)
//  if(!users)
//  {
//         return res.status(404).json({ success: false, message: "No user found" });

//  }
   
//    // 4️⃣ For each subscription, remove cleared payments and update totalDue
//     users.subscriptions.forEach(sub => {
//       // Calculate how much due we are clearing in this subscription
//       let clearedAmount = 0;

      // sub.duePayments = sub.duePayments.filter(dp => {
      //   const isCleared = paymentIds.includes(dp.paymentId.toString());
      //   if (isCleared) clearedAmount += dp.dueAmount || 0;
      //   return !isCleared;
      // });

      // // Subtract clearedAmount from totalDue
      // if (clearedAmount > 0) {
      //   sub.totalDue = Math.max(0, (sub.totalDue || 0) - clearedAmount);
      // }
    // });

//     await users.save();

//     res.status(200).json({
//       success: true,
//       message: "Dues cleared successfully",
//     });
//   }
//   catch (error) {
//     console.error("❌ clear due  error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
    

// }

export const clearAllDue = async (req, res) => {
  try {
    const { userId, paymentIds } = req.body;

    if (!Array.isArray(paymentIds) || !paymentIds.length) {
      return res.status(400).json({ success: false, message: "paymentIds array is required" });
    }

    // Get original payments to read due details
    const payments = await Payment.find({ _id: { $in: paymentIds } });
    if (!payments.length) return res.status(404).json({ success: false, message: "No payments found" });

    for (const p of payments) {
      // 🆕 Create a new record for due clearing
      await Payment.create({
        userId: p.userId,
        planId: p.planId,
        libraryId: p.libraryId,
        amountPaid: p.remainingDue,  // the amount now paid
        remainingDue: 0,
        paymentMode: "upi",
        paymentStatus: true,
        startDate: p.startDate,
        endDate: p.endDate,
        paymentDate: new Date()
      });

      // 🔄 Update old record for clarity (optional)
      p.remainingDue = 0;
      await p.save();
    }

    // 🧹 Remove duePayments from user
    const user = await User.findById(userId);
    user.subscriptions.forEach(sub => {
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
      // sub.duePayments = sub.duePayments.filter(
      //   dp => !paymentIds.includes(dp.paymentId.toString())
      // );
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: "Dues cleared successfully and recorded as new payments",
    });
  } catch (err) {
    console.error("❌ clearAllDue error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getUserPaymentHistory = async (req, res) => {
  try {
    const userId  = req.query?.userId || req.user.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // ✅ Fetch all payments by user
    const payments = await Payment.find({ userId })
      .populate("planId", "name durationInDays price")
      .populate("libraryId", "name address")
      .sort({ createdAt: -1 })
      .lean();

    if (!payments.length) {
      return res.status(404).json({ success: false, message: "No payments found for this user" });
    }

    // ✅ Group payments by planId + libraryId
    const grouped = {};
    for (const p of payments) {
      const key = `${p.planId?._id}_${p.libraryId?._id}`;
      if (!grouped[key]) {
        grouped[key] = {
          planId: p.planId?._id || null,
          planName: p.planId?.name || "N/A",
          planPrice: p.planId?.price || 0,
          durationInDays: p.planId?.durationInDays || 0,
          library: p.libraryId
            ? { id: p.libraryId._id, name: p.libraryId.name, address: p.libraryId.address }
            : null,
          totalPaid: 0,
          totalDue: 0,
          isCleared: true,
          payments: [],
        };
      }

      grouped[key].payments.push({
        paymentId: p._id,
        amountPaid: p.amountPaid,
        remainingDue: p.remainingDue,
        paymentMode: p.paymentMode,
        paymentStatus: p.paymentStatus,
        paymentDate: p.paymentDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        // ✅ show updated date if different
        lastUpdated:
          p.updatedAt && p.updatedAt.toISOString() !== p.createdAt.toISOString()
            ? p.updatedAt
            : null,
      });

      // Totals
      grouped[key].totalPaid += p.amountPaid;
      grouped[key].totalDue += p.remainingDue; // last payment’s due
      if (p.remainingDue > 0) grouped[key].isCleared = false;
    }

    // ✅ Prepare final output
    const history = Object.values(grouped);

    res.status(200).json({
      success: true,
      userId,
      totalPlans: history.length,
      history,
    });
  } catch (err) {
    console.error("❌ getUserPaymentHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
