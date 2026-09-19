import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  unitsRequired: { type: Number, required: true, min: 1 },
  hospital: { type: String, required: true },
  city: { type: String, required: true },
  urgency: { type: String, enum: ["normal", "urgent", "emergency"], default: "normal" },
  requiredDate: Date,
  reason: String,
  status: { type: String, enum: ["pending", "matched", "fulfilled", "cancelled"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("BloodRequest", bloodRequestSchema);
