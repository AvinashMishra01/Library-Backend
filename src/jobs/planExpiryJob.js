import cron from "node-cron";
import User from "../models/user-panel/user.js";
import ExpiredLog from "../models/cron-job/ExpiredLog.js";

cron.schedule("*/20 * * * *", async () => { // for 1 min 
// cron.schedule("0 0 * * *", async () => { // for nid night
  console.log("⏰ Cron started: Checking expired subscriptions...");

  try {
    const today = new Date();
    const users = await User.find({ "subscriptions.status": true })
      .populate("subscriptions.planId", "name")
      .populate("subscriptions.libraryId", "name");

    let updatedCount = 0;
    let logCount = 0;

    for (const user of users) {
      let modified = false;

      for (const sub of user.subscriptions) {
        if (sub.endDate && new Date(sub.endDate) < today && sub.status) {
          // Log expired plan before marking it inactive
          await ExpiredLog.create({
            userId: user._id,
            libraryId: sub.libraryId?._id,
            planId: sub.planId?._id,
            seatNo: sub.seatNo,
            totalDue: sub.totalDue || 0,
            previousEndDate: sub.endDate,
          });
          logCount++;

          // Mark subscription inactive
          sub.status = false;
          modified = true;
        }
      }

      if (modified) {
        await user.save();
        updatedCount++;
      }
    }

    console.log(`✅ Cron completed: ${updatedCount} users updated, ${logCount} logs created.`);
  } catch (error) {
    console.error("❌ Error in expired plan cron:", error);
  }
});
