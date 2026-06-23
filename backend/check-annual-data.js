// backend/check-annual-data.js
const mongoose = require('mongoose');
const Balance = require('./models/Balance');

const MONGODB_URI = 'mongodb://dba:BruceWerk13@ac-xz1ocpq-shard-00-00.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-01.rqft77c.mongodb.net:27017,ac-xz1ocpq-shard-00-02.rqft77c.mongodb.net:27017/Financas?ssl=true&replicaSet=atlas-nx6n95-shard-0&authSource=admin&appName=Users';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os balanços
    const balances = await Balance.find();
    
    console.log(`\n📊 Total de balanços: ${balances.length}`);
    
    // Separar mensais e anuais
    const monthly = balances.filter(b => b.month <= 12);
    const annual = balances.filter(b => b.month === 13);
    
    console.log(`\n📈 Balanços mensais: ${monthly.length}`);
    console.log(`📊 Balanços anuais (month === 13): ${annual.length}`);
    
    if (annual.length > 0) {
      console.log('\n📋 Totais Anuais encontrados:');
      annual.forEach(b => {
        console.log(`   Ano ${b.year}:`);
        console.log(`      Ativos (O11): R$ ${b.totalAssets.toFixed(2)}`);
        console.log(`      Passivos (O25): R$ ${b.totalLiabilities.toFixed(2)}`);
        console.log(`      Variações (O27): R$ ${b.variation.toFixed(2)}`);
      });
      
      // Calcular totais
      const totalAssets = annual[annual.length - 1].totalAssets;
      const totalLiabilities = annual.reduce((sum, b) => sum + b.totalLiabilities, 0);
      const totalVariation = annual.reduce((sum, b) => sum + b.variation, 0);
      
      console.log('\n📊 TOTAIS CONSOLIDADOS:');
      console.log(`   Total de Ativos (último ano): R$ ${totalAssets.toFixed(2)}`);
      console.log(`   Total de Passivos (soma todos anos): R$ ${totalLiabilities.toFixed(2)}`);
      console.log(`   Total das Variações (soma todos anos): R$ ${totalVariation.toFixed(2)}`);
    } else {
      console.log('\n⚠️ NENHUM BALANÇO ANUAL ENCONTRADO!');
      console.log('💡 Execute: npm run import-data para importar os dados');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkData();