// backend/test-import.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function testImport() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const user = await User.findOne({ email: 'brucewerk@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log(`👤 Usuário: ${user.email}`);

    // Verificar dados existentes
    const Investment = require('./models/Investment');
    const Transaction = require('./models/Transaction');
    const Balance = require('./models/Balance');

    const investments = await Investment.find({ userId: user._id });
    const transactions = await Transaction.find({ userId: user._id });
    const balances = await Balance.find({ userId: user._id });

    console.log(`\n📊 Dados atuais:`);
    console.log(`   Investimentos: ${investments.length}`);
    console.log(`   Transações: ${transactions.length}`);
    console.log(`   Balanços: ${balances.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

testImport();