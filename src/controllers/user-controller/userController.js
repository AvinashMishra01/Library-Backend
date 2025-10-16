import User from "../../models/user-panel/user.js";
import Plan from "../../models/admin-panel/Plan.js";
import  Booking from "../../models/admin-panel/Booking.js";
import Admin from "../../models/admin-panel/Admin.js";
import Payment from "../../models/payment-model/Payment.js";
import { calculateEndDate } from "../../utils/dateCalculator.js";
import { calculatePaymentStatus } from "../../utils/paidAmountCalculator.js";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNo,
      address,
      otherNo,
      preferredTime,
      planId,
      startDate,
      password,
      libraryId,
      seatNo,
      paymentMode,
      amountPaid,
      remainingDue,
    } = req.body;

    const exists = await User.findOne({ mobileNo });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const planValidity = calculateEndDate(startDate, plan.durationInDays);

    // 💾 Create user with their first plan
    const newUser = new User({
      name,
      email,
      mobileNo,
      otherNo,
      address,
      password,
      mainPassword: password,
      preferredTime,
      role: "user",
      subscriptions: [
        {
          libraryId,
          planId,
          seatNo,
          startDate,
          endDate: planValidity?.planEnd,
          totalDue: remainingDue,
          status: planValidity?.planActive,
        },
      ],
    });

    await newUser.save();

    // 💳 Create payment record
    const payment = new Payment({
      userId: newUser._id,
      planId,
      libraryId,
      amountPaid,
      paymentMode,
      paymentStatus: true,
      remainingDue,
      startDate,
      endDate: planValidity?.planEnd,
    });

    await payment.save();

    // 📊 Add this payment to the user's due list (in that library plan)
    if (remainingDue > 0) {
      await User.updateOne(
        { _id: newUser._id, "subscriptions.libraryId": libraryId },
        {
          $push: {
            "subscriptions.$.duePayments": {
              paymentId: payment._id,
              dueAmount: remainingDue,
            },
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
      payment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ➡️ Get all users

// export const getAllUsers = async (req, res) => {
//   try {
//     const adminId = req.user.id; // Admin ID from token
//     const limit = Number(req.query.limit) || 10;
//     const page = Number(req.query.page) || 1;
//     const active = req.query.userActive; // true/false

//     // ✅ Verify admin
//     const admin = await Admin.findById(adminId);
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const adminLibraries = admin.libraries; // libraries under this admin

//     // ✅ Fetch users linked to those libraries
//     const users = await User.find({
//       "subscriptions.libraryId": { $in: adminLibraries },
//       isActive: active
//     })
//       .populate("subscriptions.planId", "name price description")
//       .populate("subscriptions.libraryId", "name address")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     const totalUser = await User.countDocuments({
//       "subscriptions.libraryId": { $in: adminLibraries },
//       isActive: active
//     });

//     // ✅ Format data
//     const formattedUsers = users.map(user => {
//       const activeSubs = user.subscriptions.map(sub => {
//         return {
//           libraryId: sub.libraryId?._id,
//           libraryName: sub.libraryId?.name || "N/A",
//           planId: sub.planId?._id,
//           planName: sub.planId?.name || "No Plan",
//           price: sub.planId?.price || 0,
//           startDate: sub.startDate,
//           planExpireOn: sub.endDate,
//           dueAmount: sub.totalDue || 0,
//           planStatus: sub.status,
//           seat:sub.seatNo,
//           duePayments: sub.duePayments || []
//         };
//       });

//       return {
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         mobile: user.mobileNo,
//         address: user.address,
//         preferredTime: user.preferredTime,
//         subscriptions: activeSubs[0]
//       };
//     });

//     res.status(200).json({
//       success: true,
//       page,
//       limit,
//       total: totalUser,
//       users: formattedUsers
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id; // Admin ID from token
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const active = req.query.userActive; // true/false
    const today = new Date();

    // ✅ Verify admin
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const adminLibraries = admin.libraries || [];

    // ✅ Fetch users linked to those libraries
    const users = await User.find({
      "subscriptions.libraryId": { $in: adminLibraries },
      isActive: active
    })
      .populate("subscriptions.planId", "name price description")
      .populate("subscriptions.libraryId", "name address")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalUser = await User.countDocuments({
      "subscriptions.libraryId": { $in: adminLibraries },
      isActive: active
    });

    // ✅ Format data
    const formattedUsers = users.map(user => {
      if (!user.subscriptions?.length) return null;

      // Filter subscriptions under this admin’s libraries
      const relevantSubs = user.subscriptions.filter(sub =>
        adminLibraries.some(libId => libId.equals(sub.libraryId?._id))
      );

      // Calculate total due across all subscriptions
      const totalDue = relevantSubs.reduce((sum, sub) => sum + (sub.totalDue || 0), 0);

      // Determine latest or active subscription
      let selectedSub = null;

      // Priority 1 → Active plan
      selectedSub = relevantSubs.find(sub => {
        const start = new Date(sub.startDate);
        const end = new Date(sub.endDate);
        return today >= start && today <= end;
      });

      // Priority 2 → Latest plan if no active found
      if (!selectedSub) {
        selectedSub = relevantSubs.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        )[0];
      }

      // Dynamic plan status
      // let planStatus = false    // "Upcoming";
      // if (today > new Date(selectedSub.endDate)) planStatus =  false;//"Expired";
      // else if (today >= new Date(selectedSub.startDate)) planStatus = true //"Active";

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobileNo,
        address: user.address,
        preferredTime: user.preferredTime,
        totalDue: totalDue,
        hasMultipleLibraries: relevantSubs.length > 1,
        subscriptions: {
          libraryId: selectedSub.libraryId?._id,
          libraryName: selectedSub.libraryId?.name || "N/A",
          planId: selectedSub.planId?._id,
          planName: selectedSub.planId?.name || "No Plan",
          price: selectedSub.planId?.price || 0,
          startDate: selectedSub.startDate,
          planExpireOn: selectedSub.endDate,
          planStatus: selectedSub?.status || false,
          seat: selectedSub.seatNo || "",
          // dueAmount: selectedSub.totalDue || 0,
          duePayments: relevantSubs.flatMap(sub => sub.duePayments || [])
        }
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      page,
      limit,
      total: totalUser,
      users: formattedUsers
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// inactive user 
export const inactiveUser= async ( req, res) =>{
  try{
 const {userId}=  req.body;
    const user=  await User.findById(userId)

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }
   
     user.isActive = !user.isActive;

    // ✅ Save updated user
    await user.save();

    return res.status(200).json({
      message: `User status updated successfully`,
      status: user.status,
    });

  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({ message: "Error while inactive user please try after some time.", status:false, error:error });
  }
   
}


// user details 
export const userDetails= async (req, res)=>{

try {
  const userId = req.user.id;

  const user = await User.findById(userId)
    .populate("subscriptions.planId", "name price description")
    .populate("subscriptions.libraryId", "name address")
    .lean();

  if (!user)
    return res
      .status(404)
      .json({ message: "User details not found", status: false });

  // ✅ Rename populated fields
  user.subscriptions = user.subscriptions.map(sub => {
    const { planId, libraryId, ...rest } = sub;
    return {
      ...rest,
      planDetail: planId,
      libraryDetail: libraryId,
    };
  });

  // ✅ Combine all duePayments and calculate totalDue
  let totalDue = 0;
  const allDuePayments = [];

  user.subscriptions.forEach(sub => {
    if (sub.duePayments?.length) {
      sub.duePayments.forEach(dp => {
        allDuePayments.push({
          paymentId: dp.paymentId,
          dueAmount: dp.dueAmount || 0,
        });
        totalDue += dp.dueAmount || 0;
      });
    } else {
      totalDue += sub.totalDue || 0;
    }
  });

  // ✅ Pick latest or active subscription
  const latestSubscription =
    user.subscriptions.find(sub => sub.status === true) ||
    user.subscriptions.reduce(
      (latest, sub) =>
        !latest || new Date(sub.startDate) > new Date(latest.startDate)
          ? sub
          : latest,
      null
    );

  // ✅ Format the final structured response
  const formattedUser = {
    userId: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobileNo,
    address: user.address,
    preferredTime: user.preferredTime || "",
    totalDue,
    hasMultipleLibraries: user.subscriptions.length > 1,
    duePayments: allDuePayments,
    latestSubscription: latestSubscription
      ? {
          libraryDetail: {
            id: latestSubscription.libraryDetail?._id,
            name: latestSubscription.libraryDetail?.name || "N/A",
          },
          planDetail: {
            id: latestSubscription.planDetail?._id,
            name: latestSubscription.planDetail?.name || "No Plan",
            price: latestSubscription.planDetail?.price || 0,
          },
          planStartOn: latestSubscription.startDate,
          planExpireOn: latestSubscription.endDate,
          planStatus: latestSubscription.status || false,
          seat: latestSubscription.seatNo || "",
        }
      : null,
  };

  res.status(200).json({
    status: true,
    data: formattedUser,
  });
} catch (error) {
  console.error("Error fetching user details:", error);
  return res.status(500).json({ message: "Internal server error" });
}



//   try {
//   const userId = req.user.id;

//   const user = await User.findById(userId)
//     .populate("subscriptions.planId", "name price description")
//     .populate("subscriptions.libraryId", "name address")
//     .lean();

//   if (!user)
//     return res.status(404).json({ message: "User details not found", status: false });

//   // ✅ Transform subscriptions: rename planId → planDetail, libraryId → libraryDetail
//   user.subscriptions = user.subscriptions.map(sub => {
//     const { planId, libraryId, ...rest } = sub;
//     return {
//       ...rest,
//       planDetail: planId,
//       libraryDetail: libraryId,
//     };
//   });

//   // ✅ Gather all duePayments + calculate totalDue
//   const allDuePayments = [];
//   let totalDue = 0;

//   user.subscriptions.forEach(sub => {
//     if (sub.duePayments?.length) {
//       sub.duePayments.forEach(dp => {
//         allDuePayments.push({
//           paymentId: dp.paymentId,
//           dueAmount: dp.dueAmount || 0,
//           libraryName: sub.libraryDetail?.name || "",
//           planName: sub.planDetail?.name || "",
//         });
//         totalDue += dp.dueAmount || 0;
//       });
//     } else {
//       totalDue += sub.totalDue || 0;
//     }
//   });

//   // ✅ Find latest or active subscription
//   const latestSubscription =
//     user.subscriptions.find(sub => sub.status === true) ||
//     user.subscriptions.reduce((latest, sub) =>
//       !latest || new Date(sub.startDate) > new Date(latest.startDate)
//         ? sub
//         : latest,
//       null
//     );

//   // ✅ Add computed fields on top level
//   user.totalDue = totalDue;
//   user.duePayments = allDuePayments;
//   user.latestSubscription = latestSubscription;

//   res.status(200).json({
//     status: true,
//     data: user,
//   });
// } catch (error) {
//   console.error("Error fetching user details:", error);
//   return res.status(500).json({ message: "Internal server error" });
// }

}


export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("seat")
      .populate("room")
      .populate("library")
      .populate("plan");

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
