// frontend/src/pages/Investments.jsx
import React, { useState, useEffect } from "react";
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
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { finance } from "../services/api";

const Investments = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: "Renda Fixa",
    product: "",
    name: "",
    emissionDate: "",
    maturityDate: "",
    purchaseValue: "",
    grossBalance: "",
    annualRate: "",
    irAndIof: "0",
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
      console.error("Erro ao carregar investimentos:", error);
      setError("Erro ao carregar investimentos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (investment = null) => {
    if (investment) {
      setEditingId(investment._id);
      setFormData({
        type: investment.type || "Renda Fixa",
        product: investment.product || "",
        name: investment.name || "",
        emissionDate: investment.emissionDate
          ? new Date(investment.emissionDate).toISOString().split("T")[0]
          : "",
        maturityDate: investment.maturityDate
          ? new Date(investment.maturityDate).toISOString().split("T")[0]
          : "",
        purchaseValue: investment.purchaseValue || "",
        grossBalance: investment.grossBalance || "",
        annualRate: investment.annualRate || "",
        irAndIof: investment.irAndIof || "0",
      });
    } else {
      setEditingId(null);
      setFormData({
        type: "Renda Fixa",
        product: "",
        name: "",
        emissionDate: "",
        maturityDate: "",
        purchaseValue: "",
        grossBalance: "",
        annualRate: "",
        irAndIof: "0",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError("");
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
        yield:
          (parseFloat(formData.grossBalance) || 0) -
          (parseFloat(formData.purchaseValue) || 0),
      };

      if (editingId) {
        await finance.updateInvestment(editingId, data);
        setSuccess("Investimento atualizado com sucesso!");
      } else {
        await finance.createInvestment(data);
        setSuccess("Investimento criado com sucesso!");
      }

      handleCloseDialog();
      loadInvestments();
    } catch (error) {
      console.error("Erro ao salvar investimento:", error);
      setError("Erro ao salvar investimento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este investimento?"))
      return;

    try {
      setLoading(true);
      await finance.deleteInvestment(id);
      setSuccess("Investimento excluído com sucesso!");
      loadInvestments();
    } catch (error) {
      console.error("Erro ao excluir investimento:", error);
      setError("Erro ao excluir investimento");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getTypeColor = (type) => {
    const colors = {
      "Renda Fixa": "primary",
      "Renda Variável": "warning",
      "Fundo Invest.": "info",
      Previdência: "secondary",
      "Conta Invest.": "success",
    };
    return colors[type] || "default";
  };

  const totalPurchase = investments.reduce(
    (sum, inv) => sum + (inv.purchaseValue || 0),
    0,
  );
  const totalBalance = investments.reduce(
    (sum, inv) => sum + (inv.grossBalance || 0),
    0,
  );
  const totalYield = investments.reduce(
    (sum, inv) => sum + (inv.yield || 0),
    0,
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        sx={{ gap: 1 }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          📈 Investimentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size={isMobile ? "small" : "medium"}
          sx={{ flexShrink: 0 }}
        >
          {isMobile ? "Novo" : "Novo Investimento"}
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: "#e3f2fd", height: "100%" }}>
            <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Total Investido
              </Typography>
              <Typography
                variant="h5"
                color="primary"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
              >
                {formatCurrency(totalPurchase)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  fontSize: { xs: "0.5rem", sm: "0.6rem" },
                  display: "block",
                }}
              >
                Soma dos valores de compra
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: "#bbdefb", height: "100%" }}>
            <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Saldo Bruto
              </Typography>
              <Typography
                variant="h5"
                color="primary"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
              >
                {formatCurrency(totalBalance)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  fontSize: { xs: "0.5rem", sm: "0.6rem" },
                  display: "block",
                }}
              >
                Soma dos saldos atuais (H29)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: totalYield >= 0 ? "#e8f5e9" : "#fce4ec",
              height: "100%",
            }}
          >
            <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Rendimento Total
              </Typography>
              <Typography
                variant="h5"
                color={totalYield >= 0 ? "success.main" : "error.main"}
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
              >
                {formatCurrency(totalYield)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  fontSize: { xs: "0.5rem", sm: "0.6rem" },
                  display: "block",
                }}
              >
                {totalPurchase > 0
                  ? ((totalYield / totalPurchase) * 100).toFixed(2)
                  : 0}
                % de retorno
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isMobile ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {loading && !investments.length ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : investments.length === 0 ? (
            <Paper
              sx={{ p: 3, textAlign: "center", borderRadius: 3, elevation: 0 }}
            >
              <Typography color="textSecondary">
                Nenhum investimento encontrado
              </Typography>
            </Paper>
          ) : (
            investments.map((inv) => (
              <Card key={inv._id} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0, pr: 1 }}>
                      <Chip
                        label={inv.type}
                        size="small"
                        color={getTypeColor(inv.type)}
                        sx={{ fontWeight: 500, mb: 0.5, fontSize: "0.65rem" }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          wordBreak: "break-word",
                          fontSize: "0.9rem",
                        }}
                      >
                        {inv.name || inv.product || "—"}
                      </Typography>
                      {inv.name && inv.product && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {inv.product}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(inv)}
                        sx={{ minWidth: 36, minHeight: 36 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(inv._id)}
                        sx={{ minWidth: 36, minHeight: 36 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 0.5,
                      mt: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        Valor Compra
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        {formatCurrency(inv.purchaseValue)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        Saldo Bruto
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, fontSize: "0.8rem" }}
                      >
                        {formatCurrency(inv.grossBalance)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        Rendimento
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          (inv.yield || 0) >= 0 ? "success.main" : "error.main"
                        }
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {formatCurrency(inv.yield || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        Taxa / Vencimento
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                      >
                        {inv.annualRate}% · {formatDate(inv.maturityDate)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : isTablet ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {loading && !investments.length ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
                gridColumn: "1 / -1",
              }}
            >
              <CircularProgress />
            </Box>
          ) : investments.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                elevation: 0,
                gridColumn: "1 / -1",
              }}
            >
              <Typography color="textSecondary">
                Nenhum investimento encontrado
              </Typography>
            </Paper>
          ) : (
            investments.map((inv) => (
              <Card key={inv._id} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0, pr: 1 }}>
                      <Chip
                        label={inv.type}
                        size="small"
                        color={getTypeColor(inv.type)}
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      />
                      <Typography
                        sx={{ fontWeight: 600, wordBreak: "break-word" }}
                      >
                        {inv.name || inv.product || "—"}
                      </Typography>
                      {inv.name && inv.product && (
                        <Typography variant="caption" color="textSecondary">
                          {inv.product}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(inv)}
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
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 0.5,
                      mt: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Valor Compra
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(inv.purchaseValue)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Saldo Bruto
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(inv.grossBalance)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Rendimento
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          (inv.yield || 0) >= 0 ? "success.main" : "error.main"
                        }
                      >
                        {formatCurrency(inv.yield || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Taxa / Vencimento
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {inv.annualRate}% · {formatDate(inv.maturityDate)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            overflowX: "auto",
            elevation: 1,
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Produto
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Nome
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Vencimento
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Valor Compra
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Saldo Bruto
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Rendimento
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Taxa
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Ações
                </TableCell>
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
                    <Typography color="textSecondary">
                      Nenhum investimento encontrado
                    </Typography>
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
                    <TableCell>{inv.product}</TableCell>
                    <TableCell>{inv.name}</TableCell>
                    <TableCell>{formatDate(inv.maturityDate)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(inv.purchaseValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(inv.grossBalance)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={
                          (inv.yield || 0) >= 0 ? "success.main" : "error.main"
                        }
                        fontWeight="bold"
                      >
                        {formatCurrency(inv.yield || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{inv.annualRate}%</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(inv)}
                        sx={{ mr: 0.5 }}
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
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingId ? "✏️ Editar Investimento" : "➕ Novo Investimento"}
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
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Emissão"
                type="date"
                value={formData.emissionDate}
                onChange={(e) =>
                  setFormData({ ...formData, emissionDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Vencimento"
                type="date"
                value={formData.maturityDate}
                onChange={(e) =>
                  setFormData({ ...formData, maturityDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor de Compra"
                type="number"
                value={formData.purchaseValue}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseValue: e.target.value })
                }
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>R$</span>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Saldo Bruto"
                type="number"
                value={formData.grossBalance}
                onChange={(e) =>
                  setFormData({ ...formData, grossBalance: e.target.value })
                }
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>R$</span>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Taxa Anual (%)"
                type="number"
                value={formData.annualRate}
                onChange={(e) =>
                  setFormData({ ...formData, annualRate: e.target.value })
                }
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="IR e IOF"
                type="number"
                value={formData.irAndIof}
                onChange={(e) =>
                  setFormData({ ...formData, irAndIof: e.target.value })
                }
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>R$</span>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexWrap: "wrap", gap: 1 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : editingId ? (
              "Atualizar"
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Investments;
