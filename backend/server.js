// backend/server.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

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
// ENDPOINTS QUE NÃO DEPENDEM DE BANCO (sempre respondem)
// ============================================================
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Diagnóstico rápido de conectividade com o banco. Chame
// GET /api/health depois de um deploy para confirmar se o problema
// é o banco (e ler a mensagem de erro exata) antes de testar o resto.
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'ok',
      mongo: 'connected',
      readyState: mongoose.connection.readyState,
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      mongo: 'disconnected',
      error: error.message,
    });
  }
});

// ============================================================
// GARANTE CONEXÃO COM O BANCO ANTES DE QUALQUER ROTA DE DADOS
// ============================================================
// Sem isso, cada rota abaixo dependeria de uma conexão aberta em
// paralelo lá no fundo do módulo, sem garantia de que já estava
// pronta quando a requisição chegasse — é isso que causava os 500
// genéricos em /api/finance/* e /api/import/excel.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ Bloqueado por falha de conexão com o banco:', error.message);
    res.status(503).json({ error: error.message });
  }
});

// ============================================================
// ROTAS
// ============================================================
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const importRoutes = require('./routes/import');

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/import', importRoutes);

// ============================================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS (última rede de segurança)
// ============================================================
// Ex.: erro lançado pelo multer (arquivo grande demais, tipo inválido)
// ou qualquer exceção que escape de um controller. Sem isso, o Express
// deixa a função travar sem responder nada ao cliente.
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
});

// ============================================================
// EXPORTAÇÃO PARA VERCEL
// ============================================================
module.exports = app;

// Iniciar servidor local (fora da Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .catch((err) => console.error(err.message))
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
      });
    });
}
