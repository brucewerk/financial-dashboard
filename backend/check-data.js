// backend/check-data.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Investment = require('./models/Investment');
const Transaction = require('./models/Transaction');
const Balance = require('./models/Balance');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log(`\n👤 Usuário: ${user.email}`);
    
    const investments = await Investment.find({ userId: user._id });
    const transactions = await Transaction.find({ userId: user._id });
    const balances = await Balance.find({ userId: user._id });

    console.log('\n📊 Dados importados:');
    console.log(`   - Investimentos: ${investments.length}`);
    console.log(`   - Transações: ${transactions.length}`);
    console.log(`   - Balanços: ${balances.length}`);

    // Totais
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.grossBalance, 0);
    console.log(`\n💰 Total em Investimentos: R$ ${totalInvestments.toFixed(2)}`);

    const lastBalance = balances[balances.length - 1];
    if (lastBalance) {
      console.log(`\n📈 Último balanço (${lastBalance.year}/${lastBalance.month}):`);
      console.log(`   - Ativos: R$ ${lastBalance.totalAssets.toFixed(2)}`);
      console.log(`   - Passivos: R$ ${lastBalance.totalLiabilities.toFixed(2)}`);
      console.log(`   - Patrimônio: R$ ${(lastBalance.totalAssets - lastBalance.totalLiabilities).toFixed(2)}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkData();