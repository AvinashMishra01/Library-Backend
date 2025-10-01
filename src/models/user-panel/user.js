// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   mobileNo: { 
//     type: String, 
//     required: true, 
//     match: /^[6-9]\d{9}$/ 
//   },
//   email: { type: String, default: "" },
//   address: { type: String, required: true },
//   otherNo: { type: String, default: "" },
//   preferedTime: { type: String, required: true },
//   planType: { type: String, required: true },   // e.g. monthly, yearly
//   startDate: { type: Date, required: true },
//   seatNo: { type: String, default: "" },        // linked with Seat model later
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("User", userSchema);



// const mongoose = require('mongoose');

// const userLibrarySchema = new mongoose.Schema(
//   {
//     libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
//     seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat' },
//     planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
//     startDate: { type: Date },
//     endDate: { type: Date },
//     status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//   },
//   { _id: false }
// );

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     phone: { type: String },
//     libraries: [userLibrarySchema],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('User', userSchema);

// login user 
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name:  {type: String, require:true},
//   email: { type: String, unique: true, require:true },
//   password: {type: String, require:true},
//   mainpssword: String,
//   // phone: String,
//   bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }]
// }, { timestamps: true });

// const User  = mongoose.model("User", userSchema);
// export default User

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },

  mobileNo: { 
    type: String, 
    required: true, 
    match: /^[6-9]\d{9}$/ 
  },

  address: { type: String, required: true },
  otherNo: { type: String, default: "" },

  preferredTime: { type: String, required: true },
  planType: { type: String, required: true },   // monthly, yearly
  startDate: { type: Date, required: true },
  seatNo: { type: String, default: "" },

  // 🔑 Authentication
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  isActive: { type: Boolean, default: true },

  // 🔗 Relation with library
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },

  createdAt: { type: Date, default: Date.now }
});

// 🔐 Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;


