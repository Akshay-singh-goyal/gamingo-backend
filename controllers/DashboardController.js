// controllers/dashboardController.js

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const sendResponse = require('../utils/response');


exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.user.id; // Access user id from the JWT token
    const user = await User.findById(userId); // Fetch user by ID

    if (!user) {
      return sendResponse(res, 404, 'User not found.');
    }

    return sendResponse(res, 200, 'Balance fetched successfully.', { balance: user.balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return sendResponse(res, 500, 'Internal server error.');
  }
};


exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(5);

    if (transactions.length === 0) {
      return sendResponse(res, 404, 'No transactions found.');
    }

    return sendResponse(res, 200, 'Transaction history fetched successfully.', { transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return sendResponse(res, 500, 'Failed to fetch transactions.');
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, transactions] = await Promise.all([
      User.findById(userId).select('balance'),
      Transaction.find({ userId }).sort({ date: -1 }).limit(5)
    ]);

    if (!user) {
      return sendResponse(res, 404, 'User not found.');
    }

    return sendResponse(res, 200, 'Dashboard data fetched successfully.', {
      balance: user.balance,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return sendResponse(res, 500, 'Failed to fetch dashboard data.');
  }
};
