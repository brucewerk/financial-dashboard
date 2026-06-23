// frontend/src/pages/Evolution.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { finance } from '../services/api';
import { useThemeContext } from '../contexts/ThemeContext';

const Evolution = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode } = useThemeContext();
  const [monthlyBalances, setMonthlyBalances] = useState([]);
  const [annualBalances, setAnnualBalances] = useState([]);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalVariation: 0,
    currentYear: ''
  });
  const [selectedYear, setSelectedYear] = useState(2026);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balRes, statsRes] = await Promise.all([
        finance.getBalances(),
        finance.getStats()
      ]);
      
      const allBalances = balRes.data || [];
      
      const monthlyData = allBalances.filter(b => b.month <= 12);
      const annualData = allBalances.filter(b => b.month === 13);
      
      setMonthlyBalances(monthlyData);
      setAnnualBalances(annualData);
      
      const statsData = statsRes.data || {};
      setStats({
        totalAssets: statsData.totalAssets || 0,
        totalLiabilities: statsData.totalLiabilities || 0,
        totalVariation: statsData.totalVariation || 0,
        currentYear: statsData.currentYear || ''
      });
      
      const years = annualData.map(b => b.year).sort((a, b) => a - b);
      setAvailableYears(years.length > 0 ? years : [2025, 2026]);
      
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[years.length - 1]);
      } else if (years.length === 0) {
        setSelectedYear(2026);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const selectedAnnual = annualBalances.find(b => b.year === selectedYear);
  
  const yearTotalAssets = selectedAnnual?.totalAssets || 0;
  const yearTotalLiabilities = selectedAnnual?.totalLiabilities || 0;
  const yearTotalVariation = selectedAnnual?.variation || 0;
  const yearTotalNetWorth = yearTotalAssets;

  const filteredBalances = monthlyBalances.filter(b => b.year === selectedYear);
  
  const evolutionData = filteredBalances.map((b) => ({
    month: `${b.month}/${b.year}`,
    patrimonio: (b.totalAssets || 0) - (b.totalLiabilities || 0),
    ativos: b.totalAssets || 0,
    passivos: b.totalLiabilities || 0
  }));

  const variations = filteredBalances.map((b, index) => {
    if (index === 0) return 0;
    const prev = filteredBalances[index - 1];
    const currentNet = (b.totalAssets || 0) - (b.totalLiabilities || 0);
    const prevNet = (prev.totalAssets || 0) - (prev.totalLiabilities || 0);
    return currentNet - prevNet;
  });

  const variationData = filteredBalances.map((b, i) => ({
    month: `${b.month}/${b.year}`,
    variacao: variations[i] || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          border: '1px solid ' + (darkMode ? '#444' : '#e0e0e0'),
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
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

  return (
    <div>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📈 Evolução Patrimonial
      </Typography>

      {/* LINHA 1: Seletor de Ano + Cards de Resumo - LADO A LADO */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
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
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: darkMode ? '#1a237e' : '#e3f2fd', height: '100%' }}>
                  <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                      Total Ativos ({selectedYear})
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' }, fontWeight: 'bold' }}>
                      {formatCurrency(yearTotalAssets)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: darkMode ? '#4a148c' : '#fce4ec', height: '100%' }}>
                  <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                      Total Passivos ({selectedYear})
                    </Typography>
                    <Typography variant="h6" color="error" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' }, fontWeight: 'bold' }}>
                      {formatCurrency(yearTotalLiabilities)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: darkMode ? '#1b5e20' : '#e8f5e9', height: '100%' }}>
                  <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                      Patrimônio Final ({selectedYear})
                    </Typography>
                    <Typography variant="h6" color="success" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' }, fontWeight: 'bold' }}>
                      {formatCurrency(yearTotalNetWorth)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: darkMode ? '#e65100' : '#fff3e0', height: '100%' }}>
                  <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                      Variação Total ({selectedYear})
                    </Typography>
                    <Typography variant="h6" color={yearTotalVariation >= 0 ? 'success.main' : 'error.main'} sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' }, fontWeight: 'bold' }}>
                      {formatCurrency(yearTotalVariation)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* LINHA 2: Cards de Totais Acumulados */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📊 Totais Acumulados (Todos os Anos)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: darkMode ? '#1a237e' : '#e3f2fd' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total de Ativos (Acumulado)
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
                  {formatCurrency(stats.totalAssets)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: darkMode ? '#4a148c' : '#fce4ec' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total de Passivos (Acumulado)
                </Typography>
                <Typography variant="h5" color="error" sx={{ fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
                  {formatCurrency(stats.totalLiabilities)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: darkMode ? '#1b5e20' : '#e8f5e9' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total das Variações (Acumulado)
                </Typography>
                <Typography variant="h5" color="success" sx={{ fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
                  {formatCurrency(stats.totalVariation)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* GRÁFICO 1 - Evolução Patrimonial - LINHA COMPLETA */}
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        transition: 'box-shadow 0.3s',
        mb: 4,
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: theme.shadows[8]
        }
      }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            📊 Evolução do Patrimônio - {selectedYear}
          </Typography>
        </Box>
        <Box sx={{ width: '100%', height: isMobile ? 350 : isTablet ? 400 : 480 }}>
          <ResponsiveContainer>
            <ComposedChart 
              data={evolutionData}
              margin={{ 
                top: 20, 
                right: isMobile ? 10 : 30, 
                left: isMobile ? -10 : 10, 
                bottom: isMobile ? 50 : 30 
              }}
            >
              <defs>
                <linearGradient id="colorAtivosEvo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPassivosEvo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc004e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#dc004e" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPatrimonioEvo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} strokeOpacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: isMobile ? 10 : 12, fill: darkMode ? '#aaa' : '#666' }}
                interval={isMobile ? 1 : 0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 40}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: isMobile ? 10 : 12, fill: darkMode ? '#aaa' : '#666' }}
                width={isMobile ? 70 : 90}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: darkMode ? '#444' : '#e0e0e0', strokeWidth: 1 }} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: isMobile ? 11 : 13,
                  paddingTop: isMobile ? 10 : 20,
                  color: darkMode ? '#aaa' : '#666'
                }}
                verticalAlign="bottom"
                height={isMobile ? 50 : 40}
                iconType="circle"
                iconSize={isMobile ? 8 : 10}
              />
              <Area
                type="monotone"
                dataKey="ativos"
                stroke="#1976d2"
                strokeWidth={3}
                fill="url(#colorAtivosEvo)"
                name="Ativos"
              />
              <Area
                type="monotone"
                dataKey="passivos"
                stroke="#dc004e"
                strokeWidth={3}
                fill="url(#colorPassivosEvo)"
                name="Passivos"
              />
              <Line
                type="monotone"
                dataKey="patrimonio"
                stroke="#2e7d32"
                strokeWidth={4}
                name="Patrimônio"
                dot={{ 
                  r: isMobile ? 4 : 6, 
                  strokeWidth: 2,
                  stroke: '#2e7d32',
                  fill: '#fff'
                }}
                activeDot={{ 
                  r: isMobile ? 6 : 8,
                  strokeWidth: 2,
                  stroke: '#2e7d32'
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* GRÁFICO 2 - Variações Mensais - LINHA COMPLETA */}
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        transition: 'box-shadow 0.3s',
        mb: 4,
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: theme.shadows[8]
        }
      }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            📉 Variações Mensais - {selectedYear}
          </Typography>
        </Box>
        <Box sx={{ width: '100%', height: isMobile ? 300 : isTablet ? 350 : 400 }}>
          <ResponsiveContainer>
            <BarChart 
              data={variationData}
              margin={{ 
                top: 20, 
                right: isMobile ? 10 : 30, 
                left: isMobile ? -10 : 10, 
                bottom: isMobile ? 50 : 30 
              }}
            >
              <defs>
                <linearGradient id="barVariacaoEvo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ed6c02" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#ed6c02" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} strokeOpacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: isMobile ? 10 : 12, fill: darkMode ? '#aaa' : '#666' }}
                interval={isMobile ? 1 : 0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 40}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: isMobile ? 10 : 12, fill: darkMode ? '#aaa' : '#666' }}
                width={isMobile ? 70 : 90}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#444' : '#e0e0e0' }}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: isMobile ? 11 : 13,
                  paddingTop: isMobile ? 10 : 20,
                  color: darkMode ? '#aaa' : '#666'
                }}
                verticalAlign="bottom"
                height={isMobile ? 50 : 40}
                iconType="circle"
                iconSize={isMobile ? 8 : 10}
              />
              <Bar 
                dataKey="variacao" 
                fill="url(#barVariacaoEvo)" 
                name="Variação" 
                radius={[6, 6, 0, 0]}
                maxBarSize={isMobile ? 50 : 70}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Tabela de Dados - LINHA COMPLETA COM CONTRASTE CORRIGIDO */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, overflowX: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📋 Dados Detalhados - {selectedYear}
        </Typography>
        <Box 
          component="table" 
          sx={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
          }}
        >
          <thead>
            <tr style={{ 
              backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
              borderBottom: '2px solid ' + (darkMode ? '#444' : '#ddd')
            }}>
              <th style={{ 
                textAlign: 'left', 
                padding: '12px', 
                color: darkMode ? '#e0e0e0' : '#1a1a1a',
                fontWeight: 'bold'
              }}>Mês</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px', 
                color: darkMode ? '#e0e0e0' : '#1a1a1a',
                fontWeight: 'bold'
              }}>Ativos</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px', 
                color: darkMode ? '#e0e0e0' : '#1a1a1a',
                fontWeight: 'bold'
              }}>Passivos</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px', 
                color: darkMode ? '#e0e0e0' : '#1a1a1a',
                fontWeight: 'bold'
              }}>Patrimônio</th>
              <th style={{ 
                textAlign: 'right', 
                padding: '12px', 
                color: darkMode ? '#e0e0e0' : '#1a1a1a',
                fontWeight: 'bold'
              }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            {filteredBalances.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#aaa' : '#666' }}>
                  Nenhum dado disponível para {selectedYear}
                </td>
              </tr>
            ) : (
              filteredBalances.map((b, index) => {
                const patrimonio = (b.totalAssets || 0) - (b.totalLiabilities || 0);
                return (
                  <tr key={b._id} style={{ 
                    borderBottom: '1px solid ' + (darkMode ? '#333' : '#eee')
                  }}>
                    <td style={{ padding: '10px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>{b.month}/{b.year}</td>
                    <td style={{ textAlign: 'right', padding: '10px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>{formatCurrency(b.totalAssets)}</td>
                    <td style={{ textAlign: 'right', padding: '10px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>{formatCurrency(b.totalLiabilities)}</td>
                    <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>
                      {formatCurrency(patrimonio)}
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: '10px',
                      color: variations[index] >= 0 ? (darkMode ? '#81c784' : '#2e7d32') : (darkMode ? '#ef9a9a' : '#dc004e')
                    }}>
                      {formatCurrency(variations[index] || 0)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ 
              fontWeight: 'bold', 
              backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
              borderTop: '2px solid ' + (darkMode ? '#444' : '#ddd')
            }}>
              <td style={{ padding: '12px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>TOTAL {selectedYear}</td>
              <td style={{ textAlign: 'right', padding: '12px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>{formatCurrency(yearTotalAssets)}</td>
              <td style={{ textAlign: 'right', padding: '12px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>{formatCurrency(yearTotalLiabilities)}</td>
              <td style={{ textAlign: 'right', padding: '12px', color: darkMode ? '#e0e0e0' : '#1a1a1a' }}>{formatCurrency(yearTotalNetWorth)}</td>
              <td style={{ 
                textAlign: 'right', 
                padding: '12px', 
                color: yearTotalVariation >= 0 ? (darkMode ? '#81c784' : '#2e7d32') : (darkMode ? '#ef9a9a' : '#dc004e')
              }}>
                {formatCurrency(yearTotalVariation)}
              </td>
            </tr>
          </tfoot>
        </Box>
      </Paper>
    </div>
  );
};

export default Evolution;