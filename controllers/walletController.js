// controllers/walletController.js
const User = require('../models/user');

// Get user wallet balance
const getBalance = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming JWT user data is in req.user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ balance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching balance' });
  }
};

module.exports = { getBalance };
