// backend/controllers/financeController.js
const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Balance = require('../models/Balance');

// ==================== INVESTIMENTOS ====================

exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    console.error('❌ Erro ao buscar investimentos:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createInvestment = async (req, res) => {
  try {
    const investment = new Investment({ ...req.body, userId: req.userId });
    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    console.error('❌ Erro ao criar investimento:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!investment) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }
    res.json(investment);
  } catch (error) {
    console.error('❌ Erro ao atualizar investimento:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!investment) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }
    res.json({ message: 'Investimento removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar investimento:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== TRANSAÇÕES ====================

exports.getTransactions = async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = { userId: req.userId };
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    const transactions = await Transaction.find(query).sort({ year: -1, month: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('❌ Erro ao buscar transações:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, userId: req.userId });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('❌ Erro ao atualizar transação:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json({ message: 'Transação removida com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar transação:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== BALANÇOS ====================

exports.getBalances = async (req, res) => {
  try {
    const { year } = req.query;
    const query = { userId: req.userId };
    if (year) query.year = parseInt(year);
    const balances = await Balance.find(query).sort({ year: 1, month: 1 });
    res.json(balances);
  } catch (error) {
    console.error('❌ Erro ao buscar balanços:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createBalance = async (req, res) => {
  try {
    const balance = new Balance({ ...req.body, userId: req.userId });
    await balance.save();
    res.status(201).json(balance);
  } catch (error) {
    console.error('❌ Erro ao criar balanço:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateBalance = async (req, res) => {
  try {
    const balance = await Balance.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!balance) {
      return res.status(404).json({ error: 'Balanço não encontrado' });
    }
    res.json(balance);
  } catch (error) {
    console.error('❌ Erro ao atualizar balanço:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBalance = async (req, res) => {
  try {
    const balance = await Balance.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!balance) {
      return res.status(404).json({ error: 'Balanço não encontrado' });
    }
    res.json({ message: 'Balanço removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar balanço:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== ESTATÍSTICAS ====================

exports.getStats = async (req, res) => {
  try {
    console.log('🔍 Buscando estatísticas para usuário:', req.userId);
    
    const [investments, balances, transactions] = await Promise.all([
      Investment.find({ userId: req.userId }),
      Balance.find({ userId: req.userId }),
      Transaction.find({ userId: req.userId })
    ]);

    console.log(`📊 Encontrados: ${investments.length} investimentos, ${balances.length} balanços, ${transactions.length} transações`);

    const monthlyBalances = balances.filter(b => b.month <= 12);
    const annualBalances = balances.filter(b => b.month === 13);

    console.log(`📈 Balanços mensais: ${monthlyBalances.length}`);
    console.log(`📊 Balanços anuais (month=13): ${annualBalances.length}`);

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalVariation = 0;
    let currentYear = '';

    if (annualBalances.length > 0) {
      const lastAnnual = annualBalances[annualBalances.length - 1];
      totalAssets = lastAnnual.totalAssets || 0;
      currentYear = String(lastAnnual.year || '');
      
      totalLiabilities = annualBalances.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
      totalVariation = annualBalances.reduce((sum, b) => sum + (b.variation || 0), 0);
      
      console.log('✅ Usando dados anuais (month=13)');
      console.log(`   Último ano: ${currentYear}`);
      console.log(`   Total Ativos (${currentYear}): ${totalAssets}`);
      console.log(`   Total Passivos (soma): ${totalLiabilities}`);
      console.log(`   Total Variações (soma): ${totalVariation}`);
    } 
    else if (monthlyBalances.length > 0) {
      const lastMonthly = monthlyBalances[monthlyBalances.length - 1];
      totalAssets = lastMonthly.totalAssets || 0;
      currentYear = String(lastMonthly.year || '');
      
      totalLiabilities = monthlyBalances.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
      totalVariation = monthlyBalances.reduce((sum, b) => sum + (b.variation || 0), 0);
      
      console.log('⚠️ Usando dados mensais como fallback');
    }
    else {
      console.log('⚠️ NENHUM DADO ENCONTRADO!');
    }

    const totalInvestments = investments.reduce((sum, inv) => sum + (inv.grossBalance || 0), 0);
    console.log(`💰 Total Investido (H29): ${totalInvestments}`);

    let monthlyVariation = 0;
    let variationPercent = 0;
    
    if (monthlyBalances.length > 1) {
      const lastMonthly = monthlyBalances[monthlyBalances.length - 1];
      const previousMonthly = monthlyBalances[monthlyBalances.length - 2];
      
      if (lastMonthly && previousMonthly) {
        const currentNet = (lastMonthly.totalAssets || 0) - (lastMonthly.totalLiabilities || 0);
        const prevNet = (previousMonthly.totalAssets || 0) - (previousMonthly.totalLiabilities || 0);
        monthlyVariation = currentNet - prevNet;
        variationPercent = prevNet > 0 ? (monthlyVariation / prevNet) * 100 : 0;
      }
    }

    const stats = {
      totalAssets: totalAssets,
      totalLiabilities: totalLiabilities,
      totalVariation: totalVariation,
      totalInvestments: totalInvestments,
      currentYear: currentYear,
      monthlyVariation: monthlyVariation,
      variationPercent: variationPercent,
      totalTransactions: transactions.length,
      totalInvestmentsCount: investments.length,
      monthlyBalancesCount: monthlyBalances.length,
      annualBalancesCount: annualBalances.length
    };

    console.log('\n📊 ESTATÍSTICAS CALCULADAS:');
    console.log(`   Total de Ativos (${currentYear}): R$ ${totalAssets.toFixed(2)}`);
    console.log(`   Total de Passivos (Acumulado): R$ ${totalLiabilities.toFixed(2)}`);
    console.log(`   Total das Variações (Acumulado): R$ ${totalVariation.toFixed(2)}`);
    console.log(`   Total Investido (H29): R$ ${totalInvestments.toFixed(2)}`);
    console.log(`   Variação Mensal: R$ ${monthlyVariation.toFixed(2)} (${variationPercent.toFixed(2)}%)`);

    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== ESTATÍSTICAS DETALHADAS (para Reports) ====================

exports.getDetailedStats = async (req, res) => {
  try {
    const { year } = req.query;
    const query = { userId: req.userId };
    if (year) query.year = parseInt(year);

    const [investments, balances, transactions] = await Promise.all([
      Investment.find({ userId: req.userId }),
      Balance.find(query),
      Transaction.find(query)
    ]);

    const monthlyBalances = balances.filter(b => b.month <= 12);
    const annualBalances = balances.filter(b => b.month === 13);

    const yearTransactions = transactions.filter(t => t.year === parseInt(year));
    const totalAtivos = yearTransactions
      .filter(t => t.category === 'Ativo')
      .reduce((sum, t) => sum + (t.value || 0), 0);
    const totalPassivos = yearTransactions
      .filter(t => t.category === 'Passivo')
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const lastAnnual = annualBalances.length > 0 ? annualBalances[annualBalances.length - 1] : null;
    const totalAnnualLiabilities = annualBalances.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
    const totalAnnualVariations = annualBalances.reduce((sum, b) => sum + (b.variation || 0), 0);
    const totalInvestments = investments.reduce((sum, inv) => sum + (inv.grossBalance || 0), 0);

    res.json({
      consolidated: {
        totalAssets: lastAnnual?.totalAssets || 0,
        totalLiabilities: totalAnnualLiabilities,
        totalVariation: totalAnnualVariations,
        totalInvestments: totalInvestments,
        currentYear: lastAnnual?.year || ''
      },
      year: {
        year: parseInt(year),
        totalAtivos,
        totalPassivos,
        saldo: totalAtivos - totalPassivos,
        transactionCount: yearTransactions.length
      },
      monthlyData: monthlyBalances.map(b => ({
        month: b.month,
        year: b.year,
        totalAssets: b.totalAssets || 0,
        totalLiabilities: b.totalLiabilities || 0,
        variation: b.variation || 0
      })),
      investments: investments,
      transactions: yearTransactions
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas detalhadas:', error);
    res.status(500).json({ error: error.message });
  }
};