// Centralized error handling middleware.
// Every controller catches its own errors with try/catch and calls next(error),
// so all errors end up here and responses stay consistent.

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  console.error("API Error:", error.message);

  // Mongoose validation failed (e.g. missing required field)
  if (error.name === "ValidationError") {
    const firstMessage = Object.values(error.errors)[0]?.message || "Invalid data";
    return res.status(400).json({ success: false, message: firstMessage });
  }

  // Invalid MongoDB id format (e.g. /api/expenses/abc)
  if (error.name === "CastError") {
    return res.status(404).json({ success: false, message: "Resource not found" });
  }

  // Duplicate key (unique field, e.g. email or category name already exists)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "value";
    return res.status(400).json({
      success: false,
      message: `That ${field} is already in use`,
    });
  }

  // Anything else is an unexpected server/database problem
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
};

module.exports = { notFoundHandler, errorHandler };
