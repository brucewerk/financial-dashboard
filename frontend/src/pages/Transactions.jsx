// frontend/src/pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Chip,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList
} from '@mui/icons-material';
import { finance } from '../services/api';
import { useThemeContext } from '../contexts/ThemeContext';

const Transactions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { darkMode } = useThemeContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('');
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalVariation: 0,
    currentYear: ''
  });
  const [annualData, setAnnualData] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    saldo: 0,
    variation: 0
  });
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    description: '',
    category: 'Ativo',
    type: '',
    value: ''
  });

  const categories = ['Ativo', 'Passivo'];
  const transactionTypes = [
    'Apartamento', 'Carro', 'Conta Bradesco', 'Investimentos BTG',
    'Mercado Pago', 'Contabilizei Bank', 'Conta Banco do Brasil',
    'FGTS Caixa', 'IPVA/Licenciamento', 'Impostos DARF/DAS',
    'Contador Mensalidade', 'Cartão de Crédito', 'Condomínio',
    'Convênio Pais', 'Vivo', 'Faculdade', 'Sem Parar', 'Luz', 'Gás'
  ];

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [filterYear]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = { year: filterYear };
      if (filterMonth) params.month = filterMonth;
      const response = await finance.getTransactions(params);
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [statsRes, balRes] = await Promise.all([
        finance.getStats(),
        finance.getBalances()
      ]);
      
      setStats({
        totalAssets: statsRes.data.totalAssets || 0,
        totalLiabilities: statsRes.data.totalLiabilities || 0,
        totalVariation: statsRes.data.totalVariation || 0,
        currentYear: statsRes.data.currentYear || ''
      });

      const allBalances = balRes.data || [];
      const annualBalances = allBalances.filter(b => b.month === 13 && b.year === filterYear);
      
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
        const originalAssets = statsRes.data.totalAssets || 0;
        const originalLiabilities = statsRes.data.totalLiabilities || 0;
        const totalAssets = originalAssets + originalLiabilities;
        const saldo = totalAssets - originalLiabilities;
        
        setAnnualData({
          totalAssets: totalAssets,
          totalLiabilities: originalLiabilities,
          saldo: saldo,
          variation: statsRes.data.totalVariation || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingId(transaction._id);
      setFormData({
        year: transaction.year || new Date().getFullYear(),
        month: transaction.month || new Date().getMonth() + 1,
        description: transaction.description || '',
        category: transaction.category || 'Ativo',
        type: transaction.type || '',
        value: transaction.value || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        description: '',
        category: 'Ativo',
        type: '',
        value: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        ...formData,
        year: parseInt(formData.year),
        month: parseInt(formData.month),
        value: parseFloat(formData.value) || 0,
        date: new Date(formData.year, formData.month - 1, 1)
      };

      if (editingId) {
        await finance.updateTransaction(editingId, data);
        setSuccess('Transação atualizada com sucesso!');
      } else {
        await finance.createTransaction(data);
        setSuccess('Transação criada com sucesso!');
      }
      
      handleCloseDialog();
      loadTransactions();
      loadStats();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      setError('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      setLoading(true);
      await finance.deleteTransaction(id);
      setSuccess('Transação excluída com sucesso!');
      loadTransactions();
      loadStats();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setError('Erro ao excluir transação');
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

  const getCategoryColor = (category) => {
    return category === 'Ativo' ? 'success' : 'error';
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
        <Typography variant="h4" fontWeight="bold">📋 Transações</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mt: isMobile ? 1 : 0 }}
        >
          Nova Transação
        </Button>
      </Box>

      {/* Cards de Totais do Ano Filtrado - COM CONTRASTE MELHORADO */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#1a237e' : '#e3f2fd', 
            height: '100%',
            border: darkMode ? '1px solid #303f9f' : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? '#90caf9' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Total Ativos ({filterYear})
              </Typography>
              <Typography variant="h5" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
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
            height: '100%',
            border: darkMode ? '1px solid #6a1b9a' : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? '#ef9a9a' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Total Passivos ({filterYear})
              </Typography>
              <Typography variant="h5" color={darkMode ? '#ef9a9a' : 'error'} fontWeight="bold">
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
            height: '100%',
            border: darkMode ? '1px solid #2e7d32' : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? '#a5d6a7' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Saldo ({filterYear})
              </Typography>
              <Typography variant="h5" color={darkMode ? '#81c784' : 'success'} fontWeight="bold">
                {formatCurrency(annualData.saldo)}
              </Typography>
              <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                (O11 - O25)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cards de Totais Acumulados - COM CONTRASTE MELHORADO */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#0d47a1' : '#bbdefb', 
            height: '100%',
            border: darkMode ? '1px solid #1565c0' : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? '#90caf9' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Total de Ativos (Acumulado)
              </Typography>
              <Typography variant="h5" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
                {formatCurrency(stats.totalAssets + stats.totalLiabilities)}
              </Typography>
              <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                (O11 + O25)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#4a148c' : '#ffcdd2', 
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
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#1b5e20' : '#c8e6c9', 
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
      </Grid>

      {/* Filtros */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        bgcolor: 'background.paper',
        border: darkMode ? '1px solid #333' : 'none'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Ano"
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <FormControl fullWidth>
              <InputLabel id="month-filter-label">Mês</InputLabel>
              <Select
                labelId="month-filter-label"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                label="Mês"
              >
                <MenuItem value="">Todos os meses</MenuItem>
                <MenuItem value="1">Janeiro</MenuItem>
                <MenuItem value="2">Fevereiro</MenuItem>
                <MenuItem value="3">Março</MenuItem>
                <MenuItem value="4">Abril</MenuItem>
                <MenuItem value="5">Maio</MenuItem>
                <MenuItem value="6">Junho</MenuItem>
                <MenuItem value="7">Julho</MenuItem>
                <MenuItem value="8">Agosto</MenuItem>
                <MenuItem value="9">Setembro</MenuItem>
                <MenuItem value="10">Outubro</MenuItem>
                <MenuItem value="11">Novembro</MenuItem>
                <MenuItem value="12">Dezembro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterList />}
              onClick={() => { loadTransactions(); loadStats(); }}
              sx={{ height: '56px' }}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de Transações */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 3, 
        boxShadow: theme.shadows[2],
        bgcolor: 'background.paper'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Data</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Valor</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !transactions.length ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color={darkMode ? '#78909c' : 'textSecondary'}>Nenhuma transação encontrada</Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((trans) => (
                <TableRow key={trans._id} hover>
                  <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                    {trans.year}/{String(trans.month).padStart(2, '0')}
                  </TableCell>
                  <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{trans.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={trans.category}
                      size="small"
                      color={getCategoryColor(trans.category)}
                    />
                  </TableCell>
                  <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{trans.type}</TableCell>
                  <TableCell align="right">
                    <Typography color={trans.category === 'Ativo' ? (darkMode ? '#81c784' : 'success.main') : (darkMode ? '#ef9a9a' : 'error.main')}>
                      {formatCurrency(trans.value)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(trans)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(trans._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Criar/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingId ? '✏️ Editar Transação' : '➕ Nova Transação'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Ano"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Mês"
                type="number"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            margin="normal"
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {transactionTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Valor"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Transactions;