// frontend/src/App.jsx
import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Cada página só é baixada quando o usuário realmente navega até ela —
// em vez de um bundle único carregando Dashboard + Relatórios (com
// jsPDF/html2canvas) + Investimentos etc. de uma vez só. Isso derruba
// bastante o tempo de carregamento inicial em conexão móvel, que é
// onde esse custo mais dói. O <Suspense> que mostra o spinner enquanto
// a página carrega fica DENTRO do Layout (veja Layout.jsx), não aqui
// por fora — ele precisa envolver só o conteúdo, nunca o Layout com o
// menu, ou o menu aberto no celular fica com o fundo escurecido preso
// na tela até um refresh (era exatamente esse o bug do "cinza travado").
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Investments = lazy(() => import('./pages/Investments'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Evolution = lazy(() => import('./pages/Evolution'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Import = lazy(() => import('./pages/Import'));

const AppContent = () => {
  const { theme } = useThemeContext();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="investments" element={<Investments />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="evolution" element={<Evolution />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="import" element={<Import />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;