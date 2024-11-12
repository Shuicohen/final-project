// verifyToken.js
const jwt = require('jsonwebtoken');

module.exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userinfo = decoded; // Ensure this line sets req.userinfo correctly
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
