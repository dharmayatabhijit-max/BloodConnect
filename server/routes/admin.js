import express from "express";
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import Donor from "../models/Donor.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", auth, requireRole("admin"), async (req, res) => {
  const [users, donors, requests, emergencies] = await Promise.all([
    User.countDocuments(),
    Donor.countDocuments(),
    BloodRequest.countDocuments(),
    BloodRequest.countDocuments({ urgency: "emergency" }),
  ]);

  res.json({ users, donors, requests, emergencies });
});

export default router;
