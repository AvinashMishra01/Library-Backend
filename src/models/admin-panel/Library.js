import mongoose from "mongoose";

// const librarySchema = new mongoose.Schema(
//   {
//     adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
//     name: { type: String, required: true },
//     address: { type: String },
//     city: { type: String },
//     state: { type: String },
//     country: { type: String },
//     seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Library', librarySchema);


const librarySchema = new mongoose.Schema({
  name: String,
  address: String,
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
   plans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],
}, { timestamps: true });

// module.exports = mongoose.model("Library", librarySchema);
const Library = mongoose.model("Library", librarySchema);

export default Library;
