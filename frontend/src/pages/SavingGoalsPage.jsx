// frontend/src/pages/SavingGoalsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  ProgressBar,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const SavingGoalsPage = ({ token }) => {
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTargetAmount, setNewGoalTargetAmount] = useState("");
  const [newGoalDueDate, setNewGoalDueDate] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [addAmount, setAddAmount] = useState("");

  // NUEVO ESTADO para errores del formulario de metas de ahorro
  const [goalFormErrors, setGoalFormErrors] = useState({});

  const fetchSavingGoals = useCallback(async () => {
    try {
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      console.log(
        "DEBUG: SavingGoalsPage - Enviando GET a /api/savinggoals..."
      );
      const res = await api.get(`/savinggoals`);
      console.log(
        "DEBUG: SavingGoalsPage - Respuesta de /api/savinggoals:",
        res.data
      );
      if (Array.isArray(res.data)) {
        setGoals(res.data);
      } else {
        console.error(
          "DEBUG: SavingGoalsPage - La respuesta de /api/savinggoals NO es un array:",
          res.data
        );
        setGoals([]);
        toast.error("Formato de datos de metas de ahorro inesperado.");
      }
    } catch (err) {
      console.error(
        "DEBUG: SavingGoalsPage - Error al cargar metas de ahorro:",
        err.response?.data || err.message
      );
      toast.error(
        `Error al cargar metas de ahorro: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
    }
  }, [token]);

  useEffect(() => {
    console.log("DEBUG: SavingGoalsPage - Iniciando carga inicial de datos...");
    fetchSavingGoals();
  }, [fetchSavingGoals]);

  // NUEVA FUNCIÓN DE VALIDACIÓN PARA EL FORMULARIO DE METAS
  const validateGoalForm = (isEditing = false, dataToValidate) => {
    const errors = {};
    const data =
      dataToValidate ||
      (isEditing
        ? editingGoal
        : {
            name: newGoalName,
            targetAmount: newGoalTargetAmount,
            currentAmount: 0,
          });

    if (!data.name || data.name.trim() === "") {
      errors.name = "El nombre de la meta es requerido.";
    }
    if (
      isNaN(parseFloat(data.targetAmount)) ||
      parseFloat(data.targetAmount) <= 0
    ) {
      errors.targetAmount = "El monto objetivo debe ser un número positivo.";
    }
    if (
      isEditing &&
      (isNaN(parseFloat(data.currentAmount)) ||
        parseFloat(data.currentAmount) < 0)
    ) {
      // Monto actual solo en edición, puede ser 0
      errors.currentAmount =
        "El monto actual debe ser un número positivo o cero.";
    }
    // Puedes añadir validación para la fecha límite si lo deseas
    // if (data.dueDate && new Date(data.dueDate) < new Date()) { errors.dueDate = 'La fecha límite no puede ser en el pasado.'; }

    setGoalFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!validateGoalForm(false)) {
      // Validar para añadir
      return;
    }
    try {
      console.log(
        "DEBUG: SavingGoalsPage - Enviando POST a /api/savinggoals..."
      );
      const goalData = {
        name: newGoalName,
        targetAmount: parseFloat(newGoalTargetAmount),
        dueDate: newGoalDueDate || undefined,
        description: newGoalDescription,
      };
      await api.post(`/savinggoals`, goalData);
      toast.success("Meta de ahorro creada exitosamente!");
      setNewGoalName("");
      setNewGoalTargetAmount("");
      setNewGoalDueDate("");
      setNewGoalDescription("");
      fetchSavingGoals();
      setGoalFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(
        `Error al crear meta de ahorro: ${
          err.response?.data?.msg || err.message
        }`
      );
    }
  };

  const startEditGoal = (goal) => {
    setEditingGoal({
      ...goal,
      dueDate: goal.dueDate
        ? new Date(goal.dueDate).toISOString().slice(0, 10)
        : "",
    });
    setGoalFormErrors({}); // Limpiar errores al iniciar edición
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setGoalFormErrors({}); // Limpiar errores al cancelar
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;
    if (!validateGoalForm(true, editingGoal)) {
      // Validar para editar, pasando el objeto editingGoal
      return;
    }

    try {
      console.log(
        "DEBUG: SavingGoalsPage - Enviando PUT a /api/savinggoals/:id..."
      );
      const updatedGoalData = {
        name: editingGoal.name,
        targetAmount: parseFloat(editingGoal.targetAmount),
        currentAmount: parseFloat(editingGoal.currentAmount),
        dueDate: editingGoal.dueDate || undefined,
        description: editingGoal.description,
        isCompleted: editingGoal.isCompleted,
      };
      await api.put(`/savinggoals/${editingGoal._id}`, updatedGoalData);
      toast.success("Meta de ahorro actualizada exitosamente!");
      setEditingGoal(null);
      fetchSavingGoals();
      setGoalFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(
        `Error al actualizar meta de ahorro: ${
          err.response?.data?.msg || err.message
        }`
      );
    }
  };

  const handleAddAmountToGoal = async (goalId, currentAmount) => {
    // Validar solo el monto a añadir
    const errors = {};
    if (isNaN(parseFloat(addAmount)) || parseFloat(addAmount) <= 0) {
      errors.addAmount = "El monto a añadir debe ser un número positivo.";
    }
    if (Object.keys(errors).length > 0) {
      setGoalFormErrors(errors); // Usamos goalFormErrors para esto también
      return;
    }
    setGoalFormErrors({}); // Limpiar si pasa la validación

    try {
      console.log("DEBUG: SavingGoalsPage - Añadiendo monto a meta...");
      const goalToUpdate = goals.find((g) => g._id === goalId);
      if (!goalToUpdate) return;

      const newCurrentAmount = currentAmount + parseFloat(addAmount);
      await api.put(`/savinggoals/${goalId}`, {
        currentAmount: newCurrentAmount,
        isCompleted: newCurrentAmount >= goalToUpdate.targetAmount,
      });
      toast.success(
        `Monto de ${parseFloat(addAmount).toFixed(2)} añadido a la meta!`
      );
      setAddAmount("");
      fetchSavingGoals();
    } catch (err) {
      toast.error(
        `Error al añadir monto: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const handleDeleteGoal = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta meta de ahorro?"
      )
    ) {
      try {
        console.log(
          "DEBUG: SavingGoalsPage - Enviando DELETE a /api/savinggoals/:id..."
        );
        await api.delete(`/savinggoals/${id}`);
        toast.success("Meta de ahorro eliminada exitosamente!");
        fetchSavingGoals();
      } catch (err) {
        toast.error(
          `Error al eliminar meta de ahorro: ${
            err.response?.data?.msg || err.message
          }`
        );
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Mis Metas de Ahorro</h2>

      {/* Formulario para Añadir/Editar Meta de Ahorro */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingGoal ? "Editar Meta de Ahorro" : "Crear Nueva Meta"}
          </Card.Title>
          <Form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}>
            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group controlId="goalName">
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingGoal ? editingGoal.name : newGoalName}
                    onChange={(e) => {
                      if (editingGoal) {
                        setEditingGoal({
                          ...editingGoal,
                          name: e.target.value,
                        });
                      } else {
                        setNewGoalName(e.target.value);
                      }
                      setGoalFormErrors({ ...goalFormErrors, name: "" }); // Limpiar error
                    }}
                    isInvalid={!!goalFormErrors.name} // Marcar inválido
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {goalFormErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="goalTargetAmount">
                  <Form.Label>Monto Objetivo:</Form.Label>
                  <Form.Control
                    type="number"
                    value={
                      editingGoal
                        ? editingGoal.targetAmount
                        : newGoalTargetAmount
                    }
                    onChange={(e) => {
                      if (editingGoal) {
                        setEditingGoal({
                          ...editingGoal,
                          targetAmount: e.target.value,
                        });
                      } else {
                        setNewGoalTargetAmount(e.target.value);
                      }
                      setGoalFormErrors({
                        ...goalFormErrors,
                        targetAmount: "",
                      }); // Limpiar error
                    }}
                    isInvalid={!!goalFormErrors.targetAmount} // Marcar inválido
                    required
                    step="0.01"
                    min="0.01"
                  />
                  <Form.Control.Feedback type="invalid">
                    {goalFormErrors.targetAmount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3 g-3">
              {editingGoal && (
                <Col md={6}>
                  <Form.Group controlId="goalCurrentAmount">
                    <Form.Label>Monto Actual:</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingGoal.currentAmount}
                      onChange={(e) => {
                        setEditingGoal({
                          ...editingGoal,
                          currentAmount: e.target.value,
                        });
                        setGoalFormErrors({
                          ...goalFormErrors,
                          currentAmount: "",
                        }); // Limpiar error
                      }}
                      isInvalid={!!goalFormErrors.currentAmount} // Marcar inválido
                      step="0.01"
                      min="0"
                    />
                    <Form.Control.Feedback type="invalid">
                      {goalFormErrors.currentAmount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={editingGoal ? 6 : 12}>
                <Form.Group controlId="goalDueDate">
                  <Form.Label>Fecha Límite (opcional):</Form.Label>
                  <Form.Control
                    type="date"
                    value={editingGoal ? editingGoal.dueDate : newGoalDueDate}
                    onChange={(e) =>
                      editingGoal
                        ? setEditingGoal({
                            ...editingGoal,
                            dueDate: e.target.value,
                          })
                        : setNewGoalDueDate(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="goalDescription" className="mb-4">
              <Form.Label>Descripción (opcional):</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={
                  editingGoal ? editingGoal.description : newGoalDescription
                }
                onChange={(e) =>
                  editingGoal
                    ? setEditingGoal({
                        ...editingGoal,
                        description: e.target.value,
                      })
                    : setNewGoalDescription(e.target.value)
                }
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button
                variant={editingGoal ? "warning" : "success"}
                type="submit"
              >
                {editingGoal ? "Guardar Cambios" : "Crear Meta"}
              </Button>
              {editingGoal && (
                <Button variant="secondary" onClick={cancelEditGoal}>
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Listado de Metas de Ahorro */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">Tus Metas</Card.Title>
          {console.log(
            "DEBUG: SavingGoalsPage - Estado de goals ANTES del map:",
            goals
          )}
          {goals.length === 0 ? (
            <p className="text-center">
              No tienes metas de ahorro. ¡Crea una para empezar a ahorrar!
            </p>
          ) : (
            <ListGroup variant="flush">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isOverdue =
                  goal.dueDate &&
                  new Date(goal.dueDate) < new Date() &&
                  !goal.isCompleted;

                return (
                  <ListGroup.Item
                    key={goal._id}
                    className="mb-3 p-3 position-relative"
                  >
                    {goal.isCompleted && (
                      <span className="badge bg-success position-absolute top-0 end-0 mt-2 me-2">
                        ¡Completada!
                      </span>
                    )}
                    <h4 className="mb-2">{goal.name}</h4>
                    <p className="mb-1">
                      Objetivo:{" "}
                      <strong>{goal.targetAmount.toFixed(2)} USD</strong> |
                      Actual:{" "}
                      <strong>{goal.currentAmount.toFixed(2)} USD</strong>
                    </p>
                    <ProgressBar
                      now={Math.min(100, progress)}
                      variant={goal.isCompleted ? "success" : "primary"}
                      className="mb-2"
                      style={{ height: "15px" }}
                    />
                    <p
                      className="mb-1 text-muted"
                      style={{ fontSize: "0.9em" }}
                    >
                      Progreso: {progress.toFixed(2)}%
                      {goal.dueDate && (
                        <span
                          className={`ms-3 ${isOverdue ? "text-danger" : ""}`}
                        >
                          Fecha Límite:{" "}
                          {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {goal.description && (
                      <p
                        className="text-muted fst-italic mb-2"
                        style={{ fontSize: "0.85em" }}
                      >
                        {goal.description}
                      </p>
                    )}

                    <div className="d-flex align-items-center mt-3">
                      <Form.Control
                        type="number"
                        placeholder="Añadir monto"
                        value={addAmount}
                        onChange={(e) => {
                          setAddAmount(e.target.value);
                          setGoalFormErrors({
                            ...goalFormErrors,
                            addAmount: "",
                          }); // Limpiar error
                        }}
                        isInvalid={!!goalFormErrors.addAmount} // Marcar inválido
                        step="0.01"
                        min="0.01"
                        className="w-auto me-2"
                      />
                      <Form.Control.Feedback type="invalid">
                        {goalFormErrors.addAmount}
                      </Form.Control.Feedback>
                      <Button
                        variant="info"
                        className="me-auto"
                        onClick={() =>
                          handleAddAmountToGoal(goal._id, goal.currentAmount)
                        }
                      >
                        Añadir
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => startEditGoal(goal)}
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        <FaTrashAlt /> Eliminar
                      </Button>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SavingGoalsPage;
