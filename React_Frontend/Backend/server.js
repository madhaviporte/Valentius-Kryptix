const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables before anything else uses them
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

app.get("/", (req, res) => {
    res.json({
        message: "Task API is running"
    });
});

// Handles malformed JSON bodies sent to any route
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON in request body"
        });
    }

    res.status(500).json({
        message: "Something went wrong on the server"
    });
});

// Handles requests to routes that do not exist
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Falls back to 3000 when PORT is missing or not a valid number
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});