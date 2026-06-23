// backend/models/Investment.js
const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: String,
  product: String,
  name: String,
  emissionDate: Date,
  maturityDate: Date,
  years: Number,
  purchaseValue: Number,
  grossBalance: Number,
  yield: Number,
  annualRate: Number,
  irAndIof: Number,
  quantity: Number,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Investment', InvestmentSchema);