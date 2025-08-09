const BlacklistedToken = require('../models/BlacklistedToken');

const checkBlacklist = async (req, res, next) => {
  const token = req.header("Authorization")

  if (!token) return res.status(401).json({ message: "Access Denied" });

  const isBlacklisted = await BlacklistedToken.findOne({ token });

  if (isBlacklisted) {
    return res.status(403).json({ message: "Token has been invalidated. Please login again." });
  }

  next();
};

module.exports = checkBlacklist