import jwt from "jsonwebtoken";

// 1. STANDARD AUTHENTICATION (For any logged-in user)
export const auth = (req, res, next) => {
  if (!("authorization" in req.headers)) {
    return res.status(400).json({ status: "error", msg: "no token found" });
  }

  const token = req.headers["authorization"].replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      // req.decoded will now contain your claims: { uuid, email, role }
      req.decoded = decoded;
      next();
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ status: "error", msg: "unauthorised" });
    }
  } else {
    console.error("missing token");
    return res.status(403).json({ status: "error", msg: "missing token" });
  }
};

// 2. HOST-ONLY AUTHENTICATION (Updated from authAdmin to match your new Role Enum)
export const authHost = (req, res, next) => {
  if (!("authorization" in req.headers)) {
    return res.status(400).json({ status: "error", msg: "no token found" });
  }

  const token = req.headers["authorization"].replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      // 🍏 Adjusted: Match the strict uppercase "HOST" enum value from your schema
      if (decoded.role === "HOST") {
        req.decoded = decoded;
        next();
      } else {
        console.error("Forbidden: User is not a Host");
        return res.status(403).json({ status: "error", msg: "unauthorised" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ status: "error", msg: "unauthorised" });
    }
  } else {
    console.error("missing token");
    return res.status(403).json({ status: "error", msg: "missing token" });
  }
};

// 3. ADMIN-ONLY AUTHENTICATION
export const authAdmin = (req, res, next) => {
  if (!("authorization" in req.headers)) {
    return res.status(400).json({ status: "error", msg: "no token found" });
  }

  const token = req.headers["authorization"].replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      // 🍏 Adjusted: Match the strict uppercase "HOST" enum value from your schema
      if (decoded.role === "ADMIN") {
        req.decoded = decoded;
        next();
      } else {
        console.error("Forbidden: User is not a Host");
        return res.status(403).json({ status: "error", msg: "unauthorised" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(401).json({ status: "error", msg: "unauthorised" });
    }
  } else {
    console.error("missing token");
    return res.status(403).json({ status: "error", msg: "missing token" });
  }
};
