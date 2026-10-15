const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");

const generateToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Raw token is only ever emailed to the user; the hashed
    // version is what gets stored in the database.
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      await User.deleteOne({ _id: user._id });
      throw emailError;
    }

    return res.status(201).json({
      message:
        "Registration successful. Check the server terminal for your verification link.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification token is invalid or has expired",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error.message);
    return res.status(500).json({
      message: "Email verification failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+password"
    );

    // Same generic message for "no such user" and "wrong password"
    // so we don't leak which emails exist.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always answer 200 — never reveal whether an email is registered.
    if (!user) {
      return res.status(200).json({
        message:
          "If that email is registered, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      message:
        "If that email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      message: "Password reset request failed",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset token is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password has been reset. You can now log in with the new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({
      message: "Password reset failed",
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
