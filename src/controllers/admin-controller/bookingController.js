import Booking from "../../models/admin-panel/Booking.js";
import Seat from "../../models/admin-panel/Seat.js";

export const bookSeat = async (req, res) => {
  try {
    const { seatId, roomId, libraryId, planId, startTime, endTime } = req.body;
    const userId = req.user.id;

    const seat = await Seat.findById(seatId);
    if (!seat || !seat.isAvailable) return res.status(400).json({ message: "Seat not available" });

    const booking = await Booking.create({
      user: userId,
      seat: seatId,
      room: roomId,
      library: libraryId,
      plan: planId,
      startTime,
      endTime,
      status: "active"
    });

    seat.isAvailable = false;
    await seat.save();

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    await Seat.findByIdAndUpdate(booking.seat, { isAvailable: true });

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
