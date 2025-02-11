const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
