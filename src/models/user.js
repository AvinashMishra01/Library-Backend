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


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }]
}, { timestamps: true });

const User  = mongoose.model("User", userSchema);
export default User