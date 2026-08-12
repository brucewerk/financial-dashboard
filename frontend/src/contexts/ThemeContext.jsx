// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

// Config compartilhada pelos dois temas: tipografia e componentes que não
// mudam de cor entre claro/escuro, só o essencial pra não duplicar.
const sharedTypography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h4: { fontWeight: 700, letterSpacing: '-0.5px' },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        // 44px é o alvo de toque mínimo recomendado pela Apple (iOS HIG) —
        // evita toque errado em telas pequenas.
        minHeight: 44,
      },
      sizeSmall: {
        minHeight: 36,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        // Idem para os botões de ícone (editar/excluir nas tabelas/cartões).
        '@media (pointer: coarse)': {
          minWidth: 40,
          minHeight: 40,
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      // Campos um pouco mais compactos por padrão poupam espaço vertical
      // valioso em telas de celular sem prejudicar a legibilidade.
      size: 'medium',
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 500 },
    },
  },
};

// Tema Claro
let lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
lightTheme = responsiveFontSizes(lightTheme);

// Tema Escuro
let darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6',
    },
    secondary: {
      main: '#ef5350',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: '#e0e0e0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #333333',
        },
        head: {
          backgroundColor: '#2a2a2a',
          color: '#e0e0e0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#2a2a2a',
          },
        },
      },
    },
  },
});
darkTheme = responsiveFontSizes(darkTheme);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));

    // Mantém a cor da barra de endereço/status bar do celular alinhada
    // com o tema escolhido dentro do app (os meta tags no index.html só
    // cobrem a preferência do sistema operacional, não o switch manual).
    const color = darkMode ? '#121212' : '#1976d2';
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((tag) => tag.setAttribute('content', color));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};