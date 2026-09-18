const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables before anything else uses them
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// ---------- CORS ----------
// In development (no FRONTEND_URL set) any origin is allowed so the local
// frontend on localhost:5173 just works. In production FRONTEND_URL must be
// set to the exact deployed frontend origin (e.g. https://taskflow.vercel.app)
// and only that origin is allowed - requests from any other origin get no
// Access-Control-Allow-Origin header at all. JWT is sent via the
// Authorization header (not cookies), so credentials are not needed and are
// explicitly disabled.
const allowedOrigin = process.env.FRONTEND_URL;
const corsOptions = allowedOrigin
    ? {
          // Compare explicitly so non-matching origins are rejected (no ACAO header)
          origin: function (origin, callback) {
              if (!origin || origin === allowedOrigin) {
                  callback(null, true);
              } else {
                  callback(null, false);
              }
          },
          credentials: false
      }
    : { credentials: false };

app.use(cors(corsOptions));
app.use(express.json());

// ---------- Health check ----------
// Lightweight endpoint for deployment platforms and uptime monitors.
// Returns only runtime status - never secrets or credentials.
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Task API is running"
    });
});

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
        message: "Task API is running",
        health: "/api/health",
        environment: process.env.NODE_ENV || "development"
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

// Falls back to 3000 for local development; deployments set PORT themselves
const PORT = parseInt(process.env.PORT, 10) || 3000;

// 0.0.0.0 makes the server reachable from outside containers/platform routers
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
        allowedOrigin
            ? `CORS: allowing only ${allowedOrigin}`
            : "CORS: development mode (any origin allowed)"
    );
    console.log("Health check available at /api/health");
});