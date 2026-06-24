// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Configuração CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://seu-dominio.vercel.app', // Substitua pelo seu domínio
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// Importar rotas
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const importRoutes = require('./routes/import');

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/import', importRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Rota de health check para Vercel
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== CONEXÃO MONGODB ====================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

// Conectar ao MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
  console.log('📊 Banco de dados: Financas');
})
.catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB Atlas:', err);
  console.log('⚠️ Verifique a string de conexão e as credenciais');
});

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 5000;

// Para Vercel, exportar o app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

// Para Vercel, exportar o app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
  });
}