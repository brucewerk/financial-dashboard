// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  useTheme
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';

const Login = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (tab === 0) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao autenticar');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ 
          p: 4, 
          width: '100%',
          backgroundColor: theme.palette.background.paper,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography component="h1" variant="h5" align="center" sx={{ flex: 1 }}>
              KLING KLANG
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
          <Typography variant="subtitle2" color="textSecondary" align="center" sx={{ mb: 2 }}>
            Controle Financeiro
          </Typography>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ mt: 1 }}
            centered
          >
            <Tab label="Login" />
            <Tab label="Registrar" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {tab === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {tab === 0 ? 'Entrar' : 'Registrar'}
            </Button>
          </Box>
          {/* Rodapé do Login */}
          <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid ' + (darkMode ? '#333333' : '#e0e0e0') }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
              Desenvolvido por{' '}
              <a 
                href="https://klingklang.free.nf" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: theme.palette.primary.main, 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                BruCe
              </a>
              {' '}- 2026
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;