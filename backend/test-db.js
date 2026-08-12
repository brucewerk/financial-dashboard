require('dotenv').config();
// backend/test-db.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Defina MONGODB_URI no seu .env antes de rodar este script.');
  process.exit(1);
}

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