// import User from "../models/user.model.js";

// // ➡️ Create new user
// export const createUser = async (req, res) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     res.status(201).json({ success: true, message: "User created successfully", data: user });
//   } catch (error) {
//     res.status(400).json({ success: false, message: "User not created", mainError:error.message });
//   }
// };

// // ➡️ Get all users
// export const getUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json({ success: true, data: users });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

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
import  Booking from "../models/Booking.js";

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
