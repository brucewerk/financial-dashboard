// backend/check-models.js
const fs = require('fs');
const path = require('path');

console.log('📁 Verificando estrutura de arquivos...\n');

// Verificar se os arquivos existem
const files = [
  'models/Investment.js',
  'models/Transaction.js',
  'models/Balance.js',
  'models/User.js',
  'controllers/financeController.js',
  'routes/finance.js',
  'routes/auth.js',
  'middleware/auth.js',
  'server.js'
];

let allExist = true;
files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - NÃO ENCONTRADO`);
    allExist = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allExist) {
  console.log('✅ Todos os arquivos existem!');
  
  // Tentar importar os models
  try {
    console.log('\n🔍 Tentando importar models...');
    const Investment = require('./models/Investment');
    console.log('✅ Investment carregado com sucesso');
    
    const Transaction = require('./models/Transaction');
    console.log('✅ Transaction carregado com sucesso');
    
    const Balance = require('./models/Balance');
    console.log('✅ Balance carregado com sucesso');
    
    const User = require('./models/User');
    console.log('✅ User carregado com sucesso');
    
    console.log('\n🎉 Todos os models foram carregados corretamente!');
  } catch (error) {
    console.error('\n❌ Erro ao carregar models:', error.message);
  }
} else {
  console.log('❌ Alguns arquivos estão faltando!');
}