import Plan from "../models/plan.js";

export const createPlan = async (req, res) => {
  try {
    const { name, price, durationInHours, libraryId } = req.body;

    const plan = await Plan.create({ name, price, durationInHours, library: libraryId });
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPlansByLibrary = async (req, res) => {
  try {
    const plans = await Plan.find({ library: req.params.libraryId });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
