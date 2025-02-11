// routes/dashboardRoutes.js
const express = require('express');
const authMiddleware = require('../Middleware/authMiddleware');
const User = require('../models/user');
const Token = require('../models/token');
const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = req.user; // user is attached to the request by the middleware
    const transactions = await Transaction.find({ userId: user._id });

    res.json({
      name: user.name,
      balance: user.walletBalance,
      transactions: transactions,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data.' });
  }
});

module.exports = router;
