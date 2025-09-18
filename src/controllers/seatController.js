import Seat from "../models/Seat.js";
import Room from "../models/Room.js";

export const addSeat = async (req, res) => {
  try {
    const { number, roomId, libraryId } = req.body;

    const seat = await Seat.create({ number, room: roomId, library: libraryId });
    await Room.findByIdAndUpdate(roomId, { $push: { seats: seat._id } });

    res.status(201).json({ success: true, data: seat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const checkSeatAvailability = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) return res.status(404).json({ message: "Seat not found" });

    res.json({ success: true, available: seat.isAvailable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
