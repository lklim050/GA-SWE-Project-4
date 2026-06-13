import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js"; // Importing your central Prisma wrapper

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        uuid: true, // Returning our new custom String PK format
        email: true, // Swapped from Mongoose 'username' to match your schema's 'email'
        name: true,
        role: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ status: "error", msg: "error getting users" });
  }
};

export const registerUser = async (req, res) => {
  try {
    // Check for duplicate emails using findUnique
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(400).json({ status: "error", msg: "duplicate email" });
    }

    const hash = await bcrypt.hash(req.body.password, 12);

    // Create entry—Prisma automatically generates the uuid() for us under the hood
    await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name || "Anonymous User",
        password: hash, // Storing hash string safely
        role: req.body.role || "user", // Default lowercase string matching schema default
      },
    });

    return res.json({ status: "ok", msg: "user created" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(400)
      .json({ status: "error", msg: "invalid registration" });
  }
};

// 3. LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(401).json({ status: "error", msg: "not authorised" });
    }

    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
      return res.status(401).json({ status: "error", msg: "not authorised" });
    }

    const claims = { uuid: user.uuid, email: user.email, role: user.role };

    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
      jwtid: uuidv4(),
    });

    // Returning user.uuid to replace old MongoDB ._id reference
    return res.json({
      access,
      refresh,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ status: "error", msg: "login failed" });
  }
};

// 4. REFRESH ACCESS TOKEN
export const refreshAccess = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    const claims = {
      uuid: decoded.uuid,
      email: decoded.email,
      role: decoded.role,
    };

    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "60m",
      jwtid: uuidv4(),
    });

    return res.json({ access });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ status: "error", msg: "refresh error" });
  }
};

// 5. OPTIONAL LOGOUT CONTROLLER (Only needed if utilizing HTTP-Only Cookies)
export const logoutUser = async (req, res) => {
  try {
    // Overwrite the cookie with an immediate expiration date
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({ status: "ok", msg: "logged out successfully" });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ status: "error", msg: "logout failed" });
  }
};
