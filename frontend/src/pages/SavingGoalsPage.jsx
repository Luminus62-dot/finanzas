// frontend/src/pages/SavingGoalsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // <-- NUEVA LÍNEA: Importar íconos
import { toast } from "react-toastify"; // <-- NUEVA LÍNEA: Importar toast

const SavingGoalsPage = ({ token }) => {
  // <-- ELIMINADO 'message' y 'setMessage' de props
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTargetAmount, setNewGoalTargetAmount] = useState("");
  const [newGoalDueDate, setNewGoalDueDate] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [addAmount, setAddAmount] = useState("");
  // const [message, setMessage] = useState(''); // <-- ELIMINADO

  // Fetch saving goals from backend
  const fetchSavingGoals = useCallback(async () => {
    try {
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo."); // <-- USANDO TOAST
        return;
      }
      axios.defaults.headers.common["x-auth-token"] = token;
      const res = await axios.get("http://localhost:5000/api/savinggoals");
      setGoals(res.data);
      // setMessage(''); // <-- ELIMINADO
    } catch (err) {
      console.error(
        "Error fetching saving goals:",
        err.response?.data?.msg || err.message
      );
      toast.error(
        `Error al cargar metas de ahorro: ${
          err.response?.data?.msg || "Error de red"
        }`
      ); // <-- USANDO TOAST
    }
  }, [token]); // <-- Eliminado 'setMessage' de dependencias

  useEffect(() => {
    fetchSavingGoals();
  }, [fetchSavingGoals]);

  // Handle adding a new saving goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        name: newGoalName,
        targetAmount: parseFloat(newGoalTargetAmount),
        dueDate: newGoalDueDate || undefined,
        description: newGoalDescription,
      };
      await axios.post("http://localhost:5000/api/savinggoals", goalData);
      toast.success("Meta de ahorro creada exitosamente!"); // <-- USANDO TOAST
      setNewGoalName("");
      setNewGoalTargetAmount("");
      setNewGoalDueDate("");
      setNewGoalDescription("");
      fetchSavingGoals();
    } catch (err) {
      toast.error(
        `Error al crear meta de ahorro: ${
          err.response?.data?.msg || err.message
        }`
      ); // <-- USANDO TOAST
    }
  };

  // Start editing an existing goal
  const startEditGoal = (goal) => {
    setEditingGoal({
      ...goal,
      dueDate: goal.dueDate
        ? new Date(goal.dueDate).toISOString().slice(0, 10)
        : "",
    });
  };

  // Cancel editing
  const cancelEditGoal = () => {
    setEditingGoal(null);
  };

  // Handle updating an existing goal
  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;

    try {
      const updatedGoalData = {
        name: editingGoal.name,
        targetAmount: parseFloat(editingGoal.targetAmount),
        currentAmount: parseFloat(editingGoal.currentAmount),
        dueDate: editingGoal.dueDate || undefined,
        description: editingGoal.description,
        isCompleted: editingGoal.isCompleted,
      };
      await axios.put(
        `http://localhost:5000/api/savinggoals/${editingGoal._id}`,
        updatedGoalData
      );
      toast.success("Meta de ahorro actualizada exitosamente!"); // <-- USANDO TOAST
      setEditingGoal(null); // Exit edit mode
      fetchSavingGoals(); // Refresh goals list
    } catch (err) {
      toast.error(
        `Error al actualizar meta de ahorro: ${
          err.response?.data?.msg || err.message
        }`
      ); // <-- USANDO TOAST
    }
  };

  // Handle adding amount to a goal
  const handleAddAmountToGoal = async (goalId, currentAmount) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error("Por favor, ingresa un monto válido para añadir."); // <-- USANDO TOAST
      return;
    }
    try {
      const goalToUpdate = goals.find((g) => g._id === goalId);
      if (!goalToUpdate) return;

      const newCurrentAmount = currentAmount + parseFloat(addAmount);
      await axios.put(`http://localhost:5000/api/savinggoals/${goalId}`, {
        currentAmount: newCurrentAmount,
        isCompleted: newCurrentAmount >= goalToUpdate.targetAmount,
      });
      toast.success(
        `Monto de ${parseFloat(addAmount).toFixed(2)} añadido a la meta!`
      ); // <-- USANDO TOAST
      setAddAmount(""); // Clear add amount input
      fetchSavingGoals(); // Refresh goals list
    } catch (err) {
      toast.error(
        `Error al añadir monto: ${err.response?.data?.msg || err.message}`
      ); // <-- USANDO TOAST
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta meta de ahorro?"
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/savinggoals/${id}`);
        toast.success("Meta de ahorro eliminada exitosamente!"); // <-- USANDO TOAST
        fetchSavingGoals();
      } catch (err) {
        toast.error(
          `Error al eliminar meta de ahorro: ${
            err.response?.data?.msg || err.message
          }`
        ); // <-- USANDO TOAST
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Mis Metas de Ahorro</h2>

      {/* Mensajes de éxito/error - ELIMINADO EL COMPONENTE ALERT */}
      {/* {message && (
        <Alert variant={message.includes('Error') ? 'danger' : 'success'} className="mb-4">
          {message}
        </Alert>
      )} */}

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
                    onChange={(e) =>
                      editingGoal
                        ? setEditingGoal({
                            ...editingGoal,
                            name: e.target.value,
                          })
                        : setNewGoalName(e.target.value)
                    }
                    required
                  />
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
                    onChange={(e) =>
                      editingGoal
                        ? setEditingGoal({
                            ...editingGoal,
                            targetAmount: e.target.value,
                          })
                        : setNewGoalTargetAmount(e.target.value)
                    }
                    required
                    step="0.01"
                    min="0.01"
                  />
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
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          currentAmount: e.target.value,
                        })
                      }
                      step="0.01"
                      min="0"
                    />
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

                    {/* Add amount input and buttons */}
                    <div className="d-flex align-items-center mt-3">
                      <Form.Control
                        type="number"
                        placeholder="Añadir monto"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-auto me-2"
                      />
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
                        <FaEdit /> Editar {/* <-- ÍCONO */}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        <FaTrashAlt /> Eliminar {/* <-- ÍCONO */}
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
