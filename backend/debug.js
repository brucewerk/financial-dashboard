// backend/debug.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function debug() {
  try {
    console.log('🔗 Conectando...');
    await mongoose.connect(MONGODB_URI);
    
    // 1. Verificar conexão
    console.log('✅ Conectado!');
    
    // 2. Listar todas as coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Coleções:', collections.map(c => c.name));
    
    // 3. Verificar usuários
    const users = await User.find();
    console.log(`👥 Usuários encontrados: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`);
    });
    
    // 4. Criar usuário se não existir
    if (users.length === 0) {
      console.log('🆕 Criando usuário...');
      const hashed = await bcrypt.hash('admin123', 10);
      const user = new User({
        name: 'Administrador',
        email: 'admin@finance.com',
        password: hashed
      });
      await user.save();
      console.log('✅ Usuário criado!');
    }
    
    // 5. Testar login
    const testUser = await User.findOne({ email: 'admin@finance.com' });
    if (testUser) {
      const isValid = await bcrypt.compare('admin123', testUser.password);
      console.log(`🔐 Senha válida: ${isValid}`);
    }
    
    await mongoose.disconnect();
    console.log('✅ Debug completo!');
    console.log('📝 Credenciais: admin@finance.com / admin123');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debug();