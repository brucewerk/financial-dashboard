// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import Transactions from './pages/Transactions';
import Evolution from './pages/Evolution';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Import from './pages/Import';

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