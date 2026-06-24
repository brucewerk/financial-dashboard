const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Iniciando build do frontend...');

// Verificar se a pasta frontend existe
if (!fs.existsSync(path.join(__dirname, 'frontend'))) {
  console.error('❌ Pasta frontend não encontrada!');
  process.exit(1);
}

try {
  console.log('📦 Instalando dependências do frontend (incluindo vite)...');
  // Instalar todas as dependências do frontend
  execSync('cd frontend && npm install --include=dev', { stdio: 'inherit' });
  
  console.log('🔨 Buildando o frontend...');
  execSync('cd frontend && npx vite build', { stdio: 'inherit' });
  
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}