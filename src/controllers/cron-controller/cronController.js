import ExpiredLog from "../../models/cron-job/ExpiredLog.js";

export const getExpiredLogs = async (req, res) => {
  try {
    const { startDate, endDate, libraryId } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.expiredOn = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (libraryId) filter.libraryId = libraryId;

    const logs = await ExpiredLog.find(filter)
      .populate("userId", "name email mobileNo")
      .populate("libraryId", "name")
      .populate("planId", "name price")
      .sort({ expiredOn: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
