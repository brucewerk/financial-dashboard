// backend/seed.js - Atualizado com valores corretos
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  // ... (todos os outros investimentos da planilha)
];

// Dados de Balanços (Totais mensais) - Valores corretos da planilha
const balancesData = [
  // 2025 - Valores da planilha
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
  
  // 2026 - Valores da planilha
  { year: 2026, month: 1, totalAssets: 3898625.00, totalLiabilities: 10705.20, variation: 31649.50 },
  { year: 2026, month: 2, totalAssets: 3923158.00, totalLiabilities: 10303.20, variation: 24533.00 },
  { year: 2026, month: 3, totalAssets: 3955295.00, totalLiabilities: 9824.62, variation: 32137.00 },
  { year: 2026, month: 4, totalAssets: 3991107.80, totalLiabilities: 9652.62, variation: 35812.80 },
  { year: 2026, month: 5, totalAssets: 3967243.75, totalLiabilities: 9645.42, variation: -23864.05 },
  { year: 2026, month: 6, totalAssets: 3978669.42, totalLiabilities: 7747.08, variation: 11425.67 }
];

async function seedDatabase() {
  try {
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

    // Inserir investimentos
    for (const inv of investmentsData) {
      await Investment.create({
        ...inv,
        userId: user._id
      });
    }
    console.log(`✅ ${investmentsData.length} investimentos inseridos`);

    // Inserir balanços
    for (const bal of balancesData) {
      await Balance.create({
        ...bal,
        userId: user._id
      });
    }
    console.log(`✅ ${balancesData.length} balanços inseridos`);

    console.log('\n📊 Resumo dos Dados:');
    console.log(`   - Total de Ativos (O11): R$ ${balancesData[balancesData.length-1].totalAssets.toFixed(2)}`);
    console.log(`   - Total de Passivos (O25): R$ ${balancesData[balancesData.length-1].totalLiabilities.toFixed(2)}`);
    const totalVariation = balancesData.reduce((sum, b) => sum + b.variation, 0);
    console.log(`   - Total das Variações (O27): R$ ${totalVariation.toFixed(2)}`);
    const totalInvestments = investmentsData.reduce((sum, inv) => sum + inv.grossBalance, 0);
    console.log(`   - Total Investido (H29): R$ ${totalInvestments.toFixed(2)}`);

    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seedDatabase();