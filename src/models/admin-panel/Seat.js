// const mongoose = require('mongoose');

// const seatSchema = new mongoose.Schema(
//   {
//     libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true },
//     seatNumber: { type: String, required: true },
//     status: { type: String, enum: ['available', 'booked'], default: 'available' },
//     currentUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Seat', seatSchema);
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  number: { type: Number, required: true }, // for sorting (1, 2, 3…)
  name: { type: String, required: true },   // e.g. "A1", "B2", "Seat-1"
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  status: {
   type: String,
   enum: ["available", "booked", "reserved"],
   default: "available"
  }
}, { timestamps: true });

const Seat = mongoose.model("Seat", seatSchema);
export default Seat;