// src/controllers/roleController.js
import { Role } from "../generated/prisma/index.js"; // 🍏 Import the Enum object directly!

export const getAllRoles = async (req, res) => {
  try {
    // Role looks like this under the hood: { HOST: 'HOST', USER: 'USER' }
    // Object.values() extracts just the string values into an array
    const rolesArray = Object.values(Role);

    return res.json(rolesArray);
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ status: "error", msg: "error getting all roles" });
  }
};
