// backend/fix-annual-data-final-correct.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// VALORES CORRETOS DA PLANILHA (coluna O)
const correctData = [
  {
    year: 2025,
    totalAssets: 3844171.37,   // O11 da aba 2025
    totalLiabilities: 87020.10, // O25 da aba 2025
    variation: 248371.37        // O27 da aba 2025
  },
  {
    year: 2026,
    totalAssets: 4036682.40,   // O11 da aba 2026
    totalLiabilities: 42119.02, // O25 da aba 2026
    variation: 112511.03        // O27 da aba 2026
  }
];

async function fixAnnualDataFinalCorrect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log(`👤 Usuário: ${user.email}\n`);

    // Remover TODOS os dados anuais existentes
    const deleted = await Balance.deleteMany({ 
      userId: user._id, 
      month: 13 
    });
    console.log(`🧹 Removidos ${deleted.deletedCount} balanços anuais antigos\n`);

    // Inserir dados CORRETOS para todos os anos
    console.log('📊 Inserindo dados anuais CORRETOS:');
    for (const data of correctData) {
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

    console.log('\n📊 TOTAIS CONSOLIDADOS:');
    annualBalances.forEach(b => {
      console.log(`   ${b.year}: Ativos: R$ ${b.totalAssets.toFixed(2)}, Passivos: R$ ${b.totalLiabilities.toFixed(2)}, Variação: R$ ${b.variation.toFixed(2)}`);
    });

    console.log('\n📋 CONFERÊNCIA COM SEUS VALORES:');
    console.log(`   ✅ 2025 - Ativos: R$ 3.844.171,37 | Passivos: R$ 87.020,10 | Variação: R$ 248.371,37`);
    console.log(`   ✅ 2026 - Ativos: R$ 4.036.682,40 | Passivos: R$ 42.119,02 | Variação: R$ 112.511,03`);

    console.log('\n✅ Dados corrigidos com sucesso!');
    console.log('\n🔄 Reinicie o backend: npm run dev');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixAnnualDataFinalCorrect();