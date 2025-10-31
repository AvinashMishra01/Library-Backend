import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },       
  description: { type: String },                
  price: { type: Number, required: true },      
  isActive: { type :String, 
    enum:['0', '1'],
    default:'1'  },
  durationInDays: { type: Number, required: true },
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;

