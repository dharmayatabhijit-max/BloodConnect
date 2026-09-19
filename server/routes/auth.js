import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

function sign(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, city, role, bloodGroup, area, consentToContact } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const safeRole = ["donor", "patient"].includes(role) ? role : "patient";
    const user = await User.create({ name, email, passwordHash, phone, city, role: safeRole });

    if (safeRole === "donor") {
      if (!bloodGroup || !city) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: "Donors must provide blood group and city" });
      }
      await Donor.create({
        userId: user._id, bloodGroup, city, area,
        consentToContact: Boolean(consentToContact)
      });
    }

    res.status(201).json({
      token: sign(user),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      token: sign(user),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  res.json({ user });
});

export default router;
