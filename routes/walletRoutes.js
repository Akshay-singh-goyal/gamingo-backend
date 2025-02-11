// routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');
const { getBalance } = require('../controllers/walletController');
const authenticateJWT = require('../Middleware/authMiddleware');

// Get wallet balance (protected route)
router.get('/balance', authenticateJWT, getBalance);

module.exports = router;
