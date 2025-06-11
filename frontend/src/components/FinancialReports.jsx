// frontend/src/components/FinancialReports.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF19A0",
  "#00F0FF",
  "#FF00F0",
];

const FinancialReports = ({ token, setMessage }) => {
  const [reportType, setReportType] = useState("monthly"); // 'monthly' o 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  ); // YYYY
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReportData = useCallback(async () => {
    // console.log("Intentando cargar datos de reporte...");
    // console.log("Token recibido en FinancialReports:", token);
    setLoading(true);
    let startDate, endDate;

    if (reportType === "monthly") {
      const [year, month] = selectedMonth.split("-");
      const date = new Date(year, month - 1, 1);
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Último día del mes
    } else {
      // yearly
      const year = parseInt(selectedYear);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    // console.log("Fecha de inicio (startDate):", startDate); // <-- AÑADE ESTA LÍNEA
    // console.log("Fecha de fin (endDate):", endDate); // <-- AÑADE ESTA LÍNEA
    // console.log("startDate.toISOString():", startDate.toISOString()); // <-- AÑADE ESTA LÍNEA
    // console.log("endDate.toISOString():", endDate.toISOString());

    try {
      if (!token) {
        setMessage("Token no encontrado. Por favor, inicia sesión de nuevo.");
        setLoading(false);
        return;
      }
      api.defaults.headers.common["x-auth-token"] = token;

      // Obtener resumen de gastos por categoría
      const expenseRes = await api.get(
        "/api/transactions/summary",
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            type: "Gasto",
          },
        }
      );

      // Obtener resumen de ingresos por categoría (aunque no lo mostremos en PieChart, es útil para el flujo neto)
      const incomeRes = await api.get(
        "/api/transactions/summary",
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            type: "Ingreso",
          },
        }
      );

      // Flujo Neto y totales
      const netFlowRes = await api.get(
        "/api/transactions/summary",
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );

      setSummaryData({
        expenseSummary: expenseRes.data.categorySummary.map((item) => ({
          name: item._id,
          value: item.totalAmount,
        })),
        incomeSummary: incomeRes.data.categorySummary.map((item) => ({
          name: item._id,
          value: item.totalAmount,
        })),
        incomeTotal: netFlowRes.data.incomeTotal,
        expenseTotal: netFlowRes.data.expenseTotal,
        netFlow: netFlowRes.data.netFlow,
      });

      setMessage("");
    } catch (err) {
      console.error(
        "Error fetching report data:",
        err.response?.data?.msg || err.message
      );
      setMessage(
        `Error al cargar los reportes: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear, reportType, setMessage]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        marginTop: "30px",
      }}
    >
      <h3
        style={{
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        Reportes Financieros
      </h3>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <label>
          Tipo de Reporte:
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={{
              marginLeft: "10px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </label>

        {reportType === "monthly" ? (
          <label>
            Mes:
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
        ) : (
          <label>
            Año:
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2000" // Puedes ajustar el rango de años
              max="2050"
              style={{
                marginLeft: "10px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
        )}
        <button
          onClick={fetchReportData}
          style={{
            padding: "8px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generar Reporte
        </button>
      </div>

      {loading ? (
        <p>Cargando datos del reporte...</p>
      ) : summaryData ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Resumen General */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f8f8f8",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <h4>Resumen General</h4>
            <p>
              Ingresos Totales:{" "}
              <strong>{summaryData.incomeTotal.toFixed(2)} USD</strong>
            </p>
            <p>
              Gastos Totales:{" "}
              <strong>{summaryData.expenseTotal.toFixed(2)} USD</strong>
            </p>
            <p>
              Flujo Neto:{" "}
              <strong
                style={{ color: summaryData.netFlow >= 0 ? "green" : "red" }}
              >
                {summaryData.netFlow.toFixed(2)} USD
              </strong>
            </p>
          </div>

          {/* Gráfico de Gastos por Categoría (Pie Chart) */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f8f8f8",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <h4>Gastos por Categoría</h4>
            {summaryData.expenseSummary.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summaryData.expenseSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderCustomizedLabel}
                  >
                    {summaryData.expenseSummary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value.toFixed(2)} USD`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No hay datos de gastos para este período.</p>
            )}
          </div>

          {/* Gráfico de Ingresos por Categoría (Bar Chart) - Opcional, puedes modificarlo */}
          <div
            style={{
              gridColumn: "span 2",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f8f8f8",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <h4>Ingresos por Categoría</h4>
            {summaryData.incomeSummary.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={summaryData.incomeSummary}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} USD`]} />
                  <Legend />
                  <Bar dataKey="value" name="Monto" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No hay datos de ingresos para este período.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Selecciona un período y genera un reporte.</p>
      )}
    </div>
  );
};

export default FinancialReports;
