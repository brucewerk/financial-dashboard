// backend/test-db.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function testConnection() {
  try {
    console.log('🔗 Testando conexão com MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Conectado com sucesso!');
    console.log(`📊 Banco: ${mongoose.connection.name}`);
    
    // Listar coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Coleções:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Desconectado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testConnection();