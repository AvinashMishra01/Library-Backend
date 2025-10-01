// const mongoose = require('mongoose');

// const adminSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     phone: { type: String },
//     libraries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Library' }],
//     planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Admin', adminSchema);
import  mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mainpassword:String,
  libraries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Library" }]
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
export default Admin