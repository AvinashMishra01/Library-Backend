import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  amountPaid: { type: Number, required: true, default: 0 },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: ["cash", "upi", "card"], default: "cash" },

  // Track payment status against that plan’s price
  paymentStatus: { type: String, default: false },

  // Remaining balance at the time of payment
  remainingDue: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);

