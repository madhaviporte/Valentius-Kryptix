const jwt = require("jsonwebtoken");

// The app cannot sign or verify tokens without a secret
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to your .env file.");
}

// Protects routes: checks for a valid "Authorization: Bearer <token>" header
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // No header or wrong format -> no token provided
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, no token provided"
            });
        }

        // Token comes after "Bearer "
        const token = authHeader.split(" ")[1];

        // Verify the token signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user's id to the request for the controllers to use
        req.user = { id: decoded.userId };

        next();
    } catch (error) {
        // Expired token or a token signed with a different secret
        return res.status(401).json({
            message: "Not authorized, token is invalid or expired"
        });
    }
};

module.exports = { protect };
