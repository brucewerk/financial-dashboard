// backend/config/db.js
//
// Conexão com o MongoDB Atlas preparada para ambiente serverless (Vercel).
//
// Por que isto é necessário:
// Em uma função serverless, o processo Node pode ser reaproveitado entre
// requisições (warm start) ou recriado do zero (cold start). Se a conexão
// for aberta "solta" no topo do arquivo (como antes, com `mongoose.connect()`
// sem await), cada nova invocação pode tentar abrir outra conexão antes da
// primeira terminar, e qualquer rota que dependa do banco fica "pendurada"
// no buffer do Mongoose até estourar o timeout — o que aparece pro usuário
// como um 500 genérico e sem explicação, em QUALQUER rota que use o banco.
//
// Este módulo resolve isso:
// 1) Guarda a conexão (ou a Promise dela) em `global`, reaproveitando entre
//    invocações warm.
// 2) Falha rápido (bufferCommands: false + serverSelectionTimeoutMS curto)
//    em vez de deixar a requisição travada por 10s+ até dar timeout.
// 3) Se a conexão falhar, devolve um erro com uma mensagem clara — não um
//    "buffering timed out" genérico — para facilitar o diagnóstico.

const mongoose = require('mongoose');

// (lida dentro de connectDB(), não aqui no topo — ver explicação abaixo)

let cached = global.__mongoConnection;
if (!cached) {
  cached = global.__mongoConnection = { conn: null, promise: null };
}

async function connectDB() {
  // Lido AQUI DENTRO (não como uma const no topo do arquivo) de propósito:
  // se este módulo for importado antes de `dotenv.config()` rodar em algum
  // outro ponto de entrada, uma const no topo capturaria `undefined` para
  // sempre. Lendo a cada chamada, isso nunca pode travar dessa forma.
  const MONGODB_URI = process.env.MONGODB_URI;

  // Conexão já pronta e saudável — reaproveita.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI não está definida nas variáveis de ambiente. ' +
      'Configure-a em Vercel → Project Settings → Environment Variables ' +
      '(no projeto do BACKEND) e faça um novo deploy.'
    );
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 8000, // falha rápido se não achar o cluster
        socketTimeoutMS: 20000,
        connectTimeoutMS: 8000,
        maxPoolSize: 10,
        family: 4, // força IPv4 (evita problemas de resolução em alguns runtimes serverless)
        retryWrites: true,
        retryReads: true,
        bufferCommands: false, // não empilha queries esperando conexão — erra na hora
      })
      .then((mongooseInstance) => {
        console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
        return mongooseInstance;
      })
      .catch((err) => {
        // Libera a promise para a próxima requisição poder tentar de novo
        // (por exemplo, depois que o usuário corrigir a variável de ambiente).
        cached.promise = null;
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        throw new Error(
          `Não foi possível conectar ao MongoDB Atlas: ${err.message}. ` +
          'Verifique: 1) a MONGODB_URI está correta e com a senha certa; ' +
          '2) em Atlas → Network Access, 0.0.0.0/0 está liberado (a Vercel usa IPs dinâmicos); ' +
          '3) o cluster não está pausado.'
        );
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
