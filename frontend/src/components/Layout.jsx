// frontend/src/components/Layout.jsx
import React, { useState, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  TrendingUp,
  AccountBalance,
  Receipt,
  Assessment,
  Logout,
  Person,
  CloudUpload as CloudUploadIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';

const drawerWidth = 260;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Evolução', icon: <TrendingUp />, path: '/evolution' },
    { text: 'Investimentos', icon: <AccountBalance />, path: '/investments' },
    { text: 'Transações', icon: <Receipt />, path: '/transactions' },
    { text: 'Relatórios', icon: <Assessment />, path: '/reports' },
    { text: 'Importar', icon: <CloudUploadIcon />, path: '/import' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        minHeight: 64,
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'center' }}>
          KLING KLANG
        </Typography>
      </Toolbar>
      <Divider />
      {/* flex:1 + overflowY:auto — numa tela baixa (celular deitado), a lista
          rola dentro do próprio espaço em vez de invadir o bloco do usuário
          e o rodapé abaixo. Antes, os dois ficavam com position:absolute
          contando a partir da altura TOTAL da tela, então numa tela curta a
          lista (que flui normalmente) simplesmente passava por cima deles. */}
      <List dense sx={{ pt: 1, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.25,
              py: 0.25,
              '&:hover': {
                backgroundColor: theme.palette.primary.light + '20',
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '15',
                borderRight: `3px solid ${theme.palette.primary.main}`,
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      <Box sx={{ p: 1, flexShrink: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {darkMode ? <Brightness4 fontSize="small" /> : <Brightness7 fontSize="small" />}
            <Typography variant="body2" color="textSecondary">
              {darkMode ? 'Escuro' : 'Claro'}
            </Typography>
          </Box>
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            color="primary"
          />
        </Box>
      </Box>
      
      <Divider sx={{ mt: 1 }} />
      <Box sx={{ p: 1, flexShrink: 0 }}>
        <ListItem
          button
          onClick={() => {
            navigate('/profile');
            setMobileOpen(false);
          }}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText 
            primary={user?.name || 'Usuário'} 
            secondary={user?.email}
            secondaryTypographyProps={{ 
              style: { fontSize: '0.75rem', color: theme.palette.text.secondary }
            }}
          />
        </ListItem>
      </Box>
      <Box sx={{ 
        flexShrink: 0,
        width: '100%', 
        textAlign: 'center',
        fontSize: '0.65rem',
        color: '#999',
        padding: '0 8px 8px',
        pb: 'calc(8px + env(safe-area-inset-bottom))',
      }}>
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          // Empurra a barra pra baixo do notch/ilha dinâmica em vez de
          // ficar escondida atrás dela (viewport-fit=cover no index.html).
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Controle Financeiro
          </Typography>
          
          <IconButton onClick={toggleDarkMode} color="inherit" sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 36,
                height: 36,
                fontSize: 16,
                fontWeight: 'bold'
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                minWidth: 200,
                backgroundColor: theme.palette.background.paper,
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              <ListItemText>Meu Perfil</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.secondary.main }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: theme.palette.secondary.main }} /></ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              overflowX: 'hidden',
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              overflowX: 'hidden',
              borderRight: '1px solid ' + (darkMode ? '#333333' : '#f0f0f0'),
              boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
              backgroundColor: theme.palette.background.paper,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0, // crítico: sem isso, um item flex não encolhe além do
          // conteúdo "natural" dos filhos (texto longo, tabela larga) e
          // acaba forçando a área de conteúdo a ficar mais larga que a tela
          // — foi a causa raiz do "não cabe na tela" em várias páginas.
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
          backgroundColor: theme.palette.background.default,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          // Respiro pra barra de gestos/home indicator em iPhones sem botão físico.
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
              </Box>
            }
          >
            <Outlet />
          </Suspense>
        </Box>
        <Box sx={{ 
          textAlign: 'center', 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid ' + (darkMode ? '#333333' : '#e0e0e0'),
          fontSize: '0.7rem',
          color: theme.palette.text.secondary
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary }}>
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
      </Box>
    </Box>
  );
};

export default Layout;