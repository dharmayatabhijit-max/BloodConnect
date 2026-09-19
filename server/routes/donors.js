import express from "express";
import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";
import { auth, requireRole } from "../middleware/auth.js";
import User from "../models/User.js";
import { compatibleDonorGroups } from "../utils/bloodCompatibility.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const filter = { available: true, consentToContact: true };
    if (bloodGroup) filter.bloodGroup = { $in: compatibleDonorGroups(bloodGroup) };
    if (city) filter.city = new RegExp(`^${city}$`, "i");

    const donors = await Donor.find(filter)
      .populate("userId", "name city phone email")
      .select("-consentToContact");
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, requireRole("donor"), async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user.userId }).populate("userId", "name email phone city");
  res.json(donor);
});

router.post("/become", auth, async (req, res) => {
  try {
    const { bloodGroup, city, area, consentToContact } = req.body;
    if (!bloodGroup || !city) return res.status(400).json({ message: "Blood group and city are required" });

    const donor = await Donor.findOneAndUpdate(
      { userId: req.user.userId },
      { bloodGroup, city, area, consentToContact: Boolean(consentToContact), available: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("userId", "name email phone city");

    const user = await User.findByIdAndUpdate(req.user.userId, { role: "donor" }, { new: true });
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(201).json({ donor, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/me", auth, requireRole("donor"), async (req, res) => {
  const allowed = ["bloodGroup", "city", "area", "lastDonationDate", "available", "consentToContact"];
  const update = {};
  for (const key of allowed) if (key in req.body) update[key] = req.body[key];
  const donor = await Donor.findOneAndUpdate({ userId: req.user.userId }, update, { new: true });
  res.json(donor);
});

export default router;
