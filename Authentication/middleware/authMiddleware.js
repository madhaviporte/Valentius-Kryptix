const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Access denied. Token has expired.",
        });
      }
      return res.status(401).json({
        message: "Access denied. Invalid token.",
      });
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        message: "Access denied. User no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

module.exports = protect;
