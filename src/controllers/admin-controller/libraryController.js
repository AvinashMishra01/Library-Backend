import Library from "../../models/admin-panel/Library.js";
import Admin from "../../models/admin-panel/Admin.js";


export const createLibrary = async (req, res)=>{
  try{
    
         const { name, address } = req.body;
         const adminId = req.user.id; 
  
    const library = await Library.create({
      name,
      address,
      admin: adminId
    });

     // Update admin's libraries array
    await Admin.findByIdAndUpdate(
      req.user.id,
      { $push: { libraries: library._id } },
      { new: true }
    );
    await library.save();
    res.status(201).json({ success:true, message: "Library created successfully", data:library });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
 
}

export const getLibrariesByAdmin = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware (decoded JWT)
    const adminId = req.user.id;

    // only library
    const libraries = await Library.find({ admin: adminId })
    .populate({
      path: "rooms",
    select: "name" 
    });
    

    res.json({ success: true, data: libraries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getLibraries = async (req, res) => {
  try {
    const libraries = await Library.find({ admin: req.user.id });
    // const libraries = await Library.find().populate("rooms");
    res.json({ success: true, data: libraries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLibraryById = async (req, res) => {
  try {
    const library = await Library.findById(req.params.id).populate("rooms");
    if (!library) return res.status(404).json({ message: "Library not found" });
    res.json({ success: true, data: library });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getNearbyLibraries = async (req, res) => {
  try {
    const {placeName}= req.body;
  //   const libraries = await Library.find({})
  //  .populate({
  //       path: "rooms",                   // populate rooms array
  //       populate: {
  //         path: "seats",                 // populate seats inside each room
  //         // model: "Seat",                 // specify model if needed
  //       },
  //     })                     // get all room details
  //   .populate("plans") 
  //   .sort({ createdAt: -1 });

   const libraries = await Library.find({})
   .populate({
      path: "rooms",
    select: "name" 
    });

    if (!libraries || libraries.length === 0) {
      return res.status(404).json({
        message: "No libraries found",
        data: [],
        status: false
      });
    }

    return res.status(200).json({
      message: "Libraries fetched successfully",
      data: libraries,
      status: true
    });
  } catch (error) {
    console.error("Error fetching libraries:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      status: false
    });
  }
};
