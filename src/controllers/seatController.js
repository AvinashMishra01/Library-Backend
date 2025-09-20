import Seat from "../models/Seat.js";
import Room from "../models/Room.js";


export const checkSeatAvailability = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) return res.status(404).json({ message: "Seat not found" });

    res.json({ success: true, available: seat.isAvailable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const addSeatsToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { totalSeats } = req.body || [];
    const totalSeatLength= totalSeats?.length
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const seats = [];
    for (let i = 0; i < totalSeatLength; i++) {
      const seat = new Seat({ number: i+1,name: totalSeats[i]?.seatNo , room: roomId,  });
      await seat.save();
      seats.push(seat._id);
    }

    

    room.seats.push(...seats);
    await room.save();

    res.status(201).json({ success: true, message: `${totalSeatLength} seats added`, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSeatsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const seats = await Seat.find({ room: roomId });
    res.json({ success: true, data: seats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
