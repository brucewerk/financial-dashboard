require('dotenv').config();
// backend/test-connection.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Defina MONGODB_URI no seu .env antes de rodar este script.');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado com sucesso!');
    
    // Listar usuários
    const users = await User.find();
    console.log(`📊 Total de usuários: ${users.length}`);
    
    if (users.length > 0) {
      console.log('📝 Usuários encontrados:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`);
      });
    } else {
      console.log('⚠️ Nenhum usuário encontrado. Execute: npm run create-user');
    }
    
    await mongoose.disconnect();
    console.log('✅ Desconectado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

testConnection();