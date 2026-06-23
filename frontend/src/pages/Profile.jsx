// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Box,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Person, Email, Lock, Save } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Verificar se a senha nova foi preenchida
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      // Preparar dados para enviar
      const updateData = {
        name: formData.name
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data) {
        setSuccess(true);
        // Atualizar dados do usuário no contexto
        const updatedUser = { ...user, name: formData.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Recarregar a página para atualizar o contexto
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                bgcolor: 'primary.main',
                fontSize: 48
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {user?.name}
            </Typography>
            <Typography color="textSecondary">
              {user?.email}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box textAlign="left">
              <Typography variant="body2" color="textSecondary">
                <strong>ID do Usuário:</strong>
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {user?.id}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                <strong>Membro desde:</strong>
              </Typography>
              <Typography variant="body2">
                {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Editar Perfil
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
                margin="normal"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Alterar Senha
              </Typography>
              <TextField
                fullWidth
                label="Senha Atual"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                fullWidth
                label="Nova Senha"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ mt: 3 }}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Perfil atualizado com sucesso!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;