// backend/check-data-direct.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function checkDirect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar usuário
    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }
    console.log(`👤 Usuário: ${user.email}\n`);

    // Buscar TODOS os balanços
    const balances = await Balance.find({ userId: user._id }).sort({ year: 1, month: 1 });
    
    console.log(`📊 Total de balanços: ${balances.length}\n`);
    
    if (balances.length === 0) {
      console.log('⚠️ NENHUM BALANÇO ENCONTRADO!');
      console.log('💡 Execute: npm run import-data');
      process.exit(1);
    }

    // Separar por tipo
    const monthly = balances.filter(b => b.month <= 12);
    const annual = balances.filter(b => b.month === 13);
    
    console.log(`📈 Balanços mensais: ${monthly.length}`);
    console.log(`📊 Balanços anuais (month=13): ${annual.length}\n`);

    // Mostrar todos os balanços
    console.log('📋 TODOS OS BALANÇOS:');
    balances.forEach(b => {
      const tipo = b.month === 13 ? '📊 ANUAL' : `📈 MÊS ${b.month}`;
      console.log(`${tipo} ${b.year}: Ativos: ${b.totalAssets}, Passivos: ${b.totalLiabilities}, Variação: ${b.variation}`);
    });

    // Calcular totais
    if (annual.length > 0) {
      const lastAnnual = annual[annual.length - 1];
      const totalLiabilities = annual.reduce((sum, b) => sum + (b.totalLiabilities || 0), 0);
      const totalVariation = annual.reduce((sum, b) => sum + (b.variation || 0), 0);
      
      console.log('\n📊 TOTAIS CONSOLIDADOS:');
      console.log(`   Total de Ativos (último ano ${lastAnnual.year}): R$ ${lastAnnual.totalAssets.toFixed(2)}`);
      console.log(`   Total de Passivos (soma todos anos): R$ ${totalLiabilities.toFixed(2)}`);
      console.log(`   Total das Variações (soma todos anos): R$ ${totalVariation.toFixed(2)}`);
    } else {
      console.log('\n⚠️ NENHUM DADO ANUAL ENCONTRADO!');
      console.log('💡 Os valores anuais precisam ser importados com month=13');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkDirect();