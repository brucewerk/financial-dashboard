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
const extractAnnualTotals = (data) => {
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

  const lastNonEmpty = (row) => {
    if (!row) return 0;
    for (let j = row.length - 1; j >= 0; j--) {
      if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
        return extractNumber(row[j]);
      }
    }
    return 0;
  };

  if (totalAssetsRow >= 0) totalAssets = lastNonEmpty(data[totalAssetsRow]);
  if (totalLiabilitiesRow >= 0) totalLiabilities = lastNonEmpty(data[totalLiabilitiesRow]);
  if (variationRow >= 0) totalVariation = lastNonEmpty(data[variationRow]);

  return { totalAssets, totalLiabilities, totalVariation };
};

// Função para importar uma aba de ano
const importYearSheet = async (data, year, userId, results) => {
  const yearNum = parseInt(year);
  console.log(`   📊 Processando ano ${yearNum}...`);

  let ativosStartRow = -1;
  let passivosStartRow = -1;

  for (let i = 0; i < data.length; i++) {
    if (!data[i]) continue;
    if (data[i][0] === 'BRUNO GOMES') {
      // A linha seguinte ao cabeçalho já é o primeiro ativo
      // (ex.: "APARTAMENTO VILA EMA"). Antes o código pulava essa
      // linha (usava i + 2), o que fazia o primeiro ativo da lista
      // nunca ser importado como transação.
      ativosStartRow = i + 1;
    }
    if (data[i][0] === 'IPVA/LICENC. ANUAL - BRADESCO') {
      passivosStartRow = i;
    }
  }

  const { totalAssets, totalLiabilities, totalVariation } = extractAnnualTotals(data);

  // Salvar balanço anual
  if (totalAssets > 0 || totalLiabilities > 0) {
    const existing = await Balance.findOne({
      userId,
      year: yearNum,
      month: 13,
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
          annualTotalVariation: totalVariation,
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
        annualTotalVariation: totalVariation,
      });
    }
    results.balances++;
    console.log(
      `      ✅ Balanço ${yearNum}: Ativos=${totalAssets.toFixed(2)}, Passivos=${totalLiabilities.toFixed(2)}, Variação=${totalVariation.toFixed(2)}`
    );
  }

  // Preparar arrays para inserção em lote
  const transactionsToInsert = [];

  // =============================================
  // ATIVOS
  // Colunas: 0=Descrição, 1=Dez/ano-anterior (IGNORAR), 2=Jan, ... 13=Dez
  // =============================================
  if (ativosStartRow > 0) {
    for (let i = ativosStartRow; i < data.length; i++) {
      if (!data[i] || !data[i][0] || data[i][0] === '') break;
      if (data[i][0] === 'TOTAL de ATIVOS') break;
      const row = data[i];
      if (!row[0] || row[0] === '') continue;

      for (let col = 2; col <= 13; col++) {
        const value = extractNumber(row[col]);
        if (value > 0) {
          const month = col - 1; // col 2 = mês 1 (Janeiro) ... col 13 = mês 12 (Dezembro)
          transactionsToInsert.push({
            userId,
            year: yearNum,
            month,
            description: row[0]?.toString().trim() || '',
            category: 'Ativo',
            type: row[0]?.toString().trim() || '',
            value,
            date: new Date(yearNum, month - 1, 1),
          });
        }
      }
    }
  }

  // =============================================
  // PASSIVOS
  // =============================================
  if (passivosStartRow > 0) {
    for (let i = passivosStartRow; i < data.length; i++) {
      if (!data[i] || !data[i][0] || data[i][0] === '') break;
      if (data[i][0] === 'TOTAL de PASSIVOS') continue;
      const row = data[i];
      if (!row[0] || row[0] === '') continue;

      for (let col = 2; col <= 13; col++) {
        const value = extractNumber(row[col]);
        if (value > 0) {
          const month = col - 1;
          transactionsToInsert.push({
            userId,
            year: yearNum,
            month,
            description: row[0]?.toString().trim() || '',
            category: 'Passivo',
            type: row[0]?.toString().trim() || '',
            value,
            date: new Date(yearNum, month - 1, 1),
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

// Importa a aba CARTEIRA (investimentos)
const importCarteiraSheet = async (workbook, userId, results) => {
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

  const investmentsToInsert = [];
  // Cabeçalhos de seção e de coluna que aparecem repetidos dentro da
  // própria aba (ex.: "OUTRAS CONTAS", "TODAS AS CONTAS") e não devem
  // virar registros de investimento.
  const sectionOrHeaderLabels = new Set([
    'BTG INVEST.',
    'OUTRAS CONTAS',
    'TODAS AS CONTAS',
    'TIPO',
    'PRODUTO',
    'NOME',
    'EMISSÃO',
    'VENCE',
    'ANOS',
    'VAL.COMPRA',
    'SALDO BRUTO',
    'RENDIMENTO',
    'TX.ANO(%)',
    'IR e IOF',
    'Atualização:',
    'Atualização',
  ]);

  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // O rótulo da seção pode estar na coluna A (número sequencial da
    // seção) ou na coluna B ("OUTRAS CONTAS" / "TODAS AS CONTAS"), então
    // checamos as duas em vez de só a coluna A como antes — isso evitava
    // que a seção "TODAS AS CONTAS" (que repete tudo de novo, e duplicaria
    // os investimentos) fosse pulada corretamente.
    const firstCell = row[0]?.toString().trim() || '';
    const secondCell = row[1]?.toString().trim() || '';

    if (secondCell === 'TODAS AS CONTAS') break;
    if (sectionOrHeaderLabels.has(firstCell) || sectionOrHeaderLabels.has(secondCell)) continue;
    if (/^\d+$/.test(firstCell) && !row[2]) continue; // número solto de cabeçalho de seção

    const name = row[2]?.toString().trim() || '';
    const grossBalance = extractNumber(row[7]);
    const purchaseValue = extractNumber(row[6]);
    const type = firstCell;

    if (!name && grossBalance === 0 && purchaseValue === 0) continue;

    const investment = {
      userId,
      type,
      product: row[1]?.toString().trim() || '',
      name,
      emissionDate: excelDateToDate(row[3]),
      maturityDate: excelDateToDate(row[4]),
      years: parseInt(row[5]) || 0,
      purchaseValue,
      grossBalance,
      yield: extractNumber(row[8]) || grossBalance - purchaseValue,
      annualRate: extractNumber(row[9]),
      irAndIof: extractNumber(row[10]) || 0,
    };

    investmentsToInsert.push(investment);
  }

  await Investment.deleteMany({ userId });

  if (investmentsToInsert.length > 0) {
    await Investment.insertMany(investmentsToInsert);
    results.investments = investmentsToInsert.length;
    const totalInvested = investmentsToInsert.reduce((sum, inv) => sum + inv.grossBalance, 0);
    console.log(`   ✅ ${results.investments} investimentos importados em lote`);
    console.log(`   📊 Total investido: R$ ${totalInvested.toFixed(2)}`);
  }
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

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    } catch (parseError) {
      console.error('❌ Não foi possível ler o arquivo Excel:', parseError);
      return res.status(400).json({
        error: 'Não foi possível ler o arquivo. Confirme que é um .xlsx ou .xls válido e não está corrompido.',
        details: parseError.message,
      });
    }

    const userId = req.userId;

    console.log(`📋 Abas encontradas: ${workbook.SheetNames.join(', ')}\n`);

    const results = {
      investments: 0,
      transactions: 0,
      balances: 0,
      years: [],
      errors: [],
    };

    // ==================== 1. Importar CARTEIRA (Investimentos) ====================
    if (workbook.SheetNames.includes('CARTEIRA')) {
      try {
        await importCarteiraSheet(workbook, userId, results);
      } catch (err) {
        console.error('❌ Erro ao processar CARTEIRA:', err);
        results.errors.push(`Aba CARTEIRA: ${err.message}`);
      }
    } else {
      results.errors.push('Aba "CARTEIRA" não encontrada no arquivo — investimentos não foram importados.');
    }

    // ==================== 2. Importar TODAS AS ABAS QUE SÃO ANOS ====================
    const yearSheets = workbook.SheetNames.filter((name) => isYearSheet(name));

    if (yearSheets.length > 0) {
      console.log(`\n📊 Encontradas ${yearSheets.length} abas de anos: ${yearSheets.join(', ')}`);
      yearSheets.sort((a, b) => parseInt(a) - parseInt(b));

      for (const year of yearSheets) {
        console.log(`\n📅 Processando ano ${year}...`);
        try {
          const sheet = workbook.Sheets[year];
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const hasData = data
            .slice(0, 20)
            .some((row) => row && row.some((cell) => cell !== undefined && cell !== null && cell !== ''));

          if (hasData) {
            await importYearSheet(data, year, userId, results);
            results.years.push(parseInt(year));
          } else {
            console.log(`   ⚠️ Aba ${year} está vazia, ignorando...`);
          }
        } catch (err) {
          // Um erro em uma aba de ano não deve derrubar a importação
          // inteira — as outras abas continuam sendo processadas e o
          // problema aparece no relatório final em vez de um 500 cego.
          console.error(`❌ Erro ao processar a aba ${year}:`, err);
          results.errors.push(`Aba ${year}: ${err.message}`);
        }
      }
    } else {
      results.errors.push('Nenhuma aba de ano (ex.: "2025", "2026") foi encontrada no arquivo.');
    }

    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORTAÇÃO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log(`⏱️  Tempo de execução: ${elapsedSeconds} segundos`);
    console.log(`📊 Resumo:`);
    console.log(`   - Investimentos: ${results.investments}`);
    console.log(`   - Transações: ${results.transactions}`);
    console.log(`   - Balanços Anuais: ${results.balances}`);
    console.log(`   - Anos importados: ${results.years.join(', ')}`);
    if (results.errors.length > 0) {
      console.log(`   - Avisos/erros: ${results.errors.join(' | ')}`);
    }

    res.json({
      success: true,
      message:
        results.errors.length > 0
          ? 'Importação concluída com avisos — veja "errors" no resultado.'
          : 'Importação concluída com sucesso!',
      elapsedTime: `${elapsedSeconds}s`,
      results,
    });
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
