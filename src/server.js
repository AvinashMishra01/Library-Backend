// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";

// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import roomRoutes from "./routes/room.routes.js";
// import seatRoutes from "./routes/seat.routes.js";
// import bookingRoutes from "./routes/booking.routes.js";

// dotenv.config();
// const app = express();

// app.use(cors());              // allow frontend to call
// app.use(express.json());      // parse JSON bodies

// app.get("/", (req, res) => res.send("Library API running ✅"));

// // API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/rooms", roomRoutes);
// app.use("/api/seats", seatRoutes);
// app.use("/api/bookings", bookingRoutes);

// // fallback
// app.use((req, res) => res.status(404).json({ msg: "Route not found" }));

// const PORT = process.env.PORT || 5000;
// connectDB()
//   .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
//   .catch((err) => {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   });


import  express from "express";
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"


// controllers 
import authRoute from "./routes/auth-route/authRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import libraryRoute from "./routes/admin-route/libraryRoutes.js";
import roomRoute from "./routes/admin-route/roomRoutes.js";
import seatRoute from "./routes/admin-route/seatRoutes.js";
import userRoute from "./routes/user-route/userRoutes.js";
import planRoute from "./routes/admin-route/planRoutes.js";
import bookingRoute from "./routes/bookingRoutes.js";
import paymentRoute from "./routes/payment/paymentRoutes.js"


// import cronJob from "./jobs/planExpiryJob.js"
// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // body parser

// Routes
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/library", libraryRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/seats", seatRoute);
app.use("/api/users", userRoute);
app.use("/api/plans", planRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/payment", paymentRoute )

// Import Jobs (cron will auto-run on import)
// require("./jobs/planExpiryJob");
  // cronJob();
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
