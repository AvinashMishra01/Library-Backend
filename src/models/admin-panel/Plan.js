import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Monthly", "Yearly", "Special"
  description: { type: String },                // e.g. "Flat 30% discount"
  price: { type: Number, required: true },      // e.g. 400
  isActive: { type :String, 
    enum:['0', '1'],
    default:'1'  },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;

