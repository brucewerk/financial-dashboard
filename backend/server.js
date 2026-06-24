// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ============================================================
// CONFIGURAÇÃO CORS – ROBUSTA E COMPLETA
// ============================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://financial-frontend-kappa.vercel.app',
  'https://financial-frontend.vercel.app',
  'https://klingklang-finance.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origem (ex: Postman, curl)
      if (!origin) return callback(null, true);

      // Permite qualquer subdomínio .vercel.app (solução abrangente)
      const isVercel = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);

      if (allowedOrigins.includes(origin) || isVercel) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS bloqueado para: ${origin}`);
        callback(new Error('CORS bloqueado'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Log para debug (opcional, mas ajuda)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origem: ${req.headers.origin || 'sem origem'}`);
  next();
});

app.use(express.json());

// ============================================================
// ROTAS
// ============================================================
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const importRoutes = require('./routes/import');

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/import', importRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// ============================================================
// CONEXÃO MONGODB – CORRIGIDA (SEM bufferCommands: false)
// ============================================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI não definida nas variáveis de ambiente!');
}

// Opções otimizadas para Vercel – bufferCommands: true é o padrão, não precisa declarar
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // 30 segundos
  socketTimeoutMS: 45000,          // 45 segundos
  connectTimeoutMS: 30000,         // 30 segundos
  maxPoolSize: 10,
  family: 4,                       // Força IPv4
  retryWrites: true,
  retryReads: true,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso!'))
  .catch((err) => console.error('❌ Erro MongoDB:', err.message));

// ============================================================
// EXPORTAÇÃO PARA VERCEL
// ============================================================
module.exports = app;

// Iniciar servidor local (fora da Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}