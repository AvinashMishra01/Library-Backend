import Admin from "../../models/admin-panel/Admin.js";
import Library from "../../models/admin-panel/Library.js";
// import Room from "../models/Room";
// import Seat from "../models/Seat";

export const createLibrary = async (req, res) => {
  try {
    const { name, address } = req.body;
    const adminId = req.user.id;

    const library = await Library.create({ name, address, admin: adminId });
    await Admin.findByIdAndUpdate(adminId, { $push: { libraries: library._id } });

    res.status(201).json({ success: true, data: library });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
