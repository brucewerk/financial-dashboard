// backend/routes/finance.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const financeController = require('../controllers/financeController');

// Middleware de autenticação em todas as rotas
router.use(auth);

// ==================== INVESTIMENTOS ====================
router.get('/investments', financeController.getInvestments);
router.post('/investments', financeController.createInvestment);
router.put('/investments/:id', financeController.updateInvestment);
router.delete('/investments/:id', financeController.deleteInvestment);

// ==================== TRANSAÇÕES ====================
router.get('/transactions', financeController.getTransactions);
router.post('/transactions', financeController.createTransaction);
router.put('/transactions/:id', financeController.updateTransaction);
router.delete('/transactions/:id', financeController.deleteTransaction);

// ==================== BALANÇOS ====================
router.get('/balances', financeController.getBalances);
router.post('/balances', financeController.createBalance);
router.put('/balances/:id', financeController.updateBalance);
router.delete('/balances/:id', financeController.deleteBalance);

// ==================== ESTATÍSTICAS ====================
router.get('/stats', financeController.getStats);
router.get('/stats/detailed', financeController.getDetailedStats);

module.exports = router;