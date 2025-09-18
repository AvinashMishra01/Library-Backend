import Room from "../models/Room.js";
import Library from "../models/library.js";

export const createRoom = async (req, res) => {
  try {
    const { name, libraryId } = req.body;

    const room = await Room.create({ name, library: libraryId });
    await Library.findByIdAndUpdate(libraryId, { $push: { rooms: room._id } });

    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getRoomsByLibrary = async (req, res) => {
  try {
    const rooms = await Room.find({ library: req.params.libraryId }).populate("seats");
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
