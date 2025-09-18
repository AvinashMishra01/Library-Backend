// const mongoose = require('mongoose');

// const planSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true }, // Basic, Premium, etc.
//     price: { type: Number, required: true },
//     duration: { type: Number, required: true }, // in days
//     maxSeats: { type: Number }, // optional
//     features: [{ type: String }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Plan', planSchema);
import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: String, // e.g. "Monthly", "Hourly"
  price: Number,
  durationInHours: Number, // how long the plan allows booking
  library: { type: mongoose.Schema.Types.ObjectId, ref: "Library" }
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
export default Plan