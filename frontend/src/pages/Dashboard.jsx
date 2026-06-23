// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Percent,
  ShowChart,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [investments, setInvestments] = useState([]);
  const [monthlyBalances, setMonthlyBalances] = useState([]);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalVariation: 0,
    totalInvestments: 0,
    currentYear: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados do Dashboard...');
      
      const [invRes, balRes, statsRes] = await Promise.all([
        finance.getInvestments(),
        finance.getBalances(),
        finance.getStats()
      ]);
      
      console.log('📊 Stats recebidos:', statsRes.data);
      
      setInvestments(invRes.data || []);
      
      // Filtrar apenas balanços mensais (month <= 12) para os gráficos
      const allBalances = balRes.data || [];
      const monthlyData = allBalances.filter(b => b.month <= 12);
      setMonthlyBalances(monthlyData);
      
      // Usar os stats do backend
      const statsData = statsRes.data || {};
      setStats({
        totalAssets: statsData.totalAssets || 0,
        totalLiabilities: statsData.totalLiabilities || 0,
        totalVariation: statsData.totalVariation || 0,
        totalInvestments: statsData.totalInvestments || 0,
        currentYear: statsData.currentYear || ''
      });
      
      console.log('✅ Stats carregados:', statsData);
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

  // Preparar dados para gráficos
  const balanceData = monthlyBalances
    .slice(-12)
    .map((b) => ({
      month: `${b.month}/${b.year}`,
      ativos: b.totalAssets || 0,
      passivos: b.totalLiabilities || 0,
      patrimonio: (b.totalAssets || 0) - (b.totalLiabilities || 0),
      variacao: b.variation || 0
    }));

  // Dados de investimentos por tipo
  const investmentByType = investments.reduce((acc, inv) => {
    const type = inv.type || 'Outros';
    acc[type] = (acc[type] || 0) + (inv.grossBalance || 0);
    return acc;
  }, {});

  const investmentData = Object.entries(investmentByType).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#A569BD'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{label}</Typography>
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

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h5" component="div" sx={{ 
              fontSize: isMobile ? '1.1rem' : '1.5rem',
              fontWeight: 'bold'
            }}>
              {formatCurrency(value)}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: color + '20', p: 1.5, borderRadius: 3 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📊 Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={`Total de Ativos (${stats.currentYear})`}
            value={stats.totalAssets}
            icon={<AccountBalance sx={{ color: '#1976d2', fontSize: 28 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Passivos (Acumulado)"
            value={stats.totalLiabilities}
            icon={<TrendingDown sx={{ color: '#dc004e', fontSize: 28 }} />}
            color="#dc004e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total das Variações"
            value={stats.totalVariation}
            icon={<TrendingUp sx={{ color: '#ed6c02', fontSize: 28 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Investido"
            value={stats.totalInvestments}
            icon={<Percent sx={{ color: '#2e7d32', fontSize: 28 }} />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      {/* Gráfico 1 - Evolução Patrimonial */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: theme.shadows[2] }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <ShowChart sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="bold">📈 Evolução Patrimonial</Typography>
          </Box>
          <Box sx={{ width: '100%', height: isMobile ? 350 : 450 }}>
            <ResponsiveContainer>
              <ComposedChart data={balanceData} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? -10 : 10, bottom: isMobile ? 50 : 30 }}>
                <defs>
                  <linearGradient id="colorAtivos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPassivos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc004e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#dc004e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }} interval={isMobile ? 1 : 0} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 40} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }} width={isMobile ? 70 : 90} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e0e0e0', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13, paddingTop: isMobile ? 10 : 20 }} verticalAlign="bottom" height={isMobile ? 50 : 40} iconType="circle" iconSize={isMobile ? 8 : 10} />
                <Area type="monotone" dataKey="ativos" stroke="#1976d2" strokeWidth={3} fill="url(#colorAtivos)" name="Ativos" />
                <Area type="monotone" dataKey="passivos" stroke="#dc004e" strokeWidth={3} fill="url(#colorPassivos)" name="Passivos" />
                <Line type="monotone" dataKey="patrimonio" stroke="#2e7d32" strokeWidth={4} name="Patrimônio" dot={{ r: isMobile ? 4 : 6, strokeWidth: 2, stroke: '#2e7d32', fill: '#fff' }} activeDot={{ r: isMobile ? 6 : 8, strokeWidth: 2, stroke: '#2e7d32' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Gráfico 2 - Distribuição de Investimentos */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: theme.shadows[2] }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <PieChartIcon sx={{ color: theme.palette.info.main }} />
            <Typography variant="h6" fontWeight="bold">🍩 Distribuição de Investimentos</Typography>
          </Box>
          <Box sx={{ width: '100%', height: isMobile ? 350 : 450 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={investmentData} cx="50%" cy="45%" labelLine={true} label={({ name, percent }) => { const shortName = name.length > 12 ? name.substring(0, 10) + '...' : name; return `${shortName}\n${(percent * 100).toFixed(1)}%`; }} outerRadius={isMobile ? 100 : 160} innerRadius={isMobile ? 50 : 80} fill="#8884d8" dataKey="value" paddingAngle={3}>
                  {investmentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13, paddingTop: isMobile ? 10 : 20 }} verticalAlign="bottom" height={isMobile ? 60 : 50} iconType="circle" iconSize={isMobile ? 8 : 10} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Gráfico 3 - Ativos vs Passivos */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: theme.shadows[2] }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <BarChartIcon sx={{ color: theme.palette.warning.main }} />
            <Typography variant="h6" fontWeight="bold">📊 Ativos vs Passivos por Mês</Typography>
          </Box>
          <Box sx={{ width: '100%', height: isMobile ? 350 : 450 }}>
            <ResponsiveContainer>
              <BarChart data={balanceData} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? -10 : 10, bottom: isMobile ? 50 : 30 }}>
                <defs>
                  <linearGradient id="barAtivos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1976d2" stopOpacity={0.9}/><stop offset="95%" stopColor="#1976d2" stopOpacity={0.6}/></linearGradient>
                  <linearGradient id="barPassivos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc004e" stopOpacity={0.9}/><stop offset="95%" stopColor="#dc004e" stopOpacity={0.6}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }} interval={isMobile ? 1 : 0} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 40} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }} width={isMobile ? 70 : 90} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13, paddingTop: isMobile ? 10 : 20 }} verticalAlign="bottom" height={isMobile ? 50 : 40} iconType="circle" iconSize={isMobile ? 8 : 10} />
                <Bar dataKey="ativos" fill="url(#barAtivos)" name="Ativos" radius={[6, 6, 0, 0]} maxBarSize={isMobile ? 40 : 60} />
                <Bar dataKey="passivos" fill="url(#barPassivos)" name="Passivos" radius={[6, 6, 0, 0]} maxBarSize={isMobile ? 40 : 60} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Gráfico 4 - Variações Mensais */}
      <Box sx={{ mb: 2 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: theme.shadows[2] }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <TrendingUp sx={{ color: theme.palette.success.main }} />
            <Typography variant="h6" fontWeight="bold">📉 Variações Mensais</Typography>
          </Box>
          <Box sx={{ width: '100%', height: isMobile ? 300 : 400 }}>
            <ResponsiveContainer>
              <BarChart data={balanceData} margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? -10 : 10, bottom: isMobile ? 50 : 30 }}>
                <defs>
                  <linearGradient id="barVariacao" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ed6c02" stopOpacity={0.9}/><stop offset="95%" stopColor="#ed6c02" stopOpacity={0.4}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }} interval={isMobile ? 1 : 0} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 40} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }} width={isMobile ? 70 : 90} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13, paddingTop: isMobile ? 10 : 20 }} verticalAlign="bottom" height={isMobile ? 50 : 40} iconType="circle" iconSize={isMobile ? 8 : 10} />
                <Bar dataKey="variacao" fill="url(#barVariacao)" name="Variação do Mês" radius={[6, 6, 0, 0]} maxBarSize={isMobile ? 50 : 70} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;