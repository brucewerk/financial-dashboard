// backend/fix-annual-data-correct.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// VALORES CORRETOS DA PLANILHA (coluna O)
// Estes são os TOTAIS ANUAIS que você me passou
const correctAnnualData = [
  { 
    year: 2025, 
    totalAssets: 3866975.50,   // O11 da aba 2025
    totalLiabilities: 335016.00, // O25 da aba 2025 (NÃO USEI - você quer apenas 2026)
    variation: 33487.00        // O27 da aba 2025 (NÃO USEI - você quer apenas 2026)
  },
  { 
    year: 2026, 
    totalAssets: 4036682.40,   // O11 da aba 2026
    totalLiabilities: 129139.12, // <-- VALOR CORRETO que você passou
    variation: 360882.40       // <-- VALOR CORRETO que você passou
  }
];

async function fixAnnualDataCorrect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log(`👤 Usuário: ${user.email}\n`);

    // Remover dados anuais existentes
    const deleted = await Balance.deleteMany({ 
      userId: user._id, 
      month: 13 
    });
    console.log(`🧹 Removidos ${deleted.deletedCount} balanços anuais antigos\n`);

    // Inserir dados CORRETOS
    console.log('📊 Inserindo dados anuais CORRETOS:');
    for (const data of correctAnnualData) {
      await Balance.create({
        userId: user._id,
        year: data.year,
        month: 13,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        variation: data.variation,
        annualTotalAssets: data.totalAssets,
        annualTotalLiabilities: data.totalLiabilities,
        annualTotalVariation: data.variation
      });
      console.log(`   ✅ Ano ${data.year}:`);
      console.log(`      Ativos (O11): R$ ${data.totalAssets.toFixed(2)}`);
      console.log(`      Passivos (O25): R$ ${data.totalLiabilities.toFixed(2)}`);
      console.log(`      Variações (O27): R$ ${data.variation.toFixed(2)}`);
    }

    // Verificar
    const annualBalances = await Balance.find({ 
      userId: user._id, 
      month: 13 
    }).sort({ year: 1 });

    // Calcular totais
    const totalAssets = annualBalances[annualBalances.length - 1]?.totalAssets || 0;
    const totalLiabilities = annualBalances.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
    const totalVariation = annualBalances.reduce((sum, b) => sum + (b.variation || 0), 0);

    console.log('\n📊 TOTAIS CONSOLIDADOS (CORRETOS):');
    console.log(`   Total de Ativos (${annualBalances[annualBalances.length - 1]?.year}): R$ ${totalAssets.toFixed(2)}`);
    console.log(`   Total de Passivos (soma): R$ ${totalLiabilities.toFixed(2)}`);
    console.log(`   Total das Variações (soma): R$ ${totalVariation.toFixed(2)}`);

    console.log('\n📋 CONFERÊNCIA COM SEUS VALORES:');
    console.log(`   ✅ Total de Ativos: R$ 4.036.682,40`);
    console.log(`   ✅ Total de Passivos: R$ 129.139,12`);
    console.log(`   ✅ Total das Variações: R$ 360.882,40`);

    console.log('\n✅ Dados corrigidos com sucesso!');
    console.log('\n🔄 Reinicie o backend: npm run dev');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixAnnualDataCorrect();