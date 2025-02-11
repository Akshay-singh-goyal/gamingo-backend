// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { getRecentTransactions } = require('../controllers/transactionController');
const authenticateJWT = require('../Middleware/authMiddleware');

// Get recent transactions (protected route)
router.get('/recent', authenticateJWT, getRecentTransactions);

module.exports = router;
