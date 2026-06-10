import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import AuthModel from "../models/Auth.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await AuthModel.find({}, { _id: 0, username: 1, role: 1 });
    res.json(users);
    // const outputArray = [];
    // for (const user of users) {
    //   outputArray.push({ username: user.username, role: user.role });
    // }
    // res.json(outputArray);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "error getting users" });
  }
};

export const register = async (req, res) => {
  try {
    const auth = await AuthModel.findOne({ username: req.body.username });
    if (auth) {
      return res.status(400).json({ status: "error", msg: "duplicate email" });
    }
    const hash = await bcrypt.hash(req.body.password, 12);
    await AuthModel.create({
      username: req.body.username,
      hash,
      role: req.body.role || "USER",
    });
    res.json({ status: "ok", msg: "user created" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "invalid registration" });
  }
};

export const login = async (req, res) => {
  try {
    const auth = await AuthModel.findOne({ username: req.body.username });
    if (!auth) {
      // console.error(error.message);
      return res.status(401).json({ status: "error", msg: "not authorised" });
    }
    const result = await bcrypt.compare(req.body.password, auth.hash);
    const claims = { username: auth.username, role: auth.role };
    const access = await jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });
    const refresh = await jwt.sign(claims, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
      jwtid: uuidv4(),
    });
    res.json({ access, refresh, id: auth._id, username: auth.username });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "login failed" });
  }
};

export const refresh = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    const claims = { username: decoded.username, role: decoded.role };
    const access = await jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });
    res.json({ access });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: "error", msg: "refresh error" });
  }
};
