// backend/controllers/importController.js
const XLSX = require('xlsx');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Balance = require('../models/Balance');

// Função para converter data do Excel para Date
const excelDateToDate = (excelDate) => {
  if (!excelDate) return null;
  if (excelDate instanceof Date) return excelDate;
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  }
  return new Date(excelDate);
};

// Função para extrair número de um valor
const extractNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[R$.\s]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Função para identificar se uma aba é um ano (4 dígitos)
const isYearSheet = (sheetName) => {
  return /^\d{4}$/.test(sheetName);
};

// Função para extrair totais anuais de uma aba
const extractAnnualTotals = (data, year) => {
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalVariation = 0;
  let totalAssetsRow = -1;
  let totalLiabilitiesRow = -1;
  let variationRow = -1;

  for (let i = 0; i < data.length; i++) {
    if (!data[i]) continue;
    const row = data[i];
    if (row[0] === 'TOTAL de ATIVOS') {
      totalAssetsRow = i;
    }
    if (row[0] === 'TOTAL de PASSIVOS') {
      totalLiabilitiesRow = i;
    }
    if (row[0] === 'VARIAÇÃO entre MESES') {
      variationRow = i;
    }
  }

  // Total de Ativos - coluna 14 (O)
  if (totalAssetsRow > 0 && data[totalAssetsRow]) {
    const row = data[totalAssetsRow];
    for (let j = row.length - 1; j >= 0; j--) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        totalAssets = extractNumber(row[j]);
        break;
      }
    }
  }

  // Total de Passivos - coluna 14 (O)
  if (totalLiabilitiesRow > 0 && data[totalLiabilitiesRow]) {
    const row = data[totalLiabilitiesRow];
    for (let j = row.length - 1; j >= 0; j--) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        totalLiabilities = extractNumber(row[j]);
        break;
      }
    }
  }

  // Variação Total - coluna 14 (O)
  if (variationRow > 0 && data[variationRow]) {
    const row = data[variationRow];
    for (let j = row.length - 1; j >= 0; j--) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        totalVariation = extractNumber(row[j]);
        break;
      }
    }
  }

  return { totalAssets, totalLiabilities, totalVariation };
};

// Função para importar uma aba de ano - CORRIGIDA
const importYearSheet = async (data, year, userId, results) => {
  const yearNum = parseInt(year);
  console.log(`   📊 Processando ano ${yearNum}...`);

  let ativosStartRow = -1;
  let passivosStartRow = -1;
  
  for (let i = 0; i < data.length; i++) {
    if (!data[i]) continue;
    if (data[i][0] === 'BRUNO GOMES') {
      ativosStartRow = i + 2;
    }
    if (data[i][0] === 'IPVA/LICENC. ANUAL - BRADESCO') {
      passivosStartRow = i;
    }
  }

  const { totalAssets, totalLiabilities, totalVariation } = extractAnnualTotals(data, year);

  // Salvar balanço anual
  if (totalAssets > 0 || totalLiabilities > 0) {
    const existing = await Balance.findOne({ 
      userId, 
      year: yearNum, 
      month: 13 
    });
    
    if (existing) {
      await Balance.updateOne(
        { _id: existing._id },
        {
          totalAssets,
          totalLiabilities,
          variation: totalVariation,
          annualTotalAssets: totalAssets,
          annualTotalLiabilities: totalLiabilities,
          annualTotalVariation: totalVariation
        }
      );
    } else {
      await Balance.create({
        userId,
        year: yearNum,
        month: 13,
        totalAssets,
        totalLiabilities,
        variation: totalVariation,
        annualTotalAssets: totalAssets,
        annualTotalLiabilities: totalLiabilities,
        annualTotalVariation: totalVariation
      });
    }
    results.balances++;
    console.log(`      ✅ Balanço ${yearNum}: Ativos=${totalAssets.toFixed(2)}, Passivos=${totalLiabilities.toFixed(2)}, Variação=${totalVariation.toFixed(2)}`);
  }

  // Preparar arrays para inserção em lote
  const transactionsToInsert = [];

  // =============================================
  // ATIVOS - CORRIGIDO: Ignora coluna 1 (Dezembro anterior)
  // Colunas: 0=Descrição, 1=Dez/ano-ant (IGNORAR), 2=Jan, 3=Fev... 13=Dez
  // =============================================
  if (ativosStartRow > 0) {
    for (let i = ativosStartRow; i < data.length; i++) {
      if (!data[i] || !data[i][0] || data[i][0] === '') break;
      if (data[i][0] === 'TOTAL de ATIVOS') break;
      const row = data[i];
      if (!row[0] || row[0] === '') continue;
      
      // Coluna 2 (Janeiro) até coluna 13 (Dezembro)
      for (let col = 2; col <= 13; col++) {
        const value = extractNumber(row[col]);
        if (value > 0) {
          const month = col - 1; // col 2 = mês 1, col 13 = mês 12
          transactionsToInsert.push({
            userId,
            year: yearNum,
            month: month,
            description: row[0]?.toString().trim() || '',
            category: 'Ativo',
            type: row[0]?.toString().trim() || '',
            value: value,
            date: new Date(yearNum, month - 1, 1)
          });
        }
      }
    }
  }

  // =============================================
  // PASSIVOS - CORRIGIDO: Ignora coluna 1 (Dezembro anterior)
  // =============================================
  if (passivosStartRow > 0) {
    for (let i = passivosStartRow; i < data.length; i++) {
      if (!data[i] || !data[i][0] || data[i][0] === '') break;
      if (data[i][0] === 'TOTAL de PASSIVOS') continue;
      const row = data[i];
      if (!row[0] || row[0] === '') continue;
      
      // Coluna 2 (Janeiro) até coluna 13 (Dezembro)
      for (let col = 2; col <= 13; col++) {
        const value = extractNumber(row[col]);
        if (value > 0) {
          const month = col - 1;
          transactionsToInsert.push({
            userId,
            year: yearNum,
            month: month,
            description: row[0]?.toString().trim() || '',
            category: 'Passivo',
            type: row[0]?.toString().trim() || '',
            value: value,
            date: new Date(yearNum, month - 1, 1)
          });
        }
      }
    }
  }

  // INSERÇÃO EM LOTE
  if (transactionsToInsert.length > 0) {
    await Transaction.deleteMany({ userId, year: yearNum });
    
    const batchSize = 500;
    for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
      const batch = transactionsToInsert.slice(i, i + batchSize);
      await Transaction.insertMany(batch);
    }
    results.transactions += transactionsToInsert.length;
    console.log(`      ✅ ${transactionsToInsert.length} transações importadas em lote`);
  }

  return results;
};

// ==================== FUNÇÃO PRINCIPAL ====================

exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`\n📊 Iniciando importação do arquivo: ${req.file.originalname}`);
    console.log(`📦 Tamanho: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`⏱️  ${new Date().toLocaleString()}\n`);

    const startTime = Date.now();
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const userId = req.userId;

    console.log(`📋 Abas encontradas: ${workbook.SheetNames.join(', ')}\n`);

    const results = {
      investments: 0,
      transactions: 0,
      balances: 0,
      years: [],
      errors: []
    };

    // ==================== 1. Importar CARTEIRA (Investimentos) ====================
    if (workbook.SheetNames.includes('CARTEIRA')) {
      console.log('📈 Processando aba CARTEIRA...');
      const sheet = workbook.Sheets['CARTEIRA'];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      let startRow = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i][0] === 'TIPO') {
          startRow = i + 1;
          break;
        }
      }

      await Investment.deleteMany({ userId });

      const investmentsToInsert = [];

      for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        if (row[0] === 'TODAS AS CONTAS') break;
        
        const firstCell = row[0]?.toString().trim() || '';
        
        // Pular cabeçalhos
        if (firstCell === 'BTG INVEST.') continue;
        if (firstCell === 'Outras Contas') continue;
        if (firstCell === 'OUTRAS CONTAS') continue;
        if (firstCell === 'TODAS AS CONTAS') continue;
        if (firstCell === 'TIPO') continue;
        if (firstCell === 'PRODUTO') continue;
        if (firstCell === 'NOME') continue;
        if (firstCell === 'EMISSÃO') continue;
        if (firstCell === 'VENCE') continue;
        if (firstCell === 'ANOS') continue;
        if (firstCell === 'VAL.COMPRA') continue;
        if (firstCell === 'SALDO BRUTO') continue;
        if (firstCell === 'RENDIMENTO') continue;
        if (firstCell === 'TX.ANO(%)') continue;
        if (firstCell === 'IR e IOF') continue;
        if (firstCell === 'Atualização:') continue;
        if (firstCell === 'Atualização') continue;
        if (firstCell.startsWith('=')) continue;
        if (firstCell === '1' || firstCell === '2' || firstCell === '3' || firstCell === '0') continue;

        const name = row[2]?.toString().trim() || '';
        const grossBalance = extractNumber(row[7]);
        const purchaseValue = extractNumber(row[6]);
        const type = row[0]?.toString().trim() || '';

        if (!name && grossBalance === 0 && purchaseValue === 0) continue;
        if (name.toUpperCase() === 'OUTRAS CONTAS') continue;
        if (name.toUpperCase() === 'TODAS AS CONTAS') continue;
        if (!type && !name) continue;
        if (name === 'NOME' || name === 'EMISSÃO' || name === 'VENCE') continue;
        if (name === 'VAL.COMPRA' || name === 'SALDO BRUTO' || name === 'RENDIMENTO') continue;

        const investment = {
          userId,
          type: type,
          product: row[1]?.toString().trim() || '',
          name: name,
          emissionDate: excelDateToDate(row[3]),
          maturityDate: excelDateToDate(row[4]),
          years: parseInt(row[5]) || 0,
          purchaseValue: purchaseValue,
          grossBalance: grossBalance,
          yield: extractNumber(row[8]) || grossBalance - purchaseValue,
          annualRate: extractNumber(row[9]),
          irAndIof: extractNumber(row[10]) || 0
        };

        if (investment.name || investment.grossBalance > 0 || investment.purchaseValue > 0) {
          investmentsToInsert.push(investment);
        }
      }

      if (investmentsToInsert.length > 0) {
        await Investment.insertMany(investmentsToInsert);
        results.investments = investmentsToInsert.length;
        console.log(`   ✅ ${results.investments} investimentos importados em lote`);
        const totalInvested = investmentsToInsert.reduce((sum, inv) => sum + inv.grossBalance, 0);
        console.log(`   📊 Total investido (H29): R$ ${totalInvested.toFixed(2)}`);
      }
    }

    // ==================== 2. Importar TODAS AS ABAS QUE SÃO ANOS ====================
    const yearSheets = workbook.SheetNames.filter(name => isYearSheet(name));
    
    if (yearSheets.length > 0) {
      console.log(`\n📊 Encontradas ${yearSheets.length} abas de anos: ${yearSheets.join(', ')}`);
      yearSheets.sort((a, b) => parseInt(a) - parseInt(b));

      for (const year of yearSheets) {
        console.log(`\n📅 Processando ano ${year}...`);
        const sheet = workbook.Sheets[year];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        let hasData = false;
        for (let i = 0; i < Math.min(20, data.length); i++) {
          if (data[i] && data[i].some(cell => cell !== undefined && cell !== null && cell !== '')) {
            hasData = true;
            break;
          }
        }

        if (hasData) {
          await importYearSheet(data, year, userId, results);
          results.years.push(parseInt(year));
        } else {
          console.log(`   ⚠️ Aba ${year} está vazia, ignorando...`);
        }
      }
    }

    // ==================== TEMPO DE EXECUÇÃO ====================
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORTACAO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log(`⏱️  Tempo de execução: ${elapsedSeconds} segundos`);
    console.log(`📊 Resumo:`);
    console.log(`   - Investimentos: ${results.investments}`);
    console.log(`   - Transações: ${results.transactions}`);
    console.log(`   - Balanços Anuais: ${results.balances}`);
    console.log(`   - Anos importados: ${results.years.join(', ')}`);

    res.json({
      success: true,
      message: 'Importação concluída com sucesso!',
      elapsedTime: `${elapsedSeconds}s`,
      results: {
        investments: results.investments,
        transactions: results.transactions,
        balances: results.balances,
        years: results.years,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};