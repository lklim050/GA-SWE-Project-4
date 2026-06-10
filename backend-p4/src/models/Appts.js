import mongoose from "mongoose";

const ApptsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minLength: 1, maxLength: 30 },
    type: { type: String, required: true, minLength: 1, maxLength: 30 },
    purpose: { type: String, required: false, maxLength: 50 },
    company: { type: String, required: false, maxLength: 30 },
    person: { type: String, required: false, maxLength: 30 },
    address: { type: String, required: false, maxLength: 50 },
    comment: { type: String, required: false, maxLength: 100 },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: "appts" },
);

export default mongoose.model("Appt", ApptsSchema);
