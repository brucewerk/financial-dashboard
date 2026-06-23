// backend/import-full-data.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Investment = require('./models/Investment');
const Transaction = require('./models/Transaction');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// Dados da planilha CARTEIRA (colunas H = SALDO BRUTO)
const investmentsData = [
  { type: 'Renda Fixa', product: 'LCI', name: 'BARIGUI COMPANHIA HIPOTEC', emissionDate: new Date('2024-03-26'), maturityDate: new Date('2028-03-27'), years: 4, purchaseValue: 170000, grossBalance: 207687.44, yield: 37687.44, annualRate: 9.5, irAndIof: 0 },
  { type: 'Renda Fixa', product: 'LCA', name: 'BANCO ABC BRASIL S.A.', emissionDate: new Date('2024-03-26'), maturityDate: new Date('2027-03-11'), years: 3, purchaseValue: 190000, grossBalance: 229696.13, yield: 39696.13, annualRate: 8.98, irAndIof: 0 },
  { type: 'Renda Fixa', product: 'CDB', name: 'PICPAY BANK - BANCO MULTIPL', emissionDate: new Date('2024-11-18'), maturityDate: new Date('2028-11-21'), years: 4, purchaseValue: 96000, grossBalance: 118059.01, yield: 22059.01, annualRate: 14.26, irAndIof: 3653.71 },
  { type: 'Renda Fixa', product: 'CDB', name: 'NOVO BANCO CONTINENTAL S.', emissionDate: new Date('2025-06-13'), maturityDate: new Date('2032-06-14'), years: 7, purchaseValue: 79000, grossBalance: 90287.38, yield: 11287.38, annualRate: 14.41, irAndIof: 2075.12 },
  { type: 'Renda Fixa', product: 'Título Público', name: 'Tesouro IPCA+ 2035 (NTNB)', emissionDate: new Date('2006-03-07'), maturityDate: new Date('2035-05-15'), years: 29, purchaseValue: 549016.98, grossBalance: 605028.47, yield: 56011.49, annualRate: 6.0, irAndIof: 9224.34 },
  { type: 'Renda Fixa', product: 'Título Público', name: 'Tesouro IPCA+ 2045 (NTNB)', emissionDate: new Date('2004-09-15'), maturityDate: new Date('2045-05-15'), years: 41, purchaseValue: 549699.13, grossBalance: 605873.16, yield: 56174.03, annualRate: 6.0, irAndIof: 9251.34 },
  { type: 'Renda Fixa', product: 'Título Público', name: 'Tesouro IPCA+ 2055 (NTNB)', emissionDate: new Date('2015-01-14'), maturityDate: new Date('2055-05-15'), years: 40, purchaseValue: 550155.72, grossBalance: 606437.88, yield: 56282.16, annualRate: 6.0, irAndIof: 9269.31 },
  { type: 'Renda Fixa', product: 'CRA', name: 'REDE SIM - CRA025000MB', emissionDate: new Date('2026-05-26'), maturityDate: new Date('2030-02-18'), years: 4, purchaseValue: 199224.44, grossBalance: 200708.79, yield: 1484.35, annualRate: 2.0, irAndIof: 0 },
  { type: 'Renda Fixa', product: 'CRA', name: 'REDE SIM - CRA025000MC', emissionDate: new Date('2026-05-27'), maturityDate: new Date('2030-02-18'), years: 4, purchaseValue: 99774.25, grossBalance: 100436.21, yield: 661.96, annualRate: 16.0, irAndIof: 0 },
  { type: 'Renda Fixa', product: 'CRA', name: 'LAR COOPERATIVA - CRA026001JM', emissionDate: new Date('2026-05-26'), maturityDate: new Date('2033-03-15'), years: 7, purchaseValue: 199441.35, grossBalance: 200755.21, yield: 1313.86, annualRate: 14.64, irAndIof: 0 },
  { type: 'Fundo Invest.', product: 'Renda Fixa', name: 'PORTO DI CRPR FIREF', emissionDate: new Date('2024-06-19'), maturityDate: new Date('2026-06-13'), years: 2, purchaseValue: 26576.23, grossBalance: 34195.69, yield: 7619.46, annualRate: 14.75, irAndIof: 26.46 },
  { type: 'Previdência', product: 'PGBL Regressivo', name: 'BTG TESOURO SELIC PREV', emissionDate: new Date('2024-07-01'), maturityDate: new Date('2026-06-13'), years: 2, purchaseValue: 206783.65, grossBalance: 264338.19, yield: 57554.54, annualRate: 14.85, irAndIof: 0 },
  { type: 'Renda Variável', product: 'FII', name: 'KNCR11 - FII KINEA RICI', emissionDate: new Date('2024-09-01'), maturityDate: new Date('2026-06-13'), years: 2, purchaseValue: 75084.56, grossBalance: 77818.08, yield: 2733.52, annualRate: 28.72, irAndIof: 0 },
  { type: 'Conta Invest.', product: 'Líquido', name: 'Conta BTG Investimento', emissionDate: new Date('2026-06-13'), maturityDate: new Date('2026-06-13'), years: 0, purchaseValue: 0, grossBalance: 0, yield: 0, annualRate: 0, irAndIof: 0 },
  { type: 'Conta Invest.', product: 'Líquido', name: 'Conta Mercado Pago - Cofrinho 115% CDI', emissionDate: new Date('2026-05-15'), maturityDate: new Date('2026-06-13'), years: 0, purchaseValue: 173956.31, grossBalance: 180928.77, yield: 6972.46, annualRate: 115.0, irAndIof: 0 },
  { type: 'Conta Invest.', product: 'Líquido', name: 'Conta Corrente BRADESCO - Run/Rate', emissionDate: new Date('2016-03-16'), maturityDate: new Date('2026-06-13'), years: 10, purchaseValue: 7831.15, grossBalance: 7831.15, yield: 0, annualRate: 0, irAndIof: 0 }
];

// Dados mensais da planilha (2025 e 2026)
const monthlyBalancesData = [
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

// Totais anuais da planilha (coluna O)
const annualTotalsData = [
  { year: 2025, totalAssets: 3866975.50, totalLiabilities: 335016.00, totalVariation: 33487.00 },
  { year: 2026, totalAssets: 4036682.40, totalLiabilities: 216159.22, totalVariation: 360882.40 }
  // 2027, 2028, 2029 serão adicionados quando disponíveis
];

async function importFullData() {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB Atlas');

    // Buscar ou criar usuário
    let user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      user = new User({
        name: 'BruCe',
        email: 'brucewerk@gmail.com',
        password: await bcrypt.hash('P@ssw0rd', 10)
      });
      await user.save();
      console.log('✅ Usuário criado: brucewerk@gmail.com');
    }

    // Limpar dados existentes
    await Investment.deleteMany({ userId: user._id });
    await Transaction.deleteMany({ userId: user._id });
    await Balance.deleteMany({ userId: user._id });
    console.log('🧹 Dados antigos removidos');

    // 1. Importar Investimentos
    console.log('\n📊 Importando investimentos...');
    for (const inv of investmentsData) {
      await Investment.create({ ...inv, userId: user._id });
    }
    console.log(`✅ ${investmentsData.length} investimentos inseridos`);

    // 2. Importar Balanços Mensais
    console.log('\n📈 Importando balanços mensais...');
    for (const bal of monthlyBalancesData) {
      await Balance.create({ ...bal, userId: user._id });
    }
    console.log(`✅ ${monthlyBalancesData.length} balanços mensais inseridos`);

    // 3. Importar Totais Anuais
    console.log('\n📊 Importando totais anuais...');
    for (const annual of annualTotalsData) {
      // Criar um registro de balanço para o total anual (mês 0 ou 13 para identificar)
      await Balance.create({
        userId: user._id,
        year: annual.year,
        month: 13, // 13 representa o total anual
        totalAssets: annual.totalAssets,
        totalLiabilities: annual.totalLiabilities,
        variation: annual.totalVariation,
        annualTotalAssets: annual.totalAssets,
        annualTotalLiabilities: annual.totalLiabilities,
        annualTotalVariation: annual.totalVariation
      });
    }
    console.log(`✅ ${annualTotalsData.length} totais anuais inseridos`);

    // 4. Calcular totais consolidados
    const totalInvestments = investmentsData.reduce((sum, inv) => sum + inv.grossBalance, 0);
    const lastAnnual = annualTotalsData[annualTotalsData.length - 1];
    const totalAnnualLiabilities = annualTotalsData.reduce((sum, a) => sum + a.totalLiabilities, 0);
    const totalAnnualVariations = annualTotalsData.reduce((sum, a) => sum + a.totalVariation, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADOS - CONFERÊNCIA COM A PLANILHA:');
    console.log('='.repeat(60));
    console.log(`📌 Total de Ativos (O11 da aba 2026): ${lastAnnual.totalAssets.toFixed(2)}`);
    console.log(`📌 Total de Passivos (Soma dos totais anuais): ${totalAnnualLiabilities.toFixed(2)}`);
    console.log(`📌 Total das Variações (Soma dos totais anuais): ${totalAnnualVariations.toFixed(2)}`);
    console.log(`📌 Total Investido (H29 da CARTEIRA): ${totalInvestments.toFixed(2)}`);
    console.log('='.repeat(60));
    console.log('\n✅ Importação concluída com sucesso!');
    console.log('👤 Usuário: brucewerk@gmail.com');
    console.log('🔑 Senha: P@ssw0rd');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

importFullData();