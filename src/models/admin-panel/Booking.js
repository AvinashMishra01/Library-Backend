// const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
//     seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
//     planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     amountPaid: { type: Number, required: true },
//     status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Booking', bookingSchema);

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  library: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;