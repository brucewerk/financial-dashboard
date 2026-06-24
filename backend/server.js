// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Configuração CORS - CORRIGIDA para aceitar o frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://klingklang-finance.vercel.app',
  'https://financial-dashboard-phi-five.vercel.app',
  'https://financial-frontend-kappa.vercel.app',
  'https://financial-frontend.vercel.app',
  'https://financial-backend-beta.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Permite qualquer subdomínio *.vercel.app
    const isVercel = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isVercel;

    console.log(`🔍 CORS - Origem: ${origin} - Permitido: ${isAllowed}`); // Log para debug

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origem: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// Rotas
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const importRoutes = require('./routes/import');

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/import', importRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Rota raiz (opcional)
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'Backend API - Financial Dashboard',
    version: '1.0.0',
    endpoints: [
      '/api/test',
      '/api/auth/login',
      '/api/auth/register',
      '/api/finance/*',
      '/api/import/*'
    ]
  });
});

// Conexão MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso!'))
.catch(err => console.error('❌ Erro MongoDB:', err));

// Exportar para Vercel
module.exports = app;

// Iniciar servidor local (fora da Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  });
}