const express = require("express");
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register); // POST /api/auth/register
router.get("/verify-email", verifyEmail); // GET /api/auth/verify-email?token=...
router.post("/login", login); // POST /api/auth/login
router.post("/forgot-password", forgotPassword); // POST /api/auth/forgot-password
router.post("/reset-password", resetPassword); // POST /api/auth/reset-password

// Protected route (requires a valid Bearer JWT)
router.get("/me", protect, getMe); // GET /api/auth/me

module.exports = router;
