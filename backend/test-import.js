require('dotenv').config();
// backend/test-import.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Defina MONGODB_URI no seu .env antes de rodar este script.');
  process.exit(1);
}

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