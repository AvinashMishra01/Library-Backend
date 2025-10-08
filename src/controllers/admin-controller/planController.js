// import Plan from "../models/plan.js";

// export const createPlan = async (req, res) => {
//   try {
//     const { name, price, durationInHours, libraryId } = req.body;

//     const plan = await Plan.create({ name, price, durationInHours, library: libraryId });
//     res.status(201).json({ success: true, data: plan });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

// export const getPlansByLibrary = async (req, res) => {
//   try {
//     const plans = await Plan.find({ library: req.params.libraryId });
//     res.json({ success: true, data: plans });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
import Plan from "../../models/admin-panel/Plan.js";
import Library from "../../models/admin-panel/Library.js";

// Create a new plan for a library
export const createPlan = async (req, res) => {
  try {
    const { name, description, price,durationInDays, libraryId } = req.body;

    // validate library exists
    const lib = await Library.findById(libraryId);
    if (!lib) {
      return res.status(404).json({ success: false, message: "Library not found" });
    }

    const plan = new Plan({ name, description, price,durationInDays, libraryId });
    await plan.save();
    
    lib.plans.push(plan._id);
    await lib.save();

    res.status(201).json({ success: true, data: plan, message: 'Plan Added Successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all plans for a library
export const getPlansByLibrary = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const plans = await Plan.find({ libraryId: libraryId })
    .sort({ updatedAt: -1 });

    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Plan.findByIdAndUpdate(id, req.body, { new: true, timestamps: true });

    if (!updated) return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, data: updated, message: "Plan Updated Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Plan.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "Plan not found" });
     await Library.findByIdAndUpdate(deleted.libraryId, { $pull: { plans: deleted._id } });
    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateStatus= async ( req, res)=> { 

  try{
      const {id}= req.params;
      const { isActive}= req.body;
      const updatedStatus= await Plan.findByIdAndUpdate(id, {$set: { isActive }}, { new: true, timestamps: true } )
      if(!updatedStatus) return res.status(404).json({ success: false, message: "Plan not found" });

      return res.status(200).json({ success: true, data: updatedStatus, message: "Plan status updated successfully" });
  }
  catch(err){
     res.status(500).json({ success: false, message: err.message });
  }


}