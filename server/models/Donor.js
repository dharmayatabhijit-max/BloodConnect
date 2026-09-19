import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bloodGroup: { type: String, required: true },
  city: { type: String, required: true },
  area: String,
  lastDonationDate: Date,
  available: { type: Boolean, default: true },
  consentToContact: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Donor", donorSchema);
