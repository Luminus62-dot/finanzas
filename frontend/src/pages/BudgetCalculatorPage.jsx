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
  ListGroup,
  Alert,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaCalculator,
  FaLightbulb,
  FaMoneyBillWave,
  FaGift,
  FaPiggyBank,
} from "react-icons/fa";

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
      parseFloat(needsPercentage) +
      parseFloat(wantsPercentage) +
      parseFloat(savingsDebtsPercentage); // Asegurar que sean números
    if (totalPercentage !== 100) {
      setFormError(
        `La suma de los porcentajes debe ser 100%. Actualmente es ${totalPercentage}%.`
      );
      return;
    }

    const needsAmount = (income * parseFloat(needsPercentage)) / 100;
    const wantsAmount = (income * parseFloat(wantsPercentage)) / 100;
    const savingsDebtsAmount =
      (income * parseFloat(savingsDebtsPercentage)) / 100;

    setCalculationResult({
      needs: needsAmount,
      wants: wantsAmount,
      savingsDebts: savingsDebtsAmount,
    });
    toast.success("Presupuesto calculado exitosamente!");
  };

  const handlePercentageChange = (setter, value) => {
    const numValue = value === "" ? "" : parseInt(value); // Permitir string vacío para borrar, luego convertir
    if (
      value === "" ||
      (!isNaN(numValue) && numValue >= 0 && numValue <= 100)
    ) {
      setter(numValue); // Guardar como número o string vacío
      setFormError("");
    } else if (
      value !== "" &&
      (isNaN(numValue) || numValue < 0 || numValue > 100)
    ) {
      // Solo mostrar error si no está vacío y es inválido
      setFormError("Los porcentajes deben ser números entre 0 y 100.");
    }
  };

  return (
    <Container className="py-4">
      <>
        <h2 className="mb-4 text-center page-title">
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
                      setFormError("");
                    }}
                    required
                    step="0.01"
                    min="0"
                    isInvalid={
                      !!formError &&
                      (monthlyIncome === "" ||
                        isNaN(parseFloat(monthlyIncome)) ||
                        parseFloat(monthlyIncome) <= 0)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formError &&
                    (monthlyIncome === "" ||
                      isNaN(parseFloat(monthlyIncome)) ||
                      parseFloat(monthlyIncome) <= 0)
                      ? "El ingreso mensual es requerido y debe ser un número positivo."
                      : null}
                  </Form.Control.Feedback>
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
                      <FaLightbulb /> Necesidades:
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
                        isInvalid={
                          !!formError &&
                          (needsPercentage === "" ||
                            isNaN(parseFloat(needsPercentage)) ||
                            parseFloat(needsPercentage) < 0 ||
                            parseFloat(needsPercentage) > 100)
                        }
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {formError && needsPercentage === ""
                          ? "El porcentaje es requerido."
                          : formError &&
                            (isNaN(parseFloat(needsPercentage)) ||
                              parseFloat(needsPercentage) < 0 ||
                              parseFloat(needsPercentage) > 100)
                          ? "Debe ser entre 0 y 100."
                          : null}
                      </Form.Control.Feedback>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Ej: Vivienda, Comida, Transporte, Servicios.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="wantsPercentage">
                    <Form.Label>
                      <FaGift /> Deseos:
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
                        isInvalid={
                          !!formError &&
                          (wantsPercentage === "" ||
                            isNaN(parseFloat(wantsPercentage)) ||
                            parseFloat(wantsPercentage) < 0 ||
                            parseFloat(wantsPercentage) > 100)
                        }
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {formError && wantsPercentage === ""
                          ? "El porcentaje es requerido."
                          : formError &&
                            (isNaN(parseFloat(wantsPercentage)) ||
                              parseFloat(wantsPercentage) < 0 ||
                              parseFloat(wantsPercentage) > 100)
                          ? "Debe ser entre 0 y 100."
                          : null}
                      </Form.Control.Feedback>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Ej: Entretenimiento, Ocio, Salir a Comer.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="savingsDebtsPercentage">
                    <Form.Label>
                      <FaPiggyBank /> Ahorro y Deudas:
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
                        isInvalid={
                          !!formError &&
                          (savingsDebtsPercentage === "" ||
                            isNaN(parseFloat(savingsDebtsPercentage)) ||
                            parseFloat(savingsDebtsPercentage) < 0 ||
                            parseFloat(savingsDebtsPercentage) > 100)
                        }
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {formError && savingsDebtsPercentage === ""
                          ? "El porcentaje es requerido."
                          : formError &&
                            (isNaN(parseFloat(savingsDebtsPercentage)) ||
                              parseFloat(savingsDebtsPercentage) < 0 ||
                              parseFloat(savingsDebtsPercentage) > 100)
                          ? "Debe ser entre 0 y 100."
                          : null}
                      </Form.Control.Feedback>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Ej: Fondo de emergencia, pago de préstamos, inversiones.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" className="fancy-btn">
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
                  <div>
                    <FaLightbulb className="me-2 text-primary" />
                    <strong>Necesidades ({needsPercentage}%):</strong>
                  </div>
                  <span>{calculationResult.needs.toFixed(2)} USD</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaGift className="me-2 text-info" />
                    <strong>Deseos ({wantsPercentage}%):</strong>
                  </div>
                  <span>{calculationResult.wants.toFixed(2)} USD</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaPiggyBank className="me-2 text-success" />
                    <strong>
                      Ahorro y Pago de Deudas ({savingsDebtsPercentage}%):
                    </strong>
                  </div>
                  <span>{calculationResult.savingsDebts.toFixed(2)} USD</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
                  <div>
                    <FaMoneyBillWave className="me-2 text-dark" />
                    <strong>Total (Ingreso):</strong>
                  </div>
                  <span>{parseFloat(monthlyIncome).toFixed(2)} USD</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        )}
      </>
    </Container>
  );
};

export default BudgetCalculatorPage;
