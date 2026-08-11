// frontend/src/components/Layout.jsx
import React, { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
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
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";

const drawerWidth = 260;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();

  // Alterna o estado do drawer
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  // Fecha o drawer - chamado tanto pela navegação quanto pelo backdrop
  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleDrawerClose();
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Evolução", icon: <TrendingUp />, path: "/evolution" },
    { text: "Investimentos", icon: <AccountBalance />, path: "/investments" },
    { text: "Transações", icon: <Receipt />, path: "/transactions" },
    { text: "Relatórios", icon: <Assessment />, path: "/reports" },
    { text: "Importar", icon: <CloudUploadIcon />, path: "/import" },
  ];

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Toolbar
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
          minHeight: 64,
          flexShrink: 0,
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            flexGrow: 1,
            textAlign: "center",
            noWrap: true,
          }}
        >
          KLING KLANG
        </Typography>
      </Toolbar>
      <Divider />
      <List
        sx={{
          pt: 1,
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 1,
        }}
      >
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              px: 1.5,
              py: 1,
              "&:hover": {
                backgroundColor: theme.palette.primary.light + "20",
              },
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.main + "15",
                borderRight: `3px solid ${theme.palette.primary.main}`,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.primary.main,
                minWidth: 36,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: "0.9rem",
                noWrap: true,
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ flexShrink: 0 }} />
      <Box
        sx={{
          p: 1.5,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              overflow: "hidden",
            }}
          >
            {darkMode ? (
              <Brightness4 fontSize="small" />
            ) : (
              <Brightness7 fontSize="small" />
            )}
            <Typography
              variant="body2"
              color="textSecondary"
              noWrap
              sx={{ fontSize: "0.8rem" }}
            >
              {darkMode ? "Escuro" : "Claro"}
            </Typography>
          </Box>
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            color="primary"
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />
      <Box
        sx={{
          p: 1.5,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <ListItem
          button
          onClick={() => handleNavigation("/profile")}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, flexShrink: 0 }}>
            <Person />
          </ListItemIcon>
          <ListItemText
            primary={user?.name || "Usuário"}
            secondary={user?.email}
            secondaryTypographyProps={{
              style: {
                fontSize: "0.7rem",
                color: theme.palette.text.secondary,
                noWrap: true,
              },
            }}
            primaryTypographyProps={{ noWrap: true, fontSize: "0.85rem" }}
            sx={{ flex: 1, minWidth: 0 }}
          />
        </ListItem>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          textAlign: "center",
          fontSize: "0.6rem",
          color: "#999",
          padding: "6px",
          borderTop: "1px solid " + (darkMode ? "#333" : "#eee"),
          overflow: "hidden",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.55rem",
            color: theme.palette.text.secondary,
            noWrap: true,
          }}
        >
          Desenvolvido por{" "}
          <a
            href="https://klingklang.free.nf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.primary.main,
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            BruCe
          </a>{" "}
          - 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", overflow: "hidden", width: "100%" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          pt: "env(safe-area-inset-top)",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1.5, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: theme.palette.primary.main,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Controle Financeiro
          </Typography>

          <IconButton onClick={toggleDarkMode} color="inherit" sx={{ mr: 0.5 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 34,
                height: 34,
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                minWidth: 180,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleNavigation("/profile");
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Meu Perfil</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{ color: theme.palette.secondary.main, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Logout
                  fontSize="small"
                  sx={{ color: theme.palette.secondary.main }}
                />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          overflow: "hidden",
        }}
      >
        {/* Drawer para mobile - o onClose é chamado pelo backdrop automaticamente */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: "100%",
              maxWidth: 280,
              backgroundColor: theme.palette.background.paper,
              overflow: "hidden",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Drawer permanente para desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid " + (darkMode ? "#333333" : "#f0f0f0"),
              boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
              backgroundColor: theme.palette.background.paper,
              overflow: "hidden",
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
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
          backgroundColor: theme.palette.background.default,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          pb: "env(safe-area-inset-bottom)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flex: 1, overflow: "hidden", width: "100%" }}>
          <Outlet />
        </Box>
        <Box
          sx={{
            textAlign: "center",
            mt: 3,
            pt: 1.5,
            borderTop: "1px solid " + (darkMode ? "#333333" : "#e0e0e0"),
            fontSize: "0.65rem",
            color: theme.palette.text.secondary,
            flexShrink: 0,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              color: theme.palette.text.secondary,
              noWrap: true,
            }}
          >
            Desenvolvido por{" "}
            <a
              href="https://klingklang.free.nf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              BruCe
            </a>{" "}
            - 2026
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
