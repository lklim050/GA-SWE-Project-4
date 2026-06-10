import mongoose from "mongoose";

const RolesSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
  },
  { collection: "roles" },
);

export default mongoose.model("Role", RolesSchema);
