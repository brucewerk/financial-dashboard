// backend/import-data.js
const mongoose = require('mongoose');
const Investment = require('./models/Investment');
const Transaction = require('./models/Transaction');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// Dados da planilha CARTEIRA
const investmentsData = [
  {
    type: 'Renda Fixa',
    product: 'LCI',
    name: 'BARIGUI COMPANHIA HIPOTEC',
    emissionDate: new Date('2024-03-26'),
    maturityDate: new Date('2028-03-27'),
    years: 4,
    purchaseValue: 170000,
    grossBalance: 207687.44,
    yield: 37687.44,
    annualRate: 9.5,
    irAndIof: 0
  },
  {
    type: 'Renda Fixa',
    product: 'LCA',
    name: 'BANCO ABC BRASIL S.A.',
    emissionDate: new Date('2024-03-26'),
    maturityDate: new Date('2027-03-11'),
    years: 3,
    purchaseValue: 190000,
    grossBalance: 229696.13,
    yield: 39696.13,
    annualRate: 8.98,
    irAndIof: 0
  },
  {
    type: 'Renda Fixa',
    product: 'CDB',
    name: 'PICPAY BANK - BANCO MULTIPL',
    emissionDate: new Date('2024-11-18'),
    maturityDate: new Date('2028-11-21'),
    years: 4,
    purchaseValue: 96000,
    grossBalance: 118059.01,
    yield: 22059.01,
    annualRate: 14.26,
    irAndIof: 3653.71
  },
  {
    type: 'Renda Fixa',
    product: 'CDB',
    name: 'NOVO BANCO CONTINENTAL S.',
    emissionDate: new Date('2025-06-13'),
    maturityDate: new Date('2032-06-14'),
    years: 7,
    purchaseValue: 79000,
    grossBalance: 90287.38,
    yield: 11287.38,
    annualRate: 14.41,
    irAndIof: 2075.12
  },
  {
    type: 'Renda Fixa',
    product: 'Título Público',
    name: 'Tesouro IPCA+ com Juros Semestrais 2035',
    emissionDate: new Date('2006-03-07'),
    maturityDate: new Date('2035-05-15'),
    years: 29,
    purchaseValue: 549016.98,
    grossBalance: 605028.47,
    yield: 56011.49,
    annualRate: 6.0,
    irAndIof: 9224.34
  },
  {
    type: 'Renda Fixa',
    product: 'Título Público',
    name: 'Tesouro IPCA+ com Juros Semestrais 2045',
    emissionDate: new Date('2004-09-15'),
    maturityDate: new Date('2045-05-15'),
    years: 41,
    purchaseValue: 549699.13,
    grossBalance: 605873.16,
    yield: 56174.03,
    annualRate: 6.0,
    irAndIof: 9251.34
  },
  {
    type: 'Renda Fixa',
    product: 'Título Público',
    name: 'Tesouro IPCA+ com Juros Semestrais 2055',
    emissionDate: new Date('2015-01-14'),
    maturityDate: new Date('2055-05-15'),
    years: 40,
    purchaseValue: 550155.72,
    grossBalance: 606437.88,
    yield: 56282.16,
    annualRate: 6.0,
    irAndIof: 9269.31
  },
  {
    type: 'Renda Fixa',
    product: 'CRA',
    name: 'REDE SIM - CRA-CRA025000MB',
    emissionDate: new Date('2026-05-26'),
    maturityDate: new Date('2030-02-18'),
    years: 4,
    purchaseValue: 199224.44,
    grossBalance: 200708.79,
    yield: 1484.35,
    annualRate: 2.0,
    irAndIof: 0
  },
  {
    type: 'Renda Fixa',
    product: 'CRA',
    name: 'REDE SIM - CRA-CRA025000MC',
    emissionDate: new Date('2026-05-27'),
    maturityDate: new Date('2030-02-18'),
    years: 4,
    purchaseValue: 99774.25,
    grossBalance: 100436.21,
    yield: 661.96,
    annualRate: 16.0,
    irAndIof: 0
  },
  {
    type: 'Renda Fixa',
    product: 'CRA',
    name: 'LAR COOPERATIVA - CRA-CRA026001JM',
    emissionDate: new Date('2026-05-26'),
    maturityDate: new Date('2033-03-15'),
    years: 7,
    purchaseValue: 199441.35,
    grossBalance: 200755.21,
    yield: 1313.86,
    annualRate: 14.64,
    irAndIof: 0
  },
  {
    type: 'Fundo Invest.',
    product: 'Renda Fixa',
    name: 'PORTO DI CRPR FIREF',
    emissionDate: new Date('2024-06-19'),
    maturityDate: new Date('2026-06-13'),
    years: 2,
    purchaseValue: 26576.23,
    grossBalance: 34195.69,
    yield: 7619.46,
    annualRate: 14.75,
    irAndIof: 26.46
  },
  {
    type: 'Previdência',
    product: 'PGBL Regressivo',
    name: 'BTG TESOURO SELIC PREV FIRF REF DI',
    emissionDate: new Date('2024-07-01'),
    maturityDate: new Date('2026-06-13'),
    years: 2,
    purchaseValue: 206783.65,
    grossBalance: 264338.19,
    yield: 57554.54,
    annualRate: 14.85,
    irAndIof: 0
  },
  {
    type: 'Renda Variável',
    product: 'FII',
    name: 'KNCR11 - FII KINEA RICI',
    emissionDate: new Date('2024-09-01'),
    maturityDate: new Date('2026-06-13'),
    years: 2,
    purchaseValue: 75084.56,
    grossBalance: 77818.08,
    yield: 2733.52,
    annualRate: 28.72,
    irAndIof: 0
  },
  {
    type: 'Conta Invest.',
    product: 'Líquido',
    name: 'Conta BTG Investimento',
    emissionDate: new Date('2026-06-13'),
    maturityDate: new Date('2026-06-13'),
    years: 0,
    purchaseValue: 0,
    grossBalance: 0,
    yield: 0,
    annualRate: 0,
    irAndIof: 0
  },
  {
    type: 'Conta Invest.',
    product: 'Líquido',
    name: 'Conta Mercado Pago - Cofrinho 115% CDI',
    emissionDate: new Date('2026-05-15'),
    maturityDate: new Date('2026-06-13'),
    years: 0,
    purchaseValue: 173956.31,
    grossBalance: 180928.77,
    yield: 6972.46,
    annualRate: 115.0,
    irAndIof: 0
  },
  {
    type: 'Conta Invest.',
    product: 'Líquido',
    name: 'Conta Corrente BRADESCO - Run/Rate',
    emissionDate: new Date('2016-03-16'),
    maturityDate: new Date('2026-06-13'),
    years: 10,
    purchaseValue: 7831.15,
    grossBalance: 7831.15,
    yield: 0,
    annualRate: 0,
    irAndIof: 0
  }
];

// Dados de Transações (Ativos e Passivos) - baseado na planilha 2025 e 2026
const transactionsData = [
  // ATIVOS - 2025
  { year: 2025, month: 1, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 350000 },
  { year: 2025, month: 1, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2025, month: 1, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 146966.20 },
  { year: 2025, month: 1, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3030502.12 },
  
  { year: 2025, month: 2, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 139312.20 },
  { year: 2025, month: 2, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3046332.10 },
  
  { year: 2025, month: 3, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 136984.45 },
  { year: 2025, month: 3, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3071751.70 },
  
  { year: 2025, month: 4, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 128852.32 },
  { year: 2025, month: 4, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3102069.66 },
  
  { year: 2025, month: 5, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 122017.01 },
  { year: 2025, month: 5, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3136752.88 },
  { year: 2025, month: 5, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 7933.33 },
  
  { year: 2025, month: 6, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 110718.21 },
  { year: 2025, month: 6, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3153959.27 },
  { year: 2025, month: 6, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 20200.36 },
  { year: 2025, month: 6, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6688.33 },
  
  { year: 2025, month: 7, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 98921.19 },
  { year: 2025, month: 7, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3184532.60 },
  { year: 2025, month: 7, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 32954.38 },
  { year: 2025, month: 7, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6688.33 },
  
  { year: 2025, month: 8, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 83879.91 },
  { year: 2025, month: 8, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3211163.66 },
  { year: 2025, month: 8, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 45708.40 },
  { year: 2025, month: 8, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6688.33 },
  
  { year: 2025, month: 9, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 71356.86 },
  { year: 2025, month: 9, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3237455.35 },
  { year: 2025, month: 9, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 48274.03 },
  { year: 2025, month: 9, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6907.42 },
  
  { year: 2025, month: 10, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 57513.51 },
  { year: 2025, month: 10, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3271308.40 },
  { year: 2025, month: 10, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 48035.03 },
  { year: 2025, month: 10, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6936.37 },
  
  { year: 2025, month: 11, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 44907.42 },
  { year: 2025, month: 11, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3300433.78 },
  { year: 2025, month: 11, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 47715.05 },
  { year: 2025, month: 11, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6965.58 },
  
  { year: 2025, month: 12, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 51155.74 },
  { year: 2025, month: 12, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3313782.52 },
  { year: 2025, month: 12, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 47238.09 },
  { year: 2025, month: 12, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 6995.02 },
  
  // ATIVOS - 2026
  { year: 2026, month: 1, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 430000 },
  { year: 2026, month: 1, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2026, month: 1, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 42263.84 },
  { year: 2026, month: 1, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3344844.17 },
  { year: 2026, month: 1, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 46928.11 },
  { year: 2026, month: 1, description: 'Conta Banco do Brasil', category: 'Ativo', type: 'Conta Banco do Brasil', value: 2284.88 },
  { year: 2026, month: 1, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 7023.22 },
  
  { year: 2026, month: 2, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 430000 },
  { year: 2026, month: 2, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2026, month: 2, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 29482.79 },
  { year: 2026, month: 2, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3362069.57 },
  { year: 2026, month: 2, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 46606.80 },
  { year: 2026, month: 2, description: 'Conta Banco do Brasil', category: 'Ativo', type: 'Conta Banco do Brasil', value: 2249.55 },
  { year: 2026, month: 2, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 7053.30 },
  
  { year: 2026, month: 3, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 430000 },
  { year: 2026, month: 3, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2026, month: 3, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 29604.34 },
  { year: 2026, month: 3, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3382941.53 },
  { year: 2026, month: 3, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 46285.49 },
  { year: 2026, month: 3, description: 'Conta Banco do Brasil', category: 'Ativo', type: 'Conta Banco do Brasil', value: 1997.40 },
  { year: 2026, month: 3, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 7082.83 },
  
  { year: 2026, month: 4, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 430000 },
  { year: 2026, month: 4, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2026, month: 4, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 23736.43 },
  { year: 2026, month: 4, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3416542.05 },
  { year: 2026, month: 4, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 45964.18 },
  { year: 2026, month: 4, description: 'Conta Banco do Brasil', category: 'Ativo', type: 'Conta Banco do Brasil', value: 1448.11 },
  { year: 2026, month: 4, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 7082.83 },
  
  { year: 2026, month: 5, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 430000 },
  { year: 2026, month: 5, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2026, month: 5, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 41720.00 },
  { year: 2026, month: 5, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3423777.18 },
  { year: 2026, month: 5, description: 'Contabilizei Bank', category: 'Ativo', type: 'Contabilizei Bank', value: 45646.18 },
  { year: 2026, month: 5, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 7138.73 },
  
  { year: 2026, month: 6, description: 'Apartamento Vila Ema', category: 'Ativo', type: 'Apartamento', value: 430000 },
  { year: 2026, month: 6, description: 'Carro Civic 2016', category: 'Ativo', type: 'Carro', value: 75000 },
  { year: 2026, month: 6, description: 'Conta Bradesco', category: 'Ativo', type: 'Conta Bradesco', value: 8138.50 },
  { year: 2026, month: 6, description: 'Investimentos BTG', category: 'Ativo', type: 'Investimentos BTG', value: 3342699.42 },
  { year: 2026, month: 6, description: 'Mercado Pago', category: 'Ativo', type: 'Mercado Pago', value: 173676.14 },
  { year: 2026, month: 6, description: 'FGTS Caixa', category: 'Ativo', type: 'FGTS Caixa', value: 7168.34 },
  
  // PASSIVOS - Despesas (Cartão de Crédito e outros)
  { year: 2025, month: 1, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 5489.91 },
  { year: 2025, month: 1, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 822.76 },
  { year: 2025, month: 1, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 750 },
  { year: 2025, month: 1, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 297.90 },
  { year: 2025, month: 1, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 631.61 },
  { year: 2025, month: 1, description: 'Luz', category: 'Passivo', type: 'Luz', value: 94.88 },
  { year: 2025, month: 1, description: 'Gás', category: 'Passivo', type: 'Gás', value: 28.07 },
  
  { year: 2025, month: 2, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 6240.44 },
  { year: 2025, month: 2, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 711.06 },
  { year: 2025, month: 2, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 750 },
  { year: 2025, month: 2, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 306.68 },
  { year: 2025, month: 2, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 164.93 },
  { year: 2025, month: 2, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 185.48 },
  { year: 2025, month: 2, description: 'Luz', category: 'Passivo', type: 'Luz', value: 97.87 },
  { year: 2025, month: 2, description: 'Gás', category: 'Passivo', type: 'Gás', value: 28.47 },
  
  { year: 2025, month: 3, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 5518.29 },
  { year: 2025, month: 3, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 711.06 },
  { year: 2025, month: 3, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 750 },
  { year: 2025, month: 3, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 306.68 },
  { year: 2025, month: 3, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 164.93 },
  { year: 2025, month: 3, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 102.28 },
  { year: 2025, month: 3, description: 'Luz', category: 'Passivo', type: 'Luz', value: 133.60 },
  { year: 2025, month: 3, description: 'Gás', category: 'Passivo', type: 'Gás', value: 28.68 },
  
  { year: 2025, month: 4, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 5344.39 },
  { year: 2025, month: 4, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 711.06 },
  { year: 2025, month: 4, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 4, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 306.68 },
  { year: 2025, month: 4, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 164.93 },
  { year: 2025, month: 4, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 513.39 },
  { year: 2025, month: 4, description: 'Luz', category: 'Passivo', type: 'Luz', value: 119.54 },
  { year: 2025, month: 4, description: 'Gás', category: 'Passivo', type: 'Gás', value: 39.27 },
  
  { year: 2025, month: 5, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3423.44 },
  { year: 2025, month: 5, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 711.06 },
  { year: 2025, month: 5, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 5, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 312.68 },
  { year: 2025, month: 5, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 164.93 },
  { year: 2025, month: 5, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 55.28 },
  { year: 2025, month: 5, description: 'Luz', category: 'Passivo', type: 'Luz', value: 110.61 },
  { year: 2025, month: 5, description: 'Gás', category: 'Passivo', type: 'Gás', value: 28.78 },
  
  { year: 2025, month: 6, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3668.53 },
  { year: 2025, month: 6, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 711.06 },
  { year: 2025, month: 6, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 6, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 316.50 },
  { year: 2025, month: 6, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 164.93 },
  { year: 2025, month: 6, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 385.57 },
  { year: 2025, month: 6, description: 'Luz', category: 'Passivo', type: 'Luz', value: 105.68 },
  { year: 2025, month: 6, description: 'Gás', category: 'Passivo', type: 'Gás', value: 39.36 },
  
  { year: 2025, month: 7, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 2896.13 },
  { year: 2025, month: 7, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 711.06 },
  { year: 2025, month: 7, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 7, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 316.50 },
  { year: 2025, month: 7, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 173.75 },
  { year: 2025, month: 7, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 237.26 },
  { year: 2025, month: 7, description: 'Luz', category: 'Passivo', type: 'Luz', value: 107.99 },
  { year: 2025, month: 7, description: 'Gás', category: 'Passivo', type: 'Gás', value: 39.33 },
  
  { year: 2025, month: 8, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 4315.27 },
  { year: 2025, month: 8, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2025, month: 8, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 8, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2025, month: 8, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 173.75 },
  { year: 2025, month: 8, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 467.40 },
  { year: 2025, month: 8, description: 'Luz', category: 'Passivo', type: 'Luz', value: 128.76 },
  { year: 2025, month: 8, description: 'Gás', category: 'Passivo', type: 'Gás', value: 28.52 },
  
  { year: 2025, month: 9, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 4068.62 },
  { year: 2025, month: 9, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2025, month: 9, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 9, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2025, month: 9, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 173.75 },
  { year: 2025, month: 9, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 264.78 },
  { year: 2025, month: 9, description: 'Luz', category: 'Passivo', type: 'Luz', value: 118.79 },
  { year: 2025, month: 9, description: 'Gás', category: 'Passivo', type: 'Gás', value: 14.69 },
  
  { year: 2025, month: 10, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 2763.67 },
  { year: 2025, month: 10, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2025, month: 10, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 10, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2025, month: 10, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 173.75 },
  { year: 2025, month: 10, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 179.37 },
  { year: 2025, month: 10, description: 'Luz', category: 'Passivo', type: 'Luz', value: 146.10 },
  { year: 2025, month: 10, description: 'Gás', category: 'Passivo', type: 'Gás', value: 27.24 },
  
  { year: 2025, month: 11, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3031.38 },
  { year: 2025, month: 11, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2025, month: 11, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 11, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2025, month: 11, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 173.75 },
  { year: 2025, month: 11, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 123.27 },
  { year: 2025, month: 11, description: 'Luz', category: 'Passivo', type: 'Luz', value: 151.55 },
  { year: 2025, month: 11, description: 'Gás', category: 'Passivo', type: 'Gás', value: 39.61 },
  
  { year: 2025, month: 12, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 2578.67 },
  { year: 2025, month: 12, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2025, month: 12, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830 },
  { year: 2025, month: 12, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2025, month: 12, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 173.75 },
  { year: 2025, month: 12, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 107.77 },
  { year: 2025, month: 12, description: 'Luz', category: 'Passivo', type: 'Luz', value: 143.54 },
  { year: 2025, month: 12, description: 'Gás', category: 'Passivo', type: 'Gás', value: 39.40 },
  
  // PASSIVOS - 2026
  { year: 2026, month: 1, description: 'IPVA', category: 'Passivo', type: 'IPVA/Licenciamento', value: 2859.69 },
  { year: 2026, month: 1, description: 'Impostos DARF/DAS', category: 'Passivo', type: 'Impostos DARF/DAS', value: 166.98 },
  { year: 2026, month: 1, description: 'Contador', category: 'Passivo', type: 'Contador Mensalidade', value: 143.00 },
  { year: 2026, month: 1, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3911.59 },
  { year: 2026, month: 1, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2026, month: 1, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830.00 },
  { year: 2026, month: 1, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2026, month: 1, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 204.87 },
  { year: 2026, month: 1, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 413.01 },
  { year: 2026, month: 1, description: 'Luz', category: 'Passivo', type: 'Luz', value: 136.58 },
  { year: 2026, month: 1, description: 'Gás', category: 'Passivo', type: 'Gás', value: 40.69 },
  
  { year: 2026, month: 2, description: 'Impostos DARF/DAS', category: 'Passivo', type: 'Impostos DARF/DAS', value: 178.31 },
  { year: 2026, month: 2, description: 'Contador', category: 'Passivo', type: 'Contador Mensalidade', value: 143.00 },
  { year: 2026, month: 2, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 4096.31 },
  { year: 2026, month: 2, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 750.51 },
  { year: 2026, month: 2, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830.00 },
  { year: 2026, month: 2, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2026, month: 2, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 204.87 },
  { year: 2026, month: 2, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 147.77 },
  { year: 2026, month: 2, description: 'Luz', category: 'Passivo', type: 'Luz', value: 150.11 },
  { year: 2026, month: 2, description: 'Gás', category: 'Passivo', type: 'Gás', value: 40.14 },
  
  { year: 2026, month: 3, description: 'Impostos DARF/DAS', category: 'Passivo', type: 'Impostos DARF/DAS', value: 178.31 },
  { year: 2026, month: 3, description: 'Contador', category: 'Passivo', type: 'Contador Mensalidade', value: 143.00 },
  { year: 2026, month: 3, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3857.83 },
  { year: 2026, month: 3, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 755.43 },
  { year: 2026, month: 3, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830.00 },
  { year: 2026, month: 3, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2026, month: 3, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 204.87 },
  { year: 2026, month: 3, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 157.37 },
  { year: 2026, month: 3, description: 'Luz', category: 'Passivo', type: 'Luz', value: 128.49 },
  { year: 2026, month: 3, description: 'Gás', category: 'Passivo', type: 'Gás', value: 15.02 },
  
  { year: 2026, month: 4, description: 'Impostos DARF/DAS', category: 'Passivo', type: 'Impostos DARF/DAS', value: 178.31 },
  { year: 2026, month: 4, description: 'Contador', category: 'Passivo', type: 'Contador Mensalidade', value: 143.00 },
  { year: 2026, month: 4, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3248.27 },
  { year: 2026, month: 4, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 755.43 },
  { year: 2026, month: 4, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830.00 },
  { year: 2026, month: 4, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 311.50 },
  { year: 2026, month: 4, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 204.87 },
  { year: 2026, month: 4, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 219.90 },
  { year: 2026, month: 4, description: 'Luz', category: 'Passivo', type: 'Luz', value: 140.25 },
  { year: 2026, month: 4, description: 'Gás', category: 'Passivo', type: 'Gás', value: 47.00 },
  
  { year: 2026, month: 5, description: 'Impostos DARF/DAS', category: 'Passivo', type: 'Impostos DARF/DAS', value: 178.31 },
  { year: 2026, month: 5, description: 'Contador', category: 'Passivo', type: 'Contador Mensalidade', value: 143.00 },
  { year: 2026, month: 5, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3938.08 },
  { year: 2026, month: 5, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 755.43 },
  { year: 2026, month: 5, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830.00 },
  { year: 2026, month: 5, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 321.50 },
  { year: 2026, month: 5, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 204.87 },
  { year: 2026, month: 5, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 191.10 },
  { year: 2026, month: 5, description: 'Luz', category: 'Passivo', type: 'Luz', value: 147.92 },
  { year: 2026, month: 5, description: 'Gás', category: 'Passivo', type: 'Gás', value: 40.32 },
  
  { year: 2026, month: 6, description: 'Contador', category: 'Passivo', type: 'Contador Mensalidade', value: 143.00 },
  { year: 2026, month: 6, description: 'Cartão de Crédito', category: 'Passivo', type: 'Cartão de Crédito', value: 3552.69 },
  { year: 2026, month: 6, description: 'Condomínio', category: 'Passivo', type: 'Condomínio', value: 755.43 },
  { year: 2026, month: 6, description: 'Convênio Pais', category: 'Passivo', type: 'Convênio Pais', value: 830.00 },
  { year: 2026, month: 6, description: 'Vivo', category: 'Passivo', type: 'Vivo', value: 328.13 },
  { year: 2026, month: 6, description: 'Faculdade', category: 'Passivo', type: 'Faculdade', value: 204.87 },
  { year: 2026, month: 6, description: 'Sem Parar', category: 'Passivo', type: 'Sem Parar', value: 241.50 },
  { year: 2026, month: 6, description: 'Luz', category: 'Passivo', type: 'Luz', value: 127.63 },
  { year: 2026, month: 6, description: 'Gás', category: 'Passivo', type: 'Gás', value: 46.95 }
];

// Dados de Balanços (Totais mensais)
const balancesData = [
  // 2025
  { year: 2025, month: 1, totalAssets: 3569302.12, totalLiabilities: 8060.26, variation: 56302.12 },
  { year: 2025, month: 2, totalAssets: 3586332.10, totalLiabilities: 8752.99, variation: 17029.98 },
  { year: 2025, month: 3, totalAssets: 3613751.70, totalLiabilities: 7898.30, variation: 27419.60 },
  { year: 2025, month: 4, totalAssets: 3644069.66, totalLiabilities: 7900.77, variation: 30317.96 },
  { year: 2025, month: 5, totalAssets: 3680601.50, totalLiabilities: 6034.22, variation: 36531.84 },
  { year: 2025, month: 6, totalAssets: 3704192.25, totalLiabilities: 6654.24, variation: 23590.75 },
  { year: 2025, month: 7, totalAssets: 3730810.50, totalLiabilities: 6201.48, variation: 26618.25 },
  { year: 2025, month: 8, totalAssets: 3757907.25, totalLiabilities: 6737.04, variation: 27096.75 },
  { year: 2025, month: 9, totalAssets: 3787748.00, totalLiabilities: 6343.54, variation: 29840.75 },
  { year: 2025, month: 10, totalAssets: 3821342.75, totalLiabilities: 5440.15, variation: 33594.75 },
  { year: 2025, month: 11, totalAssets: 3833488.50, totalLiabilities: 5340.48, variation: 12145.75 },
  { year: 2025, month: 12, totalAssets: 3866975.50, totalLiabilities: 5516.66, variation: 33487.00 },
  
  // 2026
  { year: 2026, month: 1, totalAssets: 3898625.00, totalLiabilities: 10705.20, variation: 31649.50 },
  { year: 2026, month: 2, totalAssets: 3923158.00, totalLiabilities: 10303.20, variation: 24533.00 },
  { year: 2026, month: 3, totalAssets: 3955295.00, totalLiabilities: 9824.62, variation: 32137.00 },
  { year: 2026, month: 4, totalAssets: 3991107.80, totalLiabilities: 9652.62, variation: 35812.80 },
  { year: 2026, month: 5, totalAssets: 3967243.75, totalLiabilities: 9645.42, variation: -23864.05 },
  { year: 2026, month: 6, totalAssets: 3978669.42, totalLiabilities: 7747.08, variation: 11425.67 }
];

async function importData() {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB Atlas');

    // Buscar o usuário
    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.error('❌ Usuário não encontrado: brucewerk@gmail.com');
      console.log('💡 Execute npm run create-user primeiro');
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${user.email} (${user.name})`);
    console.log(`🆔 ID: ${user._id}`);

    // Limpar dados existentes do usuário
    console.log('\n🧹 Limpando dados existentes...');
    await Investment.deleteMany({ userId: user._id });
    await Transaction.deleteMany({ userId: user._id });
    await Balance.deleteMany({ userId: user._id });
    console.log('✅ Dados antigos removidos');

    // Importar Investimentos
    console.log('\n📊 Importando investimentos...');
    let count = 0;
    for (const inv of investmentsData) {
      await Investment.create({
        ...inv,
        userId: user._id
      });
      count++;
      if (count % 5 === 0) console.log(`   ${count} investimentos importados...`);
    }
    console.log(`✅ ${count} investimentos importados com sucesso!`);

    // Importar Transações
    console.log('\n💳 Importando transações...');
    count = 0;
    for (const trans of transactionsData) {
      await Transaction.create({
        ...trans,
        userId: user._id,
        date: new Date(trans.year, trans.month - 1, 1)
      });
      count++;
      if (count % 50 === 0) console.log(`   ${count} transações importadas...`);
    }
    console.log(`✅ ${count} transações importadas com sucesso!`);

    // Importar Balanços
    console.log('\n📈 Importando balanços...');
    count = 0;
    for (const bal of balancesData) {
      await Balance.create({
        ...bal,
        userId: user._id,
        variation: bal.totalAssets - bal.totalLiabilities
      });
      count++;
    }
    console.log(`✅ ${count} balanços importados com sucesso!`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 IMPORTACAO CONCLUIDA COM SUCESSO!');
    console.log('='.repeat(50));
    console.log(`\n📊 Resumo:`);
    console.log(`   - Investimentos: ${investmentsData.length}`);
    console.log(`   - Transações: ${transactionsData.length}`);
    console.log(`   - Balanços: ${balancesData.length}`);
    console.log(`\n👤 Usuário: ${user.email}`);
    console.log(`🔑 Senha: P@ssw0rd`);
    console.log('\n🌐 Acesse: http://localhost:5173/login');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

importData();