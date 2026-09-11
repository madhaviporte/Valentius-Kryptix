const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Simple email format check: something@something.something
const isValidEmail = (email) => {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ----- Input validation -----
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                message: "Name is required and must be a non-empty string"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid email is required (e.g. user@example.com)"
            });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                message: "Password is required and must be at least 6 characters"
            });
        }

        // ----- Duplicate email check -----
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Hash the password (never store plain text)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        // Return only safe fields - never the hashed password

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        // Handles the rare race where two requests register the same email
        if (error.code === 11000) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        res.status(500).json({
            message: "Something went wrong during registration"
        });
    }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ----- Input validation -----
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "A valid email is required (e.g. user@example.com)"
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        // ----- Find user and compare password -----
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        // Same message for both cases so we don't reveal which emails exist
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // ----- Generate JWT containing the user's id -----
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong during login"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};