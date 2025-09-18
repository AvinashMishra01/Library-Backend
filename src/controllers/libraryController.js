import Library from "../models/library.js";

export const createLibrary = async (req, res)=>{
  try{
         const { name, address } = req.body;
         const adminId = req.user.id; 
  
    const library = await Library.create({
      name,
      address,
      admin: adminId
    });

    // res.status(200).json({ success: true, message: "Library created successfully", data: library });


// const { name, address } = req.body;

//     const library = new Library({
//       name,
//       address,
//       admin: req.adminId   // coming from auth middleware after login
//     });

    await library.save();
    res.status(201).json({ message: "Library created successfully", data:library });


  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
 
}

export const getLibraries = async (req, res) => {
  try {
    const libraries = await Library.find().populate("rooms");
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
