// frontend/src/pages/Import.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Import = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError('');
        setResult(null);
      } else {
        setError('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo para importar');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setResult(null);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await api.post('/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setResult(response.data.results);
      setSuccess('Importação concluída com sucesso!');
      setSelectedFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';
      
    } catch (err) {
      console.error('Erro na importação:', err);
      setError(err.response?.data?.error || 'Erro ao importar arquivo');
      setUploadProgress(0);
    } finally {
      setUploading(false);
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

  return (
    <div>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📤 Importar Planilha
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Importe sua planilha de finanças no formato Excel (.xlsx ou .xls) para popular automaticamente o sistema.
      </Typography>

      <Grid container spacing={3}>
        {/* Área de Upload */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            textAlign: 'center'
          }}>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: { xs: 3, sm: 5 },
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: '#f0f7ff'
                }
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              
              {selectedFile ? (
                <Box>
                  <DescriptionIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      document.getElementById('file-input').value = '';
                    }}
                  >
                    Trocar arquivo
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 80, color: '#ccc' }} />
                  <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                    Clique para selecionar ou arraste um arquivo
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Formatos suportados: .xlsx, .xls
                  </Typography>
                </Box>
              )}
            </Box>

            {uploading && (
              <Box sx={{ width: '100%', mt: 3 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {uploadProgress < 100 ? 'Processando arquivo...' : 'Finalizando...'}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              sx={{ mt: 3, minWidth: 200 }}
            >
              {uploading ? 'Importando...' : 'Importar Planilha'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Resumo da Importação */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            height: '100%'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Resumo da Importação
            </Typography>
            
            {result ? (
              <Box>
                <Card sx={{ bgcolor: '#e3f2fd', mb: 2 }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      Investimentos
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {result.investments}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ bgcolor: '#bbdefb', mb: 2 }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      Transações
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {result.transactions}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      Balanços Anuais
                    </Typography>
                    <Typography variant="h4" color="success">
                      {result.balances}
                    </Typography>
                  </CardContent>
                </Card>

                {result.errors && result.errors.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {result.errors.length} erro(s) encontrado(s)
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  Selecione e importe uma planilha para ver o resumo aqui
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={() => { setSuccess(''); setError(''); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={success ? 'success' : 'error'} 
          onClose={() => { setSuccess(''); setError(''); }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Import;