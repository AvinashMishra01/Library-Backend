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
  number: String, // e.g. "A1", "B5"
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  library: { type: mongoose.Schema.Types.ObjectId, ref: "Library" },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Room = mongoose.model("Seat", seatSchema);
export default Room;