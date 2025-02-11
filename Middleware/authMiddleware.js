// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Token = require('../models/token');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

    // Check if token exists in the database
    const tokenInDb = await Token.findOne({ token });
    if (!tokenInDb) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach user information to request object
    const user = await User.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
