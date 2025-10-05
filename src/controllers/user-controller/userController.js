import User from "../../models/user-panel/user.js";
import Plan from "../../models/admin-panel/Plan.js";
import  Booking from "../../models/admin-panel/Booking.js";
import Admin from "../../models/admin-panel/Admin.js";
import Payment from "../../models/payment-model/Payment.js";
import { calculateEndDate } from "../../utils/dateCalculator.js";
import { calculatePaymentStatus } from "../../utils/paidAmountCalculator.js";
// ➡️ Create new user

export const registerUser = async (req, res) => {
  try {
    const { name, email, mobileNo, address,otherNo, preferredTime, planId, startDate, password, libraryId,seatNo,paymentMode,amountPaid,remainingDue } = req.body;

    const exists = await User.findOne({ mobileNo });
    if (exists) return res.status(400).json({ message: "User already exists" });
     
  // 1️⃣ Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

     // 2️⃣ Set subscription dates
    // const today = new Date(startDate);
    // const endDate = new Date(today);
    // endDate.setDate(today.getDate() + plan.durationInDays);
    const endDate = calculateEndDate(startDate, plan.durationInDays )

    const newUser = new User({
      // user details 
      name,
      email,
      mobileNo,
      otherNo,
      address,
      password,
      
      
      // plan lib details 
      planId,
      startDate,
      endDate,
      totalDue:remainingDue,
      preferredTime,
      
      mainPassword:password,
      role: "user",
      libraryId,
      seatNo,
    });

    await newUser.save();

      // let paymentResult= calculatePaymentStatus(amountPaid, plan?.price)

     // 5️⃣ Create payment linked to user
    const payment = new Payment({
      userId: newUser._id,
      planId,
      libraryId,
      amountPaid,
      paymentMode,// cash, upi, card, etc
      paymentStatus: true,
      remainingDue: remainingDue,
      
    });

    await payment.save();

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully", 
      user: newUser, 
      payment 
    });

    // res.status(201).json({ success: true, message: "User registered successfully", user: newUser });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// // ➡️ Get all users

export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id; // admin ID
    const limit = Number(req.query.limit) || 10;  
    const page = Number(req.query.page) || 1;     
    const active = req.query.userActive; // true/false

    console.log("get all user call ", active, page, limit, adminId);

    // ✅ Check admin
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const adminLibraries = admin.libraries;

    // ✅ Fetch users + populate plan
    const users = await User.find({
      libraryId: { $in: adminLibraries },
      isActive: active
    })
      .populate("planId", "name price description")  // only take plan details
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(limit);
// console.log("user dta is ", users)
    const totalUser = await User.countDocuments({
      libraryId: { $in: adminLibraries },
      isActive: active
    });

    res.status(200).json({
      page,
      limit,
      total: totalUser,
     users: users.map(user => {
    let planStatus = false;
    let dueAmount= user.totalDue;
    if (user.startDate && user.endDate) {
      const now = new Date();
      if (now >= user.startDate && now <= user.endDate) {
        planStatus = true; // subscription valid
      } else {
        planStatus = false; // expired
        dueAmount += user.planId.price
      }
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobileNo,
      address: user.address,
      seat: user.seatNo,

      // plan details
      planName: user.planId ? user.planId.name : "No Plan",
      price: user.planId ? user.planId.price : 0,

      // dynamic status
      planStatus,
      dueAmount
    };
  })
  
  })
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// // ➡️ Get single user by ID
// export const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.json({ success: true, data: user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ➡️ Update user
// export const updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.json({ success: true, message: "User updated successfully", data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // ➡️ Delete user
// export const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.json({ success: true, message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// import  User from "../models/user";


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
