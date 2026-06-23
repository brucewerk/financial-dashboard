// frontend/src/pages/Reports.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line
} from 'recharts';
import { finance } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { darkMode } = useThemeContext();
  const reportRef = useRef(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [annualData, setAnnualData] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    saldo: 0,
    variation: 0
  });
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalVariation: 0,
    totalInvestments: 0
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, transRes, balRes, statsRes] = await Promise.all([
        finance.getInvestments(),
        finance.getTransactions(),
        finance.getBalances(),
        finance.getStats()
      ]);
      
      setInvestments(invRes.data || []);
      setTransactions(transRes.data || []);
      
      const allBalances = balRes.data || [];
      const monthlyBalances = allBalances.filter(b => b.month <= 12);
      setBalances(monthlyBalances);
      
      const statsData = statsRes.data || {};
      setStats({
        totalAssets: statsData.totalAssets || 0,
        totalLiabilities: statsData.totalLiabilities || 0,
        totalVariation: statsData.totalVariation || 0,
        totalInvestments: statsData.totalInvestments || 0
      });

      const annualBalances = allBalances.filter(b => b.month === 13 && b.year === selectedYear);
      if (annualBalances.length > 0) {
        const annual = annualBalances[0];
        const originalAssets = annual.totalAssets || 0;
        const originalLiabilities = annual.totalLiabilities || 0;
        const totalAssets = originalAssets + originalLiabilities;
        const saldo = totalAssets - originalLiabilities;
        
        setAnnualData({
          totalAssets: totalAssets,
          totalLiabilities: originalLiabilities,
          saldo: saldo,
          variation: annual.variation || 0
        });
      } else {
        const originalAssets = statsData.totalAssets || 0;
        const originalLiabilities = statsData.totalLiabilities || 0;
        const totalAssets = originalAssets + originalLiabilities;
        const saldo = totalAssets - originalLiabilities;
        
        setAnnualData({
          totalAssets: totalAssets,
          totalLiabilities: originalLiabilities,
          saldo: saldo,
          variation: statsData.totalVariation || 0
        });
      }
      
      const years = [...new Set(transRes.data.map(t => t.year))].sort();
      setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()]);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredTransactions(
      transactions.filter((t) => t.year === selectedYear)
    );
  }, [transactions, selectedYear]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Dados para gráficos de investimentos
  const investmentByType = investments.reduce((acc, inv) => {
    const type = inv.type || 'Outros';
    acc[type] = (acc[type] || 0) + (inv.grossBalance || 0);
    return acc;
  }, {});

  const investmentChartData = Object.entries(investmentByType).map(([name, value]) => ({
    name,
    value
  }));

  // Dados para análise de transações do ano selecionado
  const expensesByCategory = filteredTransactions
    .filter((t) => t.category === 'Passivo')
    .reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.value;
      return acc;
    }, {});

  const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Dados para evolução mensal do ano selecionado
  const monthlyData = balances
    .filter(b => b.year === selectedYear)
    .map((b) => ({
      month: `${b.month}/${b.year}`,
      ativos: b.totalAssets || 0,
      passivos: b.totalLiabilities || 0,
      patrimonio: (b.totalAssets || 0) - (b.totalLiabilities || 0),
      variacao: b.variation || 0
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#A569BD'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ 
          p: 1.5, 
          bgcolor: 'background.paper',
          border: '1px solid ' + (darkMode ? '#444' : '#e0e0e0'),
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(entry.value)}</span>
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Abrevia nomes para o gráfico de despesas
  const abbreviateName = (name, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // ==================== FUNÇÃO DE EXPORTAR PDF ====================
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const usableWidth = pageWidth - (margin * 2);
      
      const addHeader = (pdf, title, pageNum) => {
        pdf.setFillColor(25, 118, 210);
        pdf.rect(0, 0, pageWidth, 9, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Finance Dashboard - Relatório Financeiro', margin, 6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${pageNum}`, pageWidth - margin - 12, 6);
        pdf.setTextColor(0, 0, 0);
      };
      
      const addFooter = (pdf) => {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 6, pageWidth - margin, pageHeight - 6);
        pdf.setFontSize(5);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 2);
        pdf.text('Finance Dashboard', pageWidth - margin - 25, pageHeight - 2);
        pdf.setTextColor(0, 0, 0);
      };
      
      let pageNum = 1;
      let isFirstPage = true;
      
      const addPageWithImage = async (element, title, pageNum) => {
        const canvas = await html2canvas(element, { 
          scale: 2, 
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;
        
        addHeader(pdf, title, pageNum);
        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', margin, 12, imgWidth, imgHeight);
        addFooter(pdf);
        
        return pageNum + 1;
      };

      const addHtmlAsPage = async (htmlContent, title, pageNum) => {
        const container = document.createElement('div');
        container.style.width = '700px';
        container.style.padding = '15px';
        container.style.backgroundColor = '#ffffff';
        container.style.fontFamily = 'Arial, sans-serif';
        container.innerHTML = htmlContent;
        document.body.appendChild(container);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        pageNum = await addPageWithImage(container, title, pageNum);
        document.body.removeChild(container);
        return pageNum;
      };

      // ===== PÁGINA 1: Título e Cards =====
      const headerElement = document.createElement('div');
      headerElement.style.width = '700px';
      headerElement.style.padding = '15px';
      headerElement.style.backgroundColor = '#ffffff';
      headerElement.style.fontFamily = 'Arial, sans-serif';
      
      headerElement.innerHTML = `
        <div style="text-align: center; border-bottom: 3px solid #1976d2; padding-bottom: 12px; margin-bottom: 15px;">
          <h1 style="color: #1976d2; margin: 0; font-size: 22px;">📊 Relatório Financeiro</h1>
          <p style="color: #666; margin: 4px 0 0 0; font-size: 13px;">Ano: ${selectedYear} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total de Ativos</p>
            <p style="color: #1976d2; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalAssets)}</p>
          </div>
          <div style="background: #fce4ec; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total de Passivos</p>
            <p style="color: #dc004e; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalLiabilities)}</p>
          </div>
          <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total das Variações</p>
            <p style="color: #2e7d32; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalVariation)}</p>
          </div>
          <div style="background: #fff3e0; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total Investido</p>
            <p style="color: #ed6c02; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalInvestments)}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(headerElement);
      pageNum = await addPageWithImage(headerElement, 'Resumo Geral', pageNum);
      document.body.removeChild(headerElement);

      // ===== PÁGINA 2: Distribuição de Investimentos =====
      const chartWrappers = document.querySelectorAll('.recharts-wrapper');
      
      if (chartWrappers.length > 0) {
        const chartContainer1 = document.createElement('div');
        chartContainer1.style.width = '700px';
        chartContainer1.style.padding = '15px';
        chartContainer1.style.backgroundColor = '#ffffff';
        chartContainer1.style.fontFamily = 'Arial, sans-serif';
        
        const title1 = document.createElement('h3');
        title1.style.cssText = 'color: #1976d2; margin: 0 0 10px 0; font-size: 16px; text-align: center;';
        title1.textContent = '🍩 Distribuição de Investimentos por Tipo';
        chartContainer1.appendChild(title1);
        
        const clone1 = chartWrappers[0].cloneNode(true);
        clone1.style.width = '100%';
        clone1.style.height = '430px';
        chartContainer1.appendChild(clone1);
        document.body.appendChild(chartContainer1);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        pageNum = await addPageWithImage(chartContainer1, 'Distribuição de Investimentos', pageNum);
        document.body.removeChild(chartContainer1);
      }

      // ===== PÁGINA 3: Despesas por Categoria =====
      if (chartWrappers.length > 1) {
        const chartContainer2 = document.createElement('div');
        chartContainer2.style.width = '700px';
        chartContainer2.style.padding = '15px';
        chartContainer2.style.backgroundColor = '#ffffff';
        chartContainer2.style.fontFamily = 'Arial, sans-serif';
        
        const title2 = document.createElement('h3');
        title2.style.cssText = 'color: #1976d2; margin: 0 0 15px 0; font-size: 16px; text-align: center;';
        title2.textContent = `📊 Despesas por Categoria - ${selectedYear}`;
        chartContainer2.appendChild(title2);
        
        const clone2 = chartWrappers[1].cloneNode(true);
        clone2.style.width = '100%';
        clone2.style.height = '420px';
        chartContainer2.appendChild(clone2);
        document.body.appendChild(chartContainer2);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        pageNum = await addPageWithImage(chartContainer2, `Despesas por Categoria - ${selectedYear}`, pageNum);
        document.body.removeChild(chartContainer2);
      }

      // ===== PÁGINA 4: Evolução Patrimonial =====
      if (chartWrappers.length > 2) {
        const chartContainer3 = document.createElement('div');
        chartContainer3.style.width = '700px';
        chartContainer3.style.padding = '15px';
        chartContainer3.style.backgroundColor = '#ffffff';
        chartContainer3.style.fontFamily = 'Arial, sans-serif';
        
        const title3 = document.createElement('h3');
        title3.style.cssText = 'color: #1976d2; margin: 0 0 15px 0; font-size: 16px; text-align: center;';
        title3.textContent = `📈 Evolução Patrimonial - ${selectedYear}`;
        chartContainer3.appendChild(title3);
        
        const clone3 = chartWrappers[2].cloneNode(true);
        clone3.style.width = '100%';
        clone3.style.height = '420px';
        chartContainer3.appendChild(clone3);
        document.body.appendChild(chartContainer3);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        pageNum = await addPageWithImage(chartContainer3, `Evolução Patrimonial - ${selectedYear}`, pageNum);
        document.body.removeChild(chartContainer3);
      }

      // ===== PÁGINA 5: Resumo de Transações =====
      let transHtml = `
        <h3 style="color: #1976d2; margin: 0 0 12px 0; font-size: 16px; text-align: center;">📋 Resumo de Transações - ${selectedYear}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="background: #e3f2fd; padding: 8px; border-radius: 4px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 9px;">Total de Ativos</p>
            <p style="color: #1976d2; font-size: 14px; font-weight: bold; margin: 2px 0 0 0;">${formatCurrency(annualData.totalAssets)}</p>
          </div>
          <div style="background: #fce4ec; padding: 8px; border-radius: 4px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 9px;">Total de Passivos</p>
            <p style="color: #dc004e; font-size: 14px; font-weight: bold; margin: 2px 0 0 0;">${formatCurrency(annualData.totalLiabilities)}</p>
          </div>
          <div style="background: #e8f5e9; padding: 8px; border-radius: 4px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 9px;">Saldo</p>
            <p style="color: #2e7d32; font-size: 14px; font-weight: bold; margin: 2px 0 0 0;">${formatCurrency(annualData.saldo)}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
              <th style="text-align: left; padding: 4px 5px; font-weight: bold;">Data</th>
              <th style="text-align: left; padding: 4px 5px; font-weight: bold;">Descrição</th>
              <th style="text-align: left; padding: 4px 5px; font-weight: bold;">Categoria</th>
              <th style="text-align: left; padding: 4px 5px; font-weight: bold;">Tipo</th>
              <th style="text-align: right; padding: 4px 5px; font-weight: bold;">Valor</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      const displayTransactions = filteredTransactions.slice(0, 25);
      displayTransactions.forEach(trans => {
        const color = trans.category === 'Ativo' ? '#2e7d32' : '#dc004e';
        transHtml += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 3px 5px;">${trans.month}/${trans.year}</td>
            <td style="padding: 3px 5px;">${trans.description}</td>
            <td style="padding: 3px 5px; color: ${color}; font-weight: bold;">${trans.category}</td>
            <td style="padding: 3px 5px;">${trans.type}</td>
            <td style="padding: 3px 5px; text-align: right; color: ${color}; font-weight: bold;">${formatCurrency(trans.value)}</td>
          </tr>
        `;
      });
      
      if (filteredTransactions.length > 25) {
        transHtml += `
          <tr>
            <td colspan="5" style="text-align: center; padding: 6px; font-style: italic; color: #999; font-size: 8px;">
              ... e mais ${filteredTransactions.length - 25} transações
            </td>
          </tr>
        `;
      }
      
      transHtml += `
          </tbody>
        </table>
      `;
      
      pageNum = await addHtmlAsPage(transHtml, `Resumo de Transações - ${selectedYear}`, pageNum);

      // ===== PÁGINA 6: Resumo de Investimentos =====
      let invHtml = `
        <h3 style="color: #1976d2; margin: 0 0 12px 0; font-size: 16px; text-align: center;">📊 Resumo de Investimentos</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 9px;">Total de Investimentos</p>
            <p style="color: #1976d2; font-size: 14px; font-weight: bold; margin: 2px 0 0 0;">${formatCurrency(investments.reduce((sum, inv) => sum + (inv.grossBalance || 0), 0))}</p>
          </div>
          <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 9px;">Quantidade de Ativos</p>
            <p style="color: #1976d2; font-size: 14px; font-weight: bold; margin: 2px 0 0 0;">${investments.length}</p>
          </div>
          <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 9px;">Rendimento Médio</p>
            <p style="color: #1976d2; font-size: 14px; font-weight: bold; margin: 2px 0 0 0;">${investments.length > 0 ? (investments.reduce((sum, inv) => sum + (inv.annualRate || 0), 0) / investments.length).toFixed(2) + '%' : '0%'}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5px;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
              <th style="text-align: left; padding: 3px 4px; font-weight: bold;">Tipo</th>
              <th style="text-align: left; padding: 3px 4px; font-weight: bold;">Produto</th>
              <th style="text-align: left; padding: 3px 4px; font-weight: bold;">Nome</th>
              <th style="text-align: left; padding: 3px 4px; font-weight: bold;">Vencimento</th>
              <th style="text-align: right; padding: 3px 4px; font-weight: bold;">Valor</th>
              <th style="text-align: right; padding: 3px 4px; font-weight: bold;">Rendimento</th>
              <th style="text-align: right; padding: 3px 4px; font-weight: bold;">Taxa</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      investments.slice(0, 20).forEach(inv => {
        invHtml += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 2px 4px;">${inv.type}</td>
            <td style="padding: 2px 4px;">${inv.product}</td>
            <td style="padding: 2px 4px;">${inv.name}</td>
            <td style="padding: 2px 4px;">${inv.maturityDate ? new Date(inv.maturityDate).toLocaleDateString('pt-BR') : '-'}</td>
            <td style="padding: 2px 4px; text-align: right;">${formatCurrency(inv.grossBalance)}</td>
            <td style="padding: 2px 4px; text-align: right; color: ${(inv.yield || 0) >= 0 ? '#2e7d32' : '#dc004e'};">${formatCurrency(inv.yield || 0)}</td>
            <td style="padding: 2px 4px; text-align: right;">${inv.annualRate}%</td>
          </tr>
        `;
      });
      
      if (investments.length > 20) {
        invHtml += `
          <tr>
            <td colspan="7" style="text-align: center; padding: 5px; font-style: italic; color: #999; font-size: 7px;">
              ... e mais ${investments.length - 20} investimentos
            </td>
          </tr>
        `;
      }
      
      invHtml += `
          </tbody>
        </table>
      `;
      
      pageNum = await addHtmlAsPage(invHtml, 'Resumo de Investimentos', pageNum);
      
      pdf.save(`Relatorio_Financeiro_${selectedYear}.pdf`);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Cabeçalho com botão de exportar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          📊 Relatórios
        </Typography>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={exportToPDF}
          disabled={exporting || loading}
          sx={{
            backgroundColor: '#dc004e',
            '&:hover': {
              backgroundColor: '#b71c1c'
            },
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          {exporting ? 'Gerando PDF...' : '📄 Exportar PDF'}
        </Button>
      </Box>

      {/* Conteúdo do Relatório - Versão para Visualização */}
      <div ref={reportRef} style={{ backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', padding: '20px' }}>
        {/* Título do Relatório */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3, 
          pb: 2, 
          borderBottom: '2px solid ' + (darkMode ? '#333' : '#1976d2')
        }}>
          <Typography variant="h5" fontWeight="bold" color={darkMode ? '#64b5f6' : 'primary'}>
            📊 Relatório Financeiro
          </Typography>
          <Typography variant="subtitle1" color={darkMode ? '#aaa' : 'textSecondary'}>
            Ano: {selectedYear} | Gerado em: {new Date().toLocaleDateString('pt-BR')}
          </Typography>
        </Box>

        {/* Cards de Totais Acumulados - COM CONTRASTE MELHORADO */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: darkMode ? '#1a237e' : '#e3f2fd', 
              height: '100%',
              border: darkMode ? '1px solid #303f9f' : 'none'
            }}>
              <CardContent>
                <Typography color={darkMode ? '#90caf9' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                  Total de Ativos (Acumulado)
                </Typography>
                <Typography variant="h5" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
                  {formatCurrency(stats.totalAssets)}
                </Typography>
                <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                  (O11)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: darkMode ? '#4a148c' : '#fce4ec', 
              height: '100%',
              border: darkMode ? '1px solid #6a1b9a' : 'none'
            }}>
              <CardContent>
                <Typography color={darkMode ? '#ef9a9a' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                  Total de Passivos (Acumulado)
                </Typography>
                <Typography variant="h5" color={darkMode ? '#ef9a9a' : 'error'} fontWeight="bold">
                  {formatCurrency(stats.totalLiabilities)}
                </Typography>
                <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                  (O25)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: darkMode ? '#1b5e20' : '#e8f5e9', 
              height: '100%',
              border: darkMode ? '1px solid #2e7d32' : 'none'
            }}>
              <CardContent>
                <Typography color={darkMode ? '#a5d6a7' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                  Total das Variações (Acumulado)
                </Typography>
                <Typography variant="h5" color={darkMode ? '#81c784' : 'success'} fontWeight="bold">
                  {formatCurrency(stats.totalVariation)}
                </Typography>
                <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                  (O27)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: darkMode ? '#e65100' : '#fff3e0', 
              height: '100%',
              border: darkMode ? '1px solid #bf360c' : 'none'
            }}>
              <CardContent>
                <Typography color={darkMode ? '#ffab91' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                  Total Investido
                </Typography>
                <Typography variant="h5" color={darkMode ? '#ffab91' : 'warning.main'} fontWeight="bold">
                  {formatCurrency(stats.totalInvestments)}
                </Typography>
                <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                  (H29)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Seletor de Ano */}
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          bgcolor: 'background.paper',
          border: darkMode ? '1px solid #333' : 'none'
        }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* GRÁFICO 1 - Distribuição de Investimentos */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: darkMode ? '1px solid #333' : 'none'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: darkMode ? '#64b5f6' : '#1976d2', textAlign: 'center' }}>
              🍩 Distribuição de Investimentos por Tipo
            </Typography>
            <Box sx={{ width: '100%', height: 380 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={investmentChartData}
                    cx="50%"
                    cy="40%"
                    labelLine={true}
                    label={({ name, percent }) => {
                      const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
                      return `${shortName}\n${(percent * 100).toFixed(1)}%`;
                    }}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {investmentChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: 11, 
                      paddingTop: 8,
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      color: darkMode ? '#e0e0e0' : 'inherit'
                    }} 
                    verticalAlign="bottom" 
                    height={60}
                    layout="horizontal"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* GRÁFICO 2 - Despesas por Categoria */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: darkMode ? '1px solid #333' : 'none'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: darkMode ? '#64b5f6' : '#1976d2', textAlign: 'center' }}>
              📊 Despesas por Categoria - {selectedYear}
            </Typography>
            <Box sx={{ width: '100%', height: 380 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={expenseChartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: darkMode ? '#aaa' : '#666' }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
                    tickFormatter={(value) => abbreviateName(value, 18)}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: 11, fill: darkMode ? '#aaa' : '#666' }}
                    width={90}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: 11, 
                      paddingTop: 10,
                      color: darkMode ? '#e0e0e0' : 'inherit'
                    }} 
                    verticalAlign="bottom" 
                    height={30}
                    layout="horizontal"
                    align="center"
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#dc004e" 
                    name="Despesas" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* GRÁFICO 3 - Evolução Mensal */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: darkMode ? '1px solid #333' : 'none'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: darkMode ? '#64b5f6' : '#1976d2', textAlign: 'center' }}>
              📈 Evolução Patrimonial - {selectedYear}
            </Typography>
            <Box sx={{ width: '100%', height: 380 }}>
              <ResponsiveContainer>
                <ComposedChart 
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: darkMode ? '#aaa' : '#666' }}
                    interval={0}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: 11, fill: darkMode ? '#aaa' : '#666' }}
                    width={90}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: 11, 
                      paddingTop: 10,
                      color: darkMode ? '#e0e0e0' : 'inherit'
                    }} 
                    verticalAlign="bottom" 
                    height={30}
                    layout="horizontal"
                    align="center"
                  />
                  <Area
                    type="monotone"
                    dataKey="ativos"
                    stroke="#1976d2"
                    strokeWidth={3}
                    fill="#1976d2"
                    fillOpacity={0.2}
                    name="Ativos"
                  />
                  <Area
                    type="monotone"
                    dataKey="passivos"
                    stroke="#dc004e"
                    strokeWidth={3}
                    fill="#dc004e"
                    fillOpacity={0.2}
                    name="Passivos"
                  />
                  <Line
                    type="monotone"
                    dataKey="patrimonio"
                    stroke="#2e7d32"
                    strokeWidth={4}
                    name="Patrimônio"
                    dot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Resumo de Transações */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: darkMode ? '1px solid #333' : 'none'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: darkMode ? '#64b5f6' : '#1976d2' }}>
              📋 Resumo de Transações - {selectedYear}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  bgcolor: darkMode ? '#1a237e' : '#e3f2fd',
                  border: darkMode ? '1px solid #303f9f' : 'none'
                }}>
                  <CardContent>
                    <Typography color={darkMode ? '#90caf9' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                      Total de Ativos
                    </Typography>
                    <Typography variant="h6" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
                      {formatCurrency(annualData.totalAssets)}
                    </Typography>
                    <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                      (O11 + O25)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  bgcolor: darkMode ? '#4a148c' : '#fce4ec',
                  border: darkMode ? '1px solid #6a1b9a' : 'none'
                }}>
                  <CardContent>
                    <Typography color={darkMode ? '#ef9a9a' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                      Total de Passivos
                    </Typography>
                    <Typography variant="h6" color={darkMode ? '#ef9a9a' : 'error'} fontWeight="bold">
                      {formatCurrency(annualData.totalLiabilities)}
                    </Typography>
                    <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                      (O25)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  bgcolor: darkMode ? '#1b5e20' : '#e8f5e9',
                  border: darkMode ? '1px solid #2e7d32' : 'none'
                }}>
                  <CardContent>
                    <Typography color={darkMode ? '#a5d6a7' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                      Saldo
                    </Typography>
                    <Typography variant="h6" color={darkMode ? '#81c784' : 'success'} fontWeight="bold">
                      {formatCurrency(annualData.saldo)}
                    </Typography>
                    <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                      (O11 - O25)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Categoria</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: darkMode ? '#78909c' : 'textSecondary' }}>
                        Nenhuma transação encontrada para {selectedYear}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((trans) => (
                      <TableRow key={trans._id} hover>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{trans.month}/{trans.year}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{trans.description}</TableCell>
                        <TableCell>
                          <span style={{ 
                            color: trans.category === 'Ativo' ? (darkMode ? '#81c784' : '#2e7d32') : (darkMode ? '#ef9a9a' : '#dc004e'),
                            fontWeight: 'bold'
                          }}>
                            {trans.category}
                          </span>
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{trans.type}</TableCell>
                        <TableCell align="right">
                          <span style={{ 
                            color: trans.category === 'Ativo' ? (darkMode ? '#81c784' : '#2e7d32') : (darkMode ? '#ef9a9a' : '#dc004e'),
                            fontWeight: 'bold'
                          }}>
                            {formatCurrency(trans.value)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Resumo de Investimentos */}
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: darkMode ? '1px solid #333' : 'none'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: darkMode ? '#64b5f6' : '#1976d2' }}>
              📊 Resumo de Investimentos
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  border: darkMode ? '1px solid #333' : 'none',
                  bgcolor: darkMode ? '#1e1e1e' : 'inherit'
                }}>
                  <CardContent>
                    <Typography color={darkMode ? '#aaa' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                      Total de Investimentos
                    </Typography>
                    <Typography variant="h6" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
                      {formatCurrency(investments.reduce((sum, inv) => sum + (inv.grossBalance || 0), 0))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  border: darkMode ? '1px solid #333' : 'none',
                  bgcolor: darkMode ? '#1e1e1e' : 'inherit'
                }}>
                  <CardContent>
                    <Typography color={darkMode ? '#aaa' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                      Quantidade de Ativos
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                      {investments.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  border: darkMode ? '1px solid #333' : 'none',
                  bgcolor: darkMode ? '#1e1e1e' : 'inherit'
                }}>
                  <CardContent>
                    <Typography color={darkMode ? '#aaa' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                      Rendimento Médio
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                      {investments.length > 0
                        ? `${(investments.reduce((sum, inv) => sum + (inv.annualRate || 0), 0) / investments.length).toFixed(2)}%`
                        : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Produto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Vencimento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Valor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Rendimento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Taxa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: darkMode ? '#78909c' : 'textSecondary' }}>
                        Nenhum investimento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    investments.map((inv) => (
                      <TableRow key={inv._id} hover>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.type}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.product}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.name}</TableCell>
                        <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                          {inv.maturityDate ? new Date(inv.maturityDate).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{formatCurrency(inv.grossBalance)}</TableCell>
                        <TableCell align="right">
                          <span style={{ color: (inv.yield || 0) >= 0 ? (darkMode ? '#81c784' : '#2e7d32') : (darkMode ? '#ef9a9a' : '#dc004e') }}>
                            {formatCurrency(inv.yield || 0)}
                          </span>
                        </TableCell>
                        <TableCell align="right" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.annualRate}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Rodapé */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 3, 
          pt: 2, 
          borderTop: '1px solid ' + (darkMode ? '#333' : '#e0e0e0')
        }}>
          <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'}>
            Relatório gerado automaticamente pelo Finance Dashboard em {new Date().toLocaleDateString('pt-BR')}
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default Reports;