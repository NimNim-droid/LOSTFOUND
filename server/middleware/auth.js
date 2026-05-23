const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Use req.headers.authorization — more reliable
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "No token or invalid format. Use: Bearer <token>" 
      });
    }

    // Extract token after "Bearer "
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ message: "Token is empty" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = auth;