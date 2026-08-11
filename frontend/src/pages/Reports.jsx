// frontend/src/pages/Reports.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from "recharts";
import { finance } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PictureAsPdf as PdfIcon } from "@mui/icons-material";

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const reportRef = useRef(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [annualData, setAnnualData] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    saldo: 0,
    variation: 0,
  });
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalVariation: 0,
    totalInvestments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, transRes, balRes, statsRes] = await Promise.all([
        finance.getInvestments(),
        finance.getTransactions(),
        finance.getBalances(),
        finance.getStats(),
      ]);

      setInvestments(invRes.data || []);
      setTransactions(transRes.data || []);

      const allBalances = balRes.data || [];
      const monthlyBalances = allBalances.filter((b) => b.month <= 12);
      setBalances(monthlyBalances);

      const statsData = statsRes.data || {};
      setStats({
        totalAssets: statsData.totalAssets || 0,
        totalLiabilities: statsData.totalLiabilities || 0,
        totalVariation: statsData.totalVariation || 0,
        totalInvestments: statsData.totalInvestments || 0,
      });

      const annualBalances = allBalances.filter(
        (b) => b.month === 13 && b.year === selectedYear,
      );
      if (annualBalances.length > 0) {
        const annual = annualBalances[0];
        const originalAssets = annual.totalAssets || 0;
        const originalLiabilities = annual.totalLiabilities || 0;
        const totalAssets = originalAssets + originalLiabilities;
        const saldo = totalAssets - originalLiabilities;

        setAnnualData({
          totalAssets: totalAssets,
          totalLiabilities: originalLiabilities,
          saldo: saldo,
          variation: annual.variation || 0,
        });
      } else {
        const originalAssets = statsData.totalAssets || 0;
        const originalLiabilities = statsData.totalLiabilities || 0;
        const totalAssets = originalAssets + originalLiabilities;
        const saldo = totalAssets - originalLiabilities;

        setAnnualData({
          totalAssets: totalAssets,
          totalLiabilities: originalLiabilities,
          saldo: saldo,
          variation: statsData.totalVariation || 0,
        });
      }

      const years = [...new Set(transRes.data.map((t) => t.year))].sort();
      setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredTransactions(
      transactions.filter((t) => t.year === selectedYear),
    );
  }, [transactions, selectedYear]);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }, []);

  const investmentByType = investments.reduce((acc, inv) => {
    const type = inv.type || "Outros";
    acc[type] = (acc[type] || 0) + (inv.grossBalance || 0);
    return acc;
  }, {});

  const investmentChartData = Object.entries(investmentByType).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const expensesByCategory = filteredTransactions
    .filter((t) => t.category === "Passivo")
    .reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.value;
      return acc;
    }, {});

  const expenseChartData = Object.entries(expensesByCategory).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const monthlyData = balances
    .filter((b) => b.year === selectedYear)
    .map((b) => ({
      month: `${b.month}/${b.year}`,
      ativos: b.totalAssets || 0,
      passivos: b.totalLiabilities || 0,
      patrimonio: (b.totalAssets || 0) - (b.totalLiabilities || 0),
      variacao: b.variation || 0,
    }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FF6B6B",
    "#A569BD",
  ];

  const CustomTooltip = useCallback(
    ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Paper
            sx={{
              p: 1.5,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            {payload.map((entry, index) => (
              <Typography
                key={index}
                variant="body2"
                color={entry.color}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <span>{entry.name}:</span>
                <span style={{ fontWeight: "bold" }}>
                  {formatCurrency(entry.value)}
                </span>
              </Typography>
            ))}
          </Paper>
        );
      }
      return null;
    },
    [formatCurrency, theme.palette.background.paper],
  );

  const abbreviateName = (name, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  const exportToPDF = useCallback(async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const usableWidth = pageWidth - margin * 2;

      let pageNum = 1;
      let isFirstPage = true;

      const addPageWithImage = async (element, title) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        pdf.setFillColor(25, 118, 210);
        pdf.rect(0, 0, pageWidth, 9, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text("Finance Dashboard - Relatório Financeiro", margin, 6);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Página ${pageNum}`, pageWidth - margin - 12, 6);
        pdf.setTextColor(0, 0, 0);

        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", margin, 12, imgWidth, imgHeight);

        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 6, pageWidth - margin, pageHeight - 6);
        pdf.setFontSize(5);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
          margin,
          pageHeight - 2,
        );
        pdf.text("Finance Dashboard", pageWidth - margin - 25, pageHeight - 2);
        pdf.setTextColor(0, 0, 0);

        pageNum++;
      };

      const container = document.createElement("div");
      container.style.width = "700px";
      container.style.padding = "20px";
      container.style.backgroundColor = "#ffffff";
      container.style.fontFamily = "Arial, sans-serif";

      container.innerHTML = `
        <div style="text-align: center; border-bottom: 3px solid #1976d2; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #1976d2; margin: 0; font-size: 24px;">📊 Relatório Financeiro</h1>
          <p style="color: #666; margin: 4px 0 0 0; font-size: 14px;">Ano: ${selectedYear} | Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total de Ativos</p>
            <p style="color: #1976d2; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalAssets)}</p>
          </div>
          <div style="background: #fce4ec; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total de Passivos</p>
            <p style="color: #dc004e; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalLiabilities)}</p>
          </div>
          <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total das Variações</p>
            <p style="color: #2e7d32; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalVariation)}</p>
          </div>
          <div style="background: #fff3e0; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 11px;">Total Investido</p>
            <p style="color: #ed6c02; font-size: 18px; font-weight: bold; margin: 4px 0 0 0;">${formatCurrency(stats.totalInvestments)}</p>
          </div>
        </div>
      `;
      document.body.appendChild(container);
      await addPageWithImage(container, "Resumo Geral");
      document.body.removeChild(container);

      const chartWrappers = document.querySelectorAll(".recharts-wrapper");
      if (chartWrappers.length > 0) {
        const c1 = document.createElement("div");
        c1.style.width = "700px";
        c1.style.padding = "15px";
        c1.style.backgroundColor = "#ffffff";
        const t1 = document.createElement("h3");
        t1.style.cssText =
          "color: #1976d2; margin: 0 0 10px 0; font-size: 16px; text-align: center;";
        t1.textContent = "🍩 Distribuição de Investimentos";
        c1.appendChild(t1);
        const clone1 = chartWrappers[0].cloneNode(true);
        clone1.style.width = "100%";
        clone1.style.height = "400px";
        c1.appendChild(clone1);
        document.body.appendChild(c1);
        await addPageWithImage(c1, "Distribuição de Investimentos");
        document.body.removeChild(c1);
      }

      if (chartWrappers.length > 1) {
        const c2 = document.createElement("div");
        c2.style.width = "700px";
        c2.style.padding = "15px";
        c2.style.backgroundColor = "#ffffff";
        const t2 = document.createElement("h3");
        t2.style.cssText =
          "color: #1976d2; margin: 0 0 10px 0; font-size: 16px; text-align: center;";
        t2.textContent = `📊 Despesas por Categoria - ${selectedYear}`;
        c2.appendChild(t2);
        const clone2 = chartWrappers[1].cloneNode(true);
        clone2.style.width = "100%";
        clone2.style.height = "380px";
        c2.appendChild(clone2);
        document.body.appendChild(c2);
        await addPageWithImage(c2, `Despesas por Categoria - ${selectedYear}`);
        document.body.removeChild(c2);
      }

      if (chartWrappers.length > 2) {
        const c3 = document.createElement("div");
        c3.style.width = "700px";
        c3.style.padding = "15px";
        c3.style.backgroundColor = "#ffffff";
        const t3 = document.createElement("h3");
        t3.style.cssText =
          "color: #1976d2; margin: 0 0 10px 0; font-size: 16px; text-align: center;";
        t3.textContent = `📈 Evolução Patrimonial - ${selectedYear}`;
        c3.appendChild(t3);
        const clone3 = chartWrappers[2].cloneNode(true);
        clone3.style.width = "100%";
        clone3.style.height = "380px";
        c3.appendChild(clone3);
        document.body.appendChild(c3);
        await addPageWithImage(c3, `Evolução Patrimonial - ${selectedYear}`);
        document.body.removeChild(c3);
      }

      pdf.save(`Relatorio_Financeiro_${selectedYear}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar PDF. Por favor, tente novamente.");
    } finally {
      setExporting(false);
    }
  }, [selectedYear, stats, formatCurrency]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%" }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        sx={{ mb: 3, gap: 1 }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          📊 Relatórios
        </Typography>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={exportToPDF}
          disabled={exporting || loading}
          sx={{
            backgroundColor: "#dc004e",
            "&:hover": { backgroundColor: "#b71c1c" },
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {exporting ? "Gerando PDF..." : "📄 Exportar PDF"}
        </Button>
      </Box>

      <div
        ref={reportRef}
        style={{ backgroundColor: "#ffffff", padding: "20px", width: "100%" }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 3,
            pb: 2,
            borderBottom: "2px solid #1976d2",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="primary">
            📊 Relatório Financeiro
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Ano: {selectedYear} | Gerado em:{" "}
            {new Date().toLocaleDateString("pt-BR")}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#e3f2fd", height: "100%" }}>
              <CardContent>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Total de Ativos (Acumulado)
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCurrency(stats.totalAssets)}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.6rem" }}
                >
                  (O11)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#fce4ec", height: "100%" }}>
              <CardContent>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Total de Passivos (Acumulado)
                </Typography>
                <Typography variant="h5" color="error" fontWeight="bold">
                  {formatCurrency(stats.totalLiabilities)}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.6rem" }}
                >
                  (O25)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#e8f5e9", height: "100%" }}>
              <CardContent>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Total das Variações (Acumulado)
                </Typography>
                <Typography variant="h5" color="success" fontWeight="bold">
                  {formatCurrency(stats.totalVariation)}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.6rem" }}
                >
                  (O27)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#fff3e0", height: "100%" }}>
              <CardContent>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Total Investido
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {formatCurrency(stats.totalInvestments)}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.6rem" }}
                >
                  (H29)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 3, elevation: 0 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, elevation: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#1976d2", textAlign: "center" }}
            >
              🍩 Distribuição de Investimentos por Tipo
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: isMobile ? 300 : isTablet ? 360 : 400,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investmentChartData}
                    cx="50%"
                    cy="40%"
                    labelLine={true}
                    label={({ name, percent }) => {
                      const shortName =
                        name.length > 15 ? name.substring(0, 12) + "..." : name;
                      return `${shortName}\n${(percent * 100).toFixed(1)}%`;
                    }}
                    outerRadius={isMobile ? 80 : 120}
                    innerRadius={isMobile ? 40 : 60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {investmentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    verticalAlign="bottom"
                    height={60}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, elevation: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#1976d2", textAlign: "center" }}
            >
              📊 Despesas por Categoria - {selectedYear}
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: isMobile ? 300 : isTablet ? 360 : 400,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 10,
                    bottom: isMobile ? 80 : 60,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e0e0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isMobile ? 8 : 10, fill: "#666" }}
                    interval={0}
                    angle={isMobile ? -45 : -30}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                    tickLine={false}
                    axisLine={{ stroke: "#e0e0e0" }}
                    tickFormatter={(value) =>
                      abbreviateName(value, isMobile ? 10 : 18)
                    }
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#666" }}
                    width={isMobile ? 60 : 90}
                    tickLine={false}
                    axisLine={{ stroke: "#e0e0e0" }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    verticalAlign="bottom"
                    height={30}
                  />
                  <Bar
                    dataKey="value"
                    fill="#dc004e"
                    name="Despesas"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={isMobile ? 30 : 50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, elevation: 1 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#1976d2", textAlign: "center" }}
            >
              📈 Evolução Patrimonial - {selectedYear}
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: isMobile ? 300 : isTablet ? 360 : 400,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e0e0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#666" }}
                    interval={isMobile ? 1 : 0}
                    tickLine={false}
                    axisLine={{ stroke: "#e0e0e0" }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#666" }}
                    width={isMobile ? 60 : 90}
                    tickLine={false}
                    axisLine={{ stroke: "#e0e0e0" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    verticalAlign="bottom"
                    height={30}
                  />
                  <Area
                    type="monotone"
                    dataKey="ativos"
                    stroke="#1976d2"
                    strokeWidth={3}
                    fill="#1976d2"
                    fillOpacity={0.2}
                    name="Ativos"
                  />
                  <Area
                    type="monotone"
                    dataKey="passivos"
                    stroke="#dc004e"
                    strokeWidth={3}
                    fill="#dc004e"
                    fillOpacity={0.2}
                    name="Passivos"
                  />
                  <Line
                    type="monotone"
                    dataKey="patrimonio"
                    stroke="#2e7d32"
                    strokeWidth={4}
                    name="Patrimônio"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 2, mb: 2, elevation: 1 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#1976d2" }}
          >
            📋 Resumo de Transações - {selectedYear}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ backgroundColor: "#e3f2fd" }}>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Total de Ativos
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(annualData.totalAssets)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: "0.6rem" }}
                  >
                    (O11 + O25)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ backgroundColor: "#fce4ec" }}>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Total de Passivos
                  </Typography>
                  <Typography variant="h6" color="error" fontWeight="bold">
                    {formatCurrency(annualData.totalLiabilities)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: "0.6rem" }}
                  >
                    (O25)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ backgroundColor: "#e8f5e9" }}>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Saldo
                  </Typography>
                  <Typography variant="h6" color="success" fontWeight="bold">
                    {formatCurrency(annualData.saldo)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: "0.6rem" }}
                  >
                    (O11 - O25)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Categoria</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    Valor
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 3, color: "textSecondary" }}
                    >
                      Nenhuma transação encontrada para {selectedYear}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(0, 25).map((trans) => (
                    <TableRow key={trans._id} hover>
                      <TableCell>
                        {trans.month}/{trans.year}
                      </TableCell>
                      <TableCell>{trans.description}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              trans.category === "Ativo"
                                ? "#2e7d32"
                                : "#dc004e",
                            fontWeight: "bold",
                          }}
                        >
                          {trans.category}
                        </span>
                      </TableCell>
                      <TableCell>{trans.type}</TableCell>
                      <TableCell align="right">
                        <span
                          style={{
                            color:
                              trans.category === "Ativo"
                                ? "#2e7d32"
                                : "#dc004e",
                            fontWeight: "bold",
                          }}
                        >
                          {formatCurrency(trans.value)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredTransactions.length > 25 && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", textAlign: "center", mt: 1 }}
            >
              ... e mais {filteredTransactions.length - 25} transações
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2, elevation: 1 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#1976d2" }}
          >
            📊 Resumo de Investimentos
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Total de Investimentos
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(
                      investments.reduce(
                        (sum, inv) => sum + (inv.grossBalance || 0),
                        0,
                      ),
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Quantidade de Ativos
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {investments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    Rendimento Médio
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {investments.length > 0
                      ? `${(investments.reduce((sum, inv) => sum + (inv.annualRate || 0), 0) / investments.length).toFixed(2)}%`
                      : "0%"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Produto</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Vencimento</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    Valor
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    Rendimento
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    Taxa
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: "textSecondary" }}
                    >
                      Nenhum investimento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  investments.slice(0, 20).map((inv) => (
                    <TableRow key={inv._id} hover>
                      <TableCell>{inv.type}</TableCell>
                      <TableCell>{inv.product}</TableCell>
                      <TableCell>{inv.name}</TableCell>
                      <TableCell>
                        {inv.maturityDate
                          ? new Date(inv.maturityDate).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(inv.grossBalance)}
                      </TableCell>
                      <TableCell align="right">
                        <span
                          style={{
                            color:
                              (inv.yield || 0) >= 0 ? "#2e7d32" : "#dc004e",
                          }}
                        >
                          {formatCurrency(inv.yield || 0)}
                        </span>
                      </TableCell>
                      <TableCell align="right">{inv.annualRate}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {investments.length > 20 && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", textAlign: "center", mt: 1 }}
            >
              ... e mais {investments.length - 20} investimentos
            </Typography>
          )}
        </Paper>
      </div>
    </Box>
  );
};

export default Reports;
