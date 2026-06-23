// backend/import-annual-direct.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// Dados anuais da planilha (coluna O)
const annualData = [
  { year: 2025, totalAssets: 3866975.50, totalLiabilities: 335016.00, totalVariation: 33487.00 },
  { year: 2026, totalAssets: 4036682.40, totalLiabilities: 216159.22, totalVariation: 360882.40 }
];

// Dados mensais da planilha (para garantir que existam)
const monthlyData = [
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

async function importAnnualDirect() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado\n');

    // Buscar usuário
    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado: brucewerk@gmail.com');
      console.log('💡 Execute npm run create-user primeiro');
      process.exit(1);
    }
    console.log(`👤 Usuário: ${user.email}\n`);

    // Remover dados anuais existentes (month === 13)
    const deleted = await Balance.deleteMany({ 
      userId: user._id, 
      month: 13 
    });
    console.log(`🧹 Removidos ${deleted.deletedCount} balanços anuais antigos\n`);

    // Remover dados mensais existentes
    const deletedMonthly = await Balance.deleteMany({ 
      userId: user._id, 
      month: { $lte: 12 } 
    });
    console.log(`🧹 Removidos ${deletedMonthly.deletedCount} balanços mensais antigos\n`);

    // Inserir dados mensais
    console.log('📈 Inserindo balanços mensais...');
    let count = 0;
    for (const data of monthlyData) {
      await Balance.create({
        ...data,
        userId: user._id
      });
      count++;
    }
    console.log(`✅ ${count} balanços mensais inseridos\n`);

    // Inserir dados anuais (month = 13)
    console.log('📊 Inserindo balanços anuais...');
    count = 0;
    for (const data of annualData) {
      await Balance.create({
        userId: user._id,
        year: data.year,
        month: 13,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        variation: data.totalVariation,
        annualTotalAssets: data.totalAssets,
        annualTotalLiabilities: data.totalLiabilities,
        annualTotalVariation: data.totalVariation
      });
      count++;
    }
    console.log(`✅ ${count} balanços anuais inseridos\n`);

    // Verificar
    const allBalances = await Balance.find({ userId: user._id });
    const annualBalances = allBalances.filter(b => b.month === 13);
    const monthlyBalances = allBalances.filter(b => b.month <= 12);

    console.log('📊 VERIFICAÇÃO FINAL:');
    console.log(`   Total balanços: ${allBalances.length}`);
    console.log(`   Mensais: ${monthlyBalances.length}`);
    console.log(`   Anuais: ${annualBalances.length}\n`);

    if (annualBalances.length > 0) {
      const lastAnnual = annualBalances[annualBalances.length - 1];
      const totalLiabilities = annualBalances.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
      const totalVariation = annualBalances.reduce((sum, b) => sum + (b.variation || 0), 0);
      
      console.log('📊 TOTAIS CONSOLIDADOS:');
      console.log(`   Total de Ativos (${lastAnnual.year}): R$ ${lastAnnual.totalAssets.toFixed(2)}`);
      console.log(`   Total de Passivos (soma todos anos): R$ ${totalLiabilities.toFixed(2)}`);
      console.log(`   Total das Variações (soma todos anos): R$ ${totalVariation.toFixed(2)}`);
    }

    console.log('\n✅ Importação concluída com sucesso!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

importAnnualDirect();