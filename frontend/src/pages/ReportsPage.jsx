// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
} from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaExchangeAlt,
  FaReceipt,
  FaChartLine,
} from "react-icons/fa";
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
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF19A0",
  "#00F0FF",
  "#FF00F0",
  "#8A2BE2",
  "#DE3163",
  "#5DADE2",
  "#2ECC71",
];

const ReportsPage = () => {
  const { token } = useContext(AuthContext);
  const [reportType, setReportType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  ); // YYYY
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    averageAmount: 0,
  });

  const fetchReportData = useCallback(async () => {
    // console.log("\n--- Frontend Debugging Reporte (fetchReportData) ---");
    // console.log("Token en ReportsPage:", token);

    setLoading(true);
    let startMoment, endMoment;

    if (reportType === "monthly") {
      const [year, month] = selectedMonth.split("-");
      startMoment = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
      endMoment = new Date(
        Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      );
    } else {
      // yearly
      const year = parseInt(selectedYear);
      startMoment = new Date(Date.UTC(year, 0, 1));
      endMoment = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    }

    const startDateISO = startMoment.toISOString();
    const endDateISO = endMoment.toISOString();

    // console.log("Fechas generadas para API:");
    // console.log("  startMoment (UTC Date obj):", startMoment);
    // console.log("  endMoment (UTC Date obj):", endMoment);
    // console.log("  startDateISO (para backend):", startDateISO);
    // console.log("  endDateISO (para backend):", endDateISO);
    // console.log("------------------------------------\n");

    try {
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        setLoading(false);
        return;
      }
      // console.log("DEBUG: ReportsPage - Realizando peticiones Axios...");

      const [expenseRes, incomeRes, netFlowRes, transactionsRes] = await Promise.all([
        api.get("/transactions/summary", {
          params: {
            startDate: startDateISO,
            endDate: endDateISO,
            type: "Gasto",
          },
        }),
        api.get("/transactions/summary", {
          params: {
            startDate: startDateISO,
            endDate: endDateISO,
            type: "Ingreso",
          },
        }),
        api.get("/transactions/summary", {
          params: { startDate: startDateISO, endDate: endDateISO },
        }),
        api.get("/transactions", {
          params: { startDate: startDateISO, endDate: endDateISO },
        }),
      ]);

      // console.log("DEBUG: ReportsPage - Respuestas recibidas:");
      // console.log("  expenseRes.data:", expenseRes.data);
      // console.log("  incomeRes.data:", incomeRes.data);
      // console.log("  netFlowRes.data:", netFlowRes.data);

      const transactions = Array.isArray(transactionsRes.data)
        ? transactionsRes.data
        : [];

      const processedSummaryData = {
        expenseSummary: Array.isArray(expenseRes.data.categorySummary)
          ? expenseRes.data.categorySummary.map((item) => ({
              name: item._id,
              value: item.totalAmount,
            }))
          : [],
        incomeSummary: Array.isArray(incomeRes.data.categorySummary)
          ? incomeRes.data.categorySummary.map((item) => ({
              name: item._id,
              value: item.totalAmount,
            }))
          : [],
        incomeTotal: netFlowRes.data.incomeTotal || 0,
        expenseTotal: netFlowRes.data.expenseTotal || 0,
        netFlow: netFlowRes.data.netFlow || 0,
      };

      const totalTransactions = transactions.length;
      const averageAmount =
        totalTransactions > 0
          ?
            transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0) /
            totalTransactions
          : 0;

      setStats({ totalTransactions, averageAmount });

      setSummaryData(processedSummaryData);
      toast.success("Reporte generado exitosamente!");
      // console.log(
//         "DEBUG: ReportsPage - summaryData establecido:",
//         processedSummaryData
//       );
    } catch (err) {
      console.error(
        "DEBUG: ReportsPage - Error CATCH en fetchReportData:",
        err.response?.data || err.message
      );
      toast.error(
        `Error al cargar los reportes: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
      setSummaryData(null);
    } finally {
      setLoading(false);
      // console.log(
//         "DEBUG: ReportsPage - fetchReportData finalizado. Loading a false."
//       );
    }
  }, [token, selectedMonth, selectedYear, reportType]);

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
        fill="#000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // console.log(
//     "DEBUG: ReportsPage - Render JSX. Current summaryData:",
//     summaryData,
//     "Current loading:",
//     loading
//   );

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center page-title">Reportes Financieros</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            Generar Reporte por Período
          </Card.Title>
          <Form>
            <Row className="mb-3 g-3 align-items-end">
              <Col md={4}>
                <Form.Group controlId="reportType">
                  <Form.Label>Tipo de Reporte:</Form.Label>
                  <Form.Control
                    as="select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={4}>
                {reportType === "monthly" ? (
                  <Form.Group controlId="selectedMonth">
                    <Form.Label>Mes:</Form.Label>
                    <Form.Control
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </Form.Group>
                ) : (
                  <Form.Group controlId="selectedYear">
                    <Form.Label>Año:</Form.Label>
                    <Form.Control
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      min="2000"
                      max="2050"
                    />
                  </Form.Group>
                )}
              </Col>
              <Col md={4} className="d-grid">
                <Button onClick={fetchReportData} variant="primary" className="fancy-btn">
                  Generar Reporte
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <p className="text-center">Cargando datos del reporte...</p>
      ) : summaryData ? (
        <Row className="g-4">
          {/* Resumen General */}
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title className="mb-3">Resumen General</Card.Title>
                <Row>
                  <Col xs={12} md={4} className="mb-2">
                    <h5 className="text-success">
                      <FaMoneyBillWave className="me-2" />
                      Ingresos: {summaryData.incomeTotal.toFixed(2)} USD
                    </h5>
                  </Col>
                  <Col xs={12} md={4} className="mb-2">
                    <h5 className="text-danger">
                      <FaShoppingCart className="me-2" />
                      Gastos: {summaryData.expenseTotal.toFixed(2)} USD
                    </h5>
                  </Col>
                  <Col xs={12} md={4} className="mb-2">
                    <h5
                      className={
                        summaryData.netFlow >= 0
                          ? "text-primary"
                          : "text-danger"
                      }
                    >
                      <FaExchangeAlt className="me-2" />
                      Flujo Neto: {summaryData.netFlow.toFixed(2)} USD
                    </h5>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={12} md={6} className="mb-2">
                    <h6>
                      <FaReceipt className="me-2" />
                      Total Transacciones: {stats.totalTransactions}
                    </h6>
                  </Col>
                  <Col xs={12} md={6} className="mb-2">
                    <h6>
                      <FaChartLine className="me-2" />
                      Promedio por Transacción: {stats.averageAmount.toFixed(2)} USD
                    </h6>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Gráfico de Gastos por Categoría (Pie Chart) */}
          <Col xs={12} md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="text-center mb-3">
                  Gastos por Categoría
                </Card.Title>
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
                  <p className="text-center text-muted">
                    No hay datos de gastos para este período.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Gráfico de Ingresos por Categoría (Bar Chart) */}
          <Col xs={12} md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="text-center mb-3">
                  Ingresos por Categoría
                </Card.Title>
                {summaryData.incomeSummary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={summaryData.incomeSummary}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(2)} USD`]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Monto" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted">
                    No hay datos de ingresos para este período.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Tabla Detallada por Categoría */}
          <Col xs={12} className="mt-4">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="text-center mb-3">
                  Detalle por Categoría
                </Card.Title>
                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <h6 className="text-center">Gastos</h6>
                    <Table striped bordered hover size="sm">
                      <tbody>
                        {summaryData.expenseSummary.map((item) => (
                          <tr key={`exp-${item.name}`}>
                            <td>{item.name}</td>
                            <td className="text-end">
                              {item.value.toFixed(2)} USD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <h6 className="text-center">Ingresos</h6>
                    <Table striped bordered hover size="sm">
                      <tbody>
                        {summaryData.incomeSummary.map((item) => (
                          <tr key={`inc-${item.name}`}>
                            <td>{item.name}</td>
                            <td className="text-end">
                              {item.value.toFixed(2)} USD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <p className="text-center text-muted">
          Selecciona un período y genera un reporte.
        </p>
      )}
    </Container>
  );
};

export default ReportsPage;
