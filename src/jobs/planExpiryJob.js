// jobs/planExpiryJob.js
const cron = require("node-cron");
const Booking = require("../models/Booking");
const Seat = require("../models/Seat");

// Run every night at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running plan expiry job...");

  try {
    const now = new Date();

    // Find expired bookings
    const expiredBookings = await Booking.find({
      endTime: { $lte: now },
      status: "active",
    });

    for (let booking of expiredBookings) {
      // Mark booking as expired
      booking.status = "expired";
      await booking.save();

      // Free the seat
      await Seat.findByIdAndUpdate(booking.seat, {
        isAvailable: true,
        currentBooking: null,
      });

      console.log(`✅ Booking ${booking._id} expired & seat freed.`);
    }

    console.log("✔ Plan expiry job completed.");
  } catch (err) {
    console.error("❌ Error in planExpiryJob:", err.message);
  }
});
