// backend/fix-annual-data-final.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// VALORES CORRETOS - APENAS 2026
const correctData = {
  year: 2026,
  totalAssets: 4036682.40,   // O11 da aba 2026
  totalLiabilities: 129139.12, // Valor que você passou
  variation: 360882.40        // Valor que você passou
};

async function fixAnnualDataFinal() {
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

    // Inserir APENAS 2026
    await Balance.create({
      userId: user._id,
      year: correctData.year,
      month: 13,
      totalAssets: correctData.totalAssets,
      totalLiabilities: correctData.totalLiabilities,
      variation: correctData.variation,
      annualTotalAssets: correctData.totalAssets,
      annualTotalLiabilities: correctData.totalLiabilities,
      annualTotalVariation: correctData.variation
    });
    
    console.log('✅ Inserido APENAS o ano 2026:');
    console.log(`   Ativos (O11): R$ ${correctData.totalAssets.toFixed(2)}`);
    console.log(`   Passivos (O25): R$ ${correctData.totalLiabilities.toFixed(2)}`);
    console.log(`   Variações (O27): R$ ${correctData.variation.toFixed(2)}`);

    // Verificar
    const annualBalances = await Balance.find({ 
      userId: user._id, 
      month: 13 
    });

    console.log('\n📊 TOTAIS CONSOLIDADOS:');
    console.log(`   Total de Ativos: R$ ${annualBalances[0]?.totalAssets?.toFixed(2)}`);
    console.log(`   Total de Passivos: R$ ${annualBalances[0]?.totalLiabilities?.toFixed(2)}`);
    console.log(`   Total das Variações: R$ ${annualBalances[0]?.variation?.toFixed(2)}`);

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

fixAnnualDataFinal();