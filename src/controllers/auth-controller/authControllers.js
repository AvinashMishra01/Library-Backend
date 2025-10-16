// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ msg: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       name, email, password: hashedPassword, role
//     });

//     res.status(201).json({ msg: "User registered successfully", user: newUser });
//   } catch (error) {
//     res.status(500).json({ msg: "Server error", error: error.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: "1d"
//     });

//     res.json({ msg: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ msg: "Server error", error: error.message });
//   }
// };


// // import User from "../models/user.model.js";
// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";

// // const signToken = (user) =>
// //   jwt.sign(
// //     { id: user._id, role: user.role, email: user.email },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "7d" }
// //   );

// // export const registerUser = async (req, res) => {
// //   try {
// //     const { name, email, password, role } = req.body;
// //     if (!name || !email || !password) return res.status(400).json({ msg: "name, email, password required" });

// //     const exists = await User.findOne({ email });
// //     if (exists) return res.status(400).json({ msg: "User already exists" });

// //     const hashed = await bcrypt.hash(password, 10);
// //     const user = await User.create({ name, email, password: hashed, role });

// //     const token = signToken(user);
// //     const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };

// //     return res.status(201).json({ msg: "Registered", user: safeUser, token });
// //   } catch (err) {
// //     console.error(err);
// //     return res.status(500).json({ msg: "Server error", error: err.message });
// //   }
// // };

// // export const loginUser = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     if (!email || !password) return res.status(400).json({ msg: "email and password required" });

// //     const user = await User.findOne({ email });
// //     if (!user) return res.status(400).json({ msg: "Invalid credentials" });

// //     const ok = await bcrypt.compare(password, user.password);
// //     if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

// //     const token = signToken(user);
// //     const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };

// //     return res.json({ msg: "Login successful", user: safeUser, token });
// //   } catch (err) {
// //     console.error(err);
// //     return res.status(500).json({ msg: "Server error", error: err.message });
// //   }
// // };



import {generateToken, verifyToken} from "../../utils/jwt.js";
import bcrypt from "bcryptjs";
import Admin from "../../models/admin-panel/Admin.js";
import User from "../../models/user-panel/user.js";
import LoginLog from "../../models/user-panel/LoginLogs.js";
import jwt from "jsonwebtoken";
// ==========================
// Admin Signup/Login
// ==========================
export const adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, mainpassword:password,  password: hashed });

    res.status(201).json({ success: true, message:'Signup Process success', data: admin });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// export const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const match = await bcrypt.compare(password, admin.password);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     const token = generateToken({ id: admin._id, role: "admin" });

//     res.json({ success: true, token, admin });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

// ---------------------- Admin Login ----------------------
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
      let response= {
        token:token,
        role:'admin',

      }
    res.status(200).json({ success: true, data: response, message:'Login Successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================
// User Signup/Login
// ==========================
export const userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed, mainpssword:password });
    res.status(201).json({ success: true, data: user, message:'User Created Successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// export const userLogin = async (req, res) => {
//   try {
//     const { mobileNo, password } = req.body;

//     const user = await User.findOne({ mobileNo });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     const token = generateToken({ id: user._id, role: "user" });
    
//         // Save login log
//     await LoginLog.create({
//       userId: user._id,
//       ipAddress: req.ip,
//       deviceInfo: req.headers["user-agent"]
//     });

//     res.json({ success: true, token, user });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };


export const userLogin = async (req, res) => {
  try {
    const { mobileNo, password } = req.body;

    const user = await User.findOne({ mobileNo });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    // ✅ Capture client IP (works for mobile, laptop, or any device)
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',').shift() ||
      req.socket?.remoteAddress ||
      null;

    // ✅ Capture device/browser info
    const deviceInfo = req.headers["user-agent"];

    // ✅ Save login log
    await LoginLog.create({
      userId: user._id,
      ipAddress,
      deviceInfo,
    });

     let response= {
        token:token,
        role:'user',

      }
 return  res.status(200).json({ success: true, data: response, message:'Login Successfully' });

    // return res.status(200).json({
    //   message: "Login successful",
    //   token,
    //   user: {
    //     id: user._id,
    //     name: user.name,
    //     role: "user",
    //   },
    // });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};