import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import Donor from "../models/Donor.js";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";
import { compatibleDonorGroups } from "../utils/bloodCompatibility.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, hospital, city, urgency, requiredDate, reason } = req.body;
    if (!patientName || !bloodGroup || !unitsRequired || !hospital || !city) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const request = await BloodRequest.create({
      requesterId: req.user.userId, patientName, bloodGroup, unitsRequired,
      hospital, city, urgency, requiredDate, reason
    });

    const donors = await Donor.find({
      bloodGroup: { $in: compatibleDonorGroups(bloodGroup) }, city: new RegExp(`^${city}$`, "i"), available: true, consentToContact: true
    }).limit(100);

    if (donors.length) {
      request.status = "matched";
      await request.save();
      await Notification.insertMany(donors.map(d => ({
        userId: d.userId,
        title: urgency === "emergency" ? "Emergency blood request" : "Blood request",
        message: `${bloodGroup} blood is requested at ${hospital} in ${city}.`,
        type: urgency === "emergency" ? "emergency" : "request"
      })));
    }

    res.status(201).json({ request, matchedDonors: donors.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  const requests = await BloodRequest.find()
    .populate("requesterId", "name email phone city")
    .sort({ createdAt: -1 }).limit(100);
  res.json(requests);
});

router.patch("/:id/status", auth, async (req, res) => {
  const allowed = ["pending", "matched", "fulfilled", "cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });

  const request = await BloodRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.requesterId.toString() !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  request.status = req.body.status;
  await request.save();
  res.json(request);
});

export default router;
