// frontend/src/pages/BudgetCalculatorPage.jsx
import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaCalculator,
  FaLightbulb,
  FaMoneyBillWave,
  FaGift,
  FaPiggyBank,
} from "react-icons/fa"; // Íconos para la calculadora

const BudgetCalculatorPage = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [needsPercentage, setNeedsPercentage] = useState(50); // 50%
  const [wantsPercentage, setWantsPercentage] = useState(30); // 30%
  const [savingsDebtsPercentage, setSavingsDebtsPercentage] = useState(20); // 20%

  const [calculationResult, setCalculationResult] = useState(null);
  const [formError, setFormError] = useState("");

  const handleCalculateBudget = (e) => {
    e.preventDefault();
    setFormError("");
    setCalculationResult(null);

    const income = parseFloat(monthlyIncome);

    if (isNaN(income) || income <= 0) {
      setFormError(
        "Por favor, ingresa un ingreso mensual válido (un número positivo)."
      );
      return;
    }

    const totalPercentage =
      needsPercentage + wantsPercentage + savingsDebtsPercentage;
    if (totalPercentage !== 100) {
      setFormError(
        `La suma de los porcentajes debe ser 100%. Actualmente es ${totalPercentage}%.`
      );
      return;
    }

    const needsAmount = (income * needsPercentage) / 100;
    const wantsAmount = (income * wantsPercentage) / 100;
    const savingsDebtsAmount = (income * savingsDebtsPercentage) / 100;

    setCalculationResult({
      needs: needsAmount,
      wants: wantsAmount,
      savingsDebts: savingsDebtsAmount,
    });
    toast.success("Presupuesto calculado exitosamente!");
  };

  const handlePercentageChange = (setter, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setter(numValue);
      setFormError(""); // Limpiar errores al cambiar porcentajes
    } else if (value === "") {
      setter(""); // Permitir que el campo esté temporalmente vacío
      setFormError("");
    } else {
      setFormError("Los porcentajes deben ser números entre 0 y 100.");
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">
        Calculadora de Presupuestos (Regla 50/30/20)
      </h2>

      <Card className="shadow-sm mx-auto mb-4" style={{ maxWidth: "700px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-3">
            Calcula tu Presupuesto
          </Card.Title>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Form onSubmit={handleCalculateBudget}>
            <Form.Group controlId="monthlyIncome" className="mb-4">
              <Form.Label>
                Tu Ingreso Mensual (después de impuestos):
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>USD</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Ej. 2500"
                  value={monthlyIncome}
                  onChange={(e) => {
                    setMonthlyIncome(e.target.value);
                    setFormError(""); // Limpiar error al escribir
                  }}
                  required
                  step="0.01"
                  min="0"
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Ingresa tu ingreso neto mensual.
              </Form.Text>
            </Form.Group>

            <h4 className="text-center mb-3">Distribución de Porcentajes</h4>
            <Row className="mb-4 g-3">
              <Col md={4}>
                <Form.Group controlId="needsPercentage">
                  <Form.Label>
                    <FaLightbulb /> Necesidades (Vivienda, Comida, Transporte,
                    Servicios):
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={needsPercentage}
                      onChange={(e) =>
                        handlePercentageChange(
                          setNeedsPercentage,
                          e.target.value
                        )
                      }
                      min="0"
                      max="100"
                      required
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="wantsPercentage">
                  <Form.Label>
                    <FaGift /> Deseos (Entretenimiento, Ocio, Salir a Comer):
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={wantsPercentage}
                      onChange={(e) =>
                        handlePercentageChange(
                          setWantsPercentage,
                          e.target.value
                        )
                      }
                      min="0"
                      max="100"
                      required
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="savingsDebtsPercentage">
                  <Form.Label>
                    <FaPiggyBank /> Ahorro y Pago de Deudas:
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={savingsDebtsPercentage}
                      onChange={(e) =>
                        handlePercentageChange(
                          setSavingsDebtsPercentage,
                          e.target.value
                        )
                      }
                      min="0"
                      max="100"
                      required
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                <FaCalculator /> Calcular Presupuesto
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {calculationResult && (
        <Card className="shadow-sm mx-auto" style={{ maxWidth: "700px" }}>
          <Card.Body>
            <Card.Title className="text-center mb-3">
              Tu Desglose de Presupuesto
            </Card.Title>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <FaLightbulb className="me-2 text-primary" />
                <strong>Necesidades ({needsPercentage}%):</strong>
                <span>{calculationResult.needs.toFixed(2)} USD</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <FaGift className="me-2 text-info" />
                <strong>Deseos ({wantsPercentage}%):</strong>
                <span>{calculationResult.wants.toFixed(2)} USD</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <FaPiggyBank className="me-2 text-success" />
                <strong>
                  Ahorro y Pago de Deudas ({savingsDebtsPercentage}%):
                </strong>
                <span>{calculationResult.savingsDebts.toFixed(2)} USD</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
                <FaMoneyBillWave className="me-2 text-dark" />
                <strong>Total (Ingreso):</strong>
                <span>{parseFloat(monthlyIncome).toFixed(2)} USD</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BudgetCalculatorPage;
