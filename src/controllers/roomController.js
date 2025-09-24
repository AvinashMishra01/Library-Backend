import Room from "../models/Room.js";
import Library from "../models/library.js";

export const createRoom = async (req, res) => {
  try {
    const {libraryId } = req.params;
    const {name, totalSeats, roomType}= req.body;

    const library=await Library.findById(libraryId);

    if(!library)
    {
     return res.status(404).json({ success: false, message: "Library not found" });
    }

        // Create room
    const room = new Room({ name, totalSeats, roomType, library: libraryId });
    await room.save();

        library.rooms.push(room._id);
    await library.save();
    res.status(201).json({ success: true, data: room , message:'Room Created successfully'});

  
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getRoomsByLibrary = async (req, res) => {
  try {
    const rooms = await Room.find({ library: req.params.libraryId });
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }


};


