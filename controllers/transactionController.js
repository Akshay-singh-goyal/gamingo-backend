// controllers/transactionController.js
const Transaction = require('../models/Transaction');

// Get recent transactions for the user
const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user._id; // JWT user data in req.user
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })  // Sort by latest date first
      .limit(5);  // Limit to the latest 5 transactions

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

module.exports = { getRecentTransactions };
