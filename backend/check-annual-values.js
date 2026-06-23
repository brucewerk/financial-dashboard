// backend/check-annual-values.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function checkAnnualValues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    // Buscar TODOS os balanços anuais (month === 13)
    const annualBalances = await Balance.find({ 
      userId: user._id, 
      month: 13 
    }).sort({ year: 1 });

    console.log(`📊 Encontrados ${annualBalances.length} balanços anuais:\n`);

    // Mostrar cada ano
    annualBalances.forEach(b => {
      console.log(`   Ano ${b.year}:`);
      console.log(`      Ativos (O11): R$ ${b.totalAssets.toFixed(2)}`);
      console.log(`      Passivos (O25): R$ ${b.totalLiabilities.toFixed(2)}`);
      console.log(`      Variações (O27): R$ ${b.variation.toFixed(2)}`);
      console.log('');
    });

    // Calcular totais
    const totalLiabilities = annualBalances.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
    const totalVariation = annualBalances.reduce((sum, b) => sum + (b.variation || 0), 0);
    const lastAnnual = annualBalances[annualBalances.length - 1];

    console.log('📊 TOTAIS CONSOLIDADOS:');
    console.log(`   Total de Ativos (último ano ${lastAnnual?.year}): R$ ${lastAnnual?.totalAssets?.toFixed(2) || 0}`);
    console.log(`   Total de Passivos (soma): R$ ${totalLiabilities.toFixed(2)}`);
    console.log(`   Total das Variações (soma): R$ ${totalVariation.toFixed(2)}`);

    // VALORES ESPERADOS DA PLANILHA
    console.log('\n📋 VALORES ESPERADOS DA PLANILHA:');
    console.log(`   Total de Passivos (O25 2025 + O25 2026): R$ 335.016,00 + R$ 216.159,22 = R$ 551.175,22`);
    console.log(`   Total das Variações (O27 2025 + O27 2026): R$ 33.487,00 + R$ 360.882,40 = R$ 394.369,40`);

    console.log('\n⚠️ ATENÇÃO: Os valores no banco correspondem aos totais ANUAIS da planilha!');
    console.log('💡 Se você quer a SOMA dos totais anuais, os valores acima estão corretos.');
    console.log('💡 Se você quer apenas o valor do ANO MAIS RECENTE, use apenas o último ano.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkAnnualValues();