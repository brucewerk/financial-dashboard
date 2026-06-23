// frontend/src/pages/Investments.jsx
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
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney
} from '@mui/icons-material';
import { finance } from '../services/api';
import { useThemeContext } from '../contexts/ThemeContext';

const Investments = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { darkMode } = useThemeContext();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Renda Fixa',
    product: '',
    name: '',
    emissionDate: '',
    maturityDate: '',
    purchaseValue: '',
    grossBalance: '',
    annualRate: '',
    irAndIof: '0'
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const response = await finance.getInvestments();
      setInvestments(response.data);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      setError('Erro ao carregar investimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (investment = null) => {
    if (investment) {
      setEditingId(investment._id);
      setFormData({
        type: investment.type || 'Renda Fixa',
        product: investment.product || '',
        name: investment.name || '',
        emissionDate: investment.emissionDate ? new Date(investment.emissionDate).toISOString().split('T')[0] : '',
        maturityDate: investment.maturityDate ? new Date(investment.maturityDate).toISOString().split('T')[0] : '',
        purchaseValue: investment.purchaseValue || '',
        grossBalance: investment.grossBalance || '',
        annualRate: investment.annualRate || '',
        irAndIof: investment.irAndIof || '0'
      });
    } else {
      setEditingId(null);
      setFormData({
        type: 'Renda Fixa',
        product: '',
        name: '',
        emissionDate: '',
        maturityDate: '',
        purchaseValue: '',
        grossBalance: '',
        annualRate: '',
        irAndIof: '0'
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
        purchaseValue: parseFloat(formData.purchaseValue) || 0,
        grossBalance: parseFloat(formData.grossBalance) || 0,
        annualRate: parseFloat(formData.annualRate) || 0,
        irAndIof: parseFloat(formData.irAndIof) || 0,
        yield: (parseFloat(formData.grossBalance) || 0) - (parseFloat(formData.purchaseValue) || 0)
      };

      if (editingId) {
        await finance.updateInvestment(editingId, data);
        setSuccess('Investimento atualizado com sucesso!');
      } else {
        await finance.createInvestment(data);
        setSuccess('Investimento criado com sucesso!');
      }
      
      handleCloseDialog();
      loadInvestments();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
      setError('Erro ao salvar investimento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este investimento?')) return;
    
    try {
      setLoading(true);
      await finance.deleteInvestment(id);
      setSuccess('Investimento excluído com sucesso!');
      loadInvestments();
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
      setError('Erro ao excluir investimento');
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

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTypeColor = (type) => {
    const colors = {
      'Renda Fixa': 'primary',
      'Renda Variável': 'warning',
      'Fundo Invest.': 'info',
      'Previdência': 'secondary',
      'Conta Invest.': 'success'
    };
    return colors[type] || 'default';
  };

  const totalPurchase = investments.reduce((sum, inv) => sum + (inv.purchaseValue || 0), 0);
  const totalBalance = investments.reduce((sum, inv) => sum + (inv.grossBalance || 0), 0);
  const totalYield = investments.reduce((sum, inv) => sum + (inv.yield || 0), 0);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Typography variant="h4" fontWeight="bold">📈 Investimentos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mt: isMobile ? 1 : 0 }}
        >
          Novo Investimento
        </Button>
      </Box>

      {/* Cards de Resumo - COM CONTRASTE MELHORADO */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#1a237e' : '#e3f2fd', 
            height: '100%',
            border: darkMode ? '1px solid #303f9f' : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? '#90caf9' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Total Investido
              </Typography>
              <Typography variant="h5" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
                {formatCurrency(totalPurchase)}
              </Typography>
              <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                Soma dos valores de compra
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode ? '#0d47a1' : '#bbdefb', 
            height: '100%',
            border: darkMode ? '1px solid #1565c0' : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? '#90caf9' : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Saldo Bruto
              </Typography>
              <Typography variant="h5" color={darkMode ? '#64b5f6' : 'primary'} fontWeight="bold">
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                Soma dos saldos atuais (H29)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            bgcolor: darkMode 
              ? (totalYield >= 0 ? '#1b5e20' : '#4a148c') 
              : (totalYield >= 0 ? '#e8f5e9' : '#fce4ec'),
            height: '100%',
            border: darkMode ? (totalYield >= 0 ? '1px solid #2e7d32' : '1px solid #6a1b9a') : 'none'
          }}>
            <CardContent>
              <Typography color={darkMode ? (totalYield >= 0 ? '#a5d6a7' : '#ef9a9a') : 'textSecondary'} gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
                Rendimento Total
              </Typography>
              <Typography variant="h5" color={totalYield >= 0 ? (darkMode ? '#81c784' : 'success.main') : (darkMode ? '#ef9a9a' : 'error.main')} fontWeight="bold">
                {formatCurrency(totalYield)}
              </Typography>
              <Typography variant="caption" color={darkMode ? '#78909c' : 'textSecondary'} sx={{ fontSize: '0.6rem' }}>
                {totalPurchase > 0 ? (totalYield / totalPurchase * 100).toFixed(2) : 0}% de retorno
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Investimentos */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 3, 
        boxShadow: theme.shadows[2],
        bgcolor: 'background.paper'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }}>Vencimento</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Valor Compra</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Saldo Bruto</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Rendimento</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="right">Taxa</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : 'inherit' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !investments.length ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : investments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color={darkMode ? '#78909c' : 'textSecondary'}>Nenhum investimento encontrado</Typography>
                </TableCell>
              </TableRow>
            ) : (
              investments.map((inv) => (
                <TableRow key={inv._id} hover>
                  <TableCell>
                    <Chip
                      label={inv.type}
                      size="small"
                      color={getTypeColor(inv.type)}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.product}</TableCell>
                  <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.name}</TableCell>
                  <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{formatDate(inv.maturityDate)}</TableCell>
                  <TableCell align="right" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{formatCurrency(inv.purchaseValue)}</TableCell>
                  <TableCell align="right" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{formatCurrency(inv.grossBalance)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={(inv.yield || 0) >= 0 ? (darkMode ? '#81c784' : 'success.main') : (darkMode ? '#ef9a9a' : 'error.main')}
                      fontWeight="bold"
                    >
                      {formatCurrency(inv.yield || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{inv.annualRate}%</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(inv)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(inv._id)}
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
          {editingId ? '✏️ Editar Investimento' : '➕ Novo Investimento'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Tipo"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="Renda Fixa">Renda Fixa</MenuItem>
                <MenuItem value="Renda Variável">Renda Variável</MenuItem>
                <MenuItem value="Fundo Invest.">Fundo Invest.</MenuItem>
                <MenuItem value="Previdência">Previdência</MenuItem>
                <MenuItem value="Conta Invest.">Conta Invest.</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Produto"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Emissão"
                type="date"
                value={formData.emissionDate}
                onChange={(e) => setFormData({ ...formData, emissionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Vencimento"
                type="date"
                value={formData.maturityDate}
                onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor de Compra"
                type="number"
                value={formData.purchaseValue}
                onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
                InputProps={{ startAdornment: <span style={{ marginRight: 8 }}>R$</span> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Saldo Bruto"
                type="number"
                value={formData.grossBalance}
                onChange={(e) => setFormData({ ...formData, grossBalance: e.target.value })}
                InputProps={{ startAdornment: <span style={{ marginRight: 8 }}>R$</span> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Taxa Anual (%)"
                type="number"
                value={formData.annualRate}
                onChange={(e) => setFormData({ ...formData, annualRate: e.target.value })}
                InputProps={{ endAdornment: <span style={{ marginLeft: 8 }}>%</span> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="IR e IOF"
                type="number"
                value={formData.irAndIof}
                onChange={(e) => setFormData({ ...formData, irAndIof: e.target.value })}
                InputProps={{ startAdornment: <span style={{ marginRight: 8 }}>R$</span> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (editingId ? 'Atualizar' : 'Salvar')}
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

export default Investments;