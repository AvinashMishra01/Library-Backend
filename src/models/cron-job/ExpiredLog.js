import mongoose from "mongoose";

const expiredLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    seatNo: { type: String },
    totalDue: { type: Number, default: 0 },
    previousEndDate: { type: Date },
    expiredOn: { type: Date, default: Date.now }, // When cron marked it expired
  },
  { timestamps: true }
);

export default mongoose.model("ExpiredLog", expiredLogSchema);
