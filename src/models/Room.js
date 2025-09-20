import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: String, // Room A, Room B, etc.
  totalSeats:Number,
  roomType:String,
  library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true},
  seats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat" }]
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room