import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginTime: { type: Date, default: Date.now },
  ipAddress: { type: String },
  deviceInfo: { type: String } // optional: browser/device info
});

const LoginLog = mongoose.model("LoginLog", loginLogSchema);
export default LoginLog;
