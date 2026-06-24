// build.js
const { execSync } = require('child_process');

console.log('📦 Buildando frontend...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('✅ Build concluído!');
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}