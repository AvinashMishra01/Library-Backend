
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },

//   email: { 
//     type: String, 
//     // required: true, 
//     unique: true, 
//     lowercase: true 
//   },

//   mobileNo: { 
//     type: String, 
//     required: true, 
//     match: /^[6-9]\d{9}$/ 
//   },

//   address: { type: String, required: true },
//   otherNo: { type: String, default: "" },

//   preferredTime: { type: String, required: true },
//   planType: { type: String, required: true },   // monthly, yearly
//   startDate: { type: Date, required: true },
//   seatNo: { type: String, default: "" },

//   // 🔑 Authentication
//   password: { type: String, required: true },
//   mainPassword:{type: String, required : true},
//   role: { type: String, enum: ["admin", "user"], default: "user" },
//   isActive: { type: Boolean, default: true },

//   // 🔗 Relation with library
//   libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },

//   createdAt: { type: Date, default: Date.now }
// });

// // 🔐 Encrypt password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// const User = mongoose.model("User", userSchema);
// export default User;



import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, lowercase: true },
//   mobileNo: { type: String, required: true, match: /^[6-9]\d{9}$/ },
//   address: { type: String, required: true },
//   otherNo: { type: String, default: "" },

//   preferredTime: { type: String, required: true },

//   // 🔑 Plan subscription info
//   planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },  // which plan user bought
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true }, // auto-calc based on plan duration
//   paymentStatus: { type: Boolean, default: false },

//   seatNo: { type: String, default: "" },

//   // 🔑 Authentication
//   password: { type: String, required: true },
//   mainPassword:{ type: String, required : true },
//   role: { type: String, enum: ["admin", "user"], default: "user" },
//   isActive: { type: Boolean, default: true },

//   // 🔗 Relation with library
//   libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },

//   createdAt: { type: Date, default: Date.now }
// });

// second attempt 
// const userSchema = new mongoose.Schema({
//   // Basic info
//   name: { type: String, required: true },
//   email: { type: String, lowercase: true, sparse: true },
//   mobileNo: { type: String, required: true, match: /^[6-9]\d{9}$/ },
//   otherNo: { type: String, default: "" },
//   address: { type: String, required: true },
//   preferredTime: { type: String },

//   // Library & seat
//   libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
//   seatNo: { type: String, default: "" },

//   // Plan subscription (only current plan info)
//   planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" }, 
//   startDate: { type: Date },   // auto-filled when user subscribes
//   endDate: { type: Date },     // derived from plan duration
  
//   totalDue: { type: Number, default: 0 },
//   duePayments: [
//     {
//       paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
//       dueAmount: Number,
//     }
//   ],
//   // Authentication & role
//   password: { type: String, required: true },
//   mainPassword: { type: String, required: true }, // ⚠️ avoid storing plain text later
//   role: { type: String, enum: ["admin", "user"], default: "user" },
//   isActive: { type: Boolean, default: true },

// }, { timestamps: true });
// // 🔐 Encrypt password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// const User = mongoose.model("User", userSchema);
// export default User;


// third attempt 

const subscriptionsInfoSchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  seatNo: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  totalDue: { type: Number, default: 0 },
  duePayments: [
    {
      paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
      dueAmount: Number,
    }
  ],
  status: { type: Boolean, default: true },
});

const userSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true },
  email: { type: String, lowercase: true, sparse: true },
  mobileNo: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  otherNo: { type: String, default: "" },
  address: { type: String, required: true },
  preferredTime: { type: String },

  // Library Plans
  subscriptions: [subscriptionsInfoSchema],  // 🔹 now user can have multiple library-plan pairs

  // Authentication
  password: { type: String, required: true },
  mainPassword: { type: String, required: true }, // ⚠️ remove later or encrypt separately
  role: { type: String, enum: ["admin", "user"], default: "user" },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

// Encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;

