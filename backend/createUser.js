// backend/createUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function createUser() {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB Atlas');

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: 'admin@finance.com' });
    if (existingUser) {
      console.log('⚠️ Usuário já existe:', existingUser.email);
      
      // Atualizar senha para garantir
      existingUser.password = await bcrypt.hash('admin123', 10);
      await existingUser.save();
      console.log('✅ Senha atualizada para admin123');
      
      console.log('📝 Credenciais:');
      console.log('   Email: admin@finance.com');
      console.log('   Senha: admin123');
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Criar novo usuário
    console.log('🆕 Criando novo usuário...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = new User({
      name: 'Administrador',
      email: 'admin@finance.com',
      password: hashedPassword
    });

    await user.save();
    console.log('✅ Usuário criado com sucesso!');
    console.log('📝 Credenciais:');
    console.log('   Email: admin@finance.com');
    console.log('   Senha: admin123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createUser();