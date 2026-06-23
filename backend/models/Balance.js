// backend/models/Balance.js
const mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  totalAssets: {
    type: Number,
    default: 0
  },
  totalLiabilities: {
    type: Number,
    default: 0
  },
  variation: {
    type: Number,
    default: 0
  },
  monthlyVariation: {
    type: Number,
    default: 0
  },
  // Campos para totais anuais
  annualTotalAssets: {
    type: Number,
    default: 0
  },
  annualTotalLiabilities: {
    type: Number,
    default: 0
  },
  annualTotalVariation: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Balance', BalanceSchema);