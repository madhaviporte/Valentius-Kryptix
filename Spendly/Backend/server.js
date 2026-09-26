const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// In production, set CORS_ORIGIN in .env to your frontend URL
// e.g. CORS_ORIGIN=https://spendly.vercel.app. Local dev stays open by default.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

connectDB();

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Spendly API is running",
  });
});

// API routes
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// 404 for unknown routes, then centralized error handler (must stay last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});