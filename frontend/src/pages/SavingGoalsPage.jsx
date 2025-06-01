// frontend/src/pages/SavingGoalsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ListGroup, ProgressBar } from 'react-bootstrap';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SavingGoalsPage = ({ token }) => {
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTargetAmount, setNewGoalTargetAmount] = useState('');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  const fetchSavingGoals = useCallback(async () => {
    try {
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('DEBUG: SavingGoalsPage - Enviando GET a /api/savinggoals...'); // Debug
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/savinggoals`);
      console.log('DEBUG: SavingGoalsPage - Respuesta de /api/savinggoals:', res.data); // Debug
      if (Array.isArray(res.data)) {
        setGoals(res.data);
      } else {
        console.error('DEBUG: SavingGoalsPage - La respuesta de /api/savinggoals NO es un array:', res.data);
        setGoals([]);
        toast.error('Formato de datos de metas de ahorro inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: SavingGoalsPage - Error al cargar metas de ahorro:', err.response?.data || err.message); // Debug
      toast.error(`Error al cargar metas de ahorro: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  useEffect(() => {
    console.log('DEBUG: SavingGoalsPage - Iniciando carga inicial de datos...'); // Debug
    fetchSavingGoals();
  }, [fetchSavingGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      console.log('DEBUG: SavingGoalsPage - Enviando POST a /api/savinggoals...'); // Debug
      const goalData = {
        name: newGoalName,
        targetAmount: parseFloat(newGoalTargetAmount),
        dueDate: newGoalDueDate || undefined,
        description: newGoalDescription,
      };
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/savinggoals`, goalData);
      toast.success('Meta de ahorro creada exitosamente!');
      setNewGoalName('');
      setNewGoalTargetAmount('');
      setNewGoalDueDate('');
      setNewGoalDescription('');
      fetchSavingGoals();
    } catch (err) {
      console.error('DEBUG: SavingGoalsPage - Error al crear meta de ahorro:', err.response?.data || err.message); // Debug
      toast.error(`Error al crear meta de ahorro: ${err.response?.data?.msg || err.message}`);
    }
  };

  const startEditGoal = (goal) => {
    setEditingGoal({
      ...goal,
      dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().slice(0, 10) : '',
    });
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;

    try {
      console.log('DEBUG: SavingGoalsPage - Enviando PUT a /api/savinggoals/:id...'); // Debug
      const updatedGoalData = {
        name: editingGoal.name,
        targetAmount: parseFloat(editingGoal.targetAmount),
        currentAmount: parseFloat(editingGoal.currentAmount),
        dueDate: editingGoal.dueDate || undefined,
        description: editingGoal.description,
        isCompleted: editingGoal.isCompleted,
      };
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/savinggoals/${editingGoal._id}`, updatedGoalData);
      toast.success('Meta de ahorro actualizada exitosamente!');
      setEditingGoal(null);
      fetchSavingGoals();
    } catch (err) {
      console.error('DEBUG: SavingGoalsPage - Error al actualizar meta de ahorro:', err.response?.data || err.message); // Debug
      toast.error(`Error al actualizar meta de ahorro: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleAddAmountToGoal = async (goalId, currentAmount) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Por favor, ingresa un monto válido para añadir.');
      return;
    }
    try {
      console.log('DEBUG: SavingGoalsPage - Añadiendo monto a meta...'); // Debug
      const goalToUpdate = goals.find(g => g._id === goalId);
      if (!goalToUpdate) return;

      const newCurrentAmount = currentAmount + parseFloat(addAmount);
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/savinggoals/${goalId}`, {
        currentAmount: newCurrentAmount,
        isCompleted: newCurrentAmount >= goalToUpdate.targetAmount,
      });
      toast.success(`Monto de ${parseFloat(addAmount).toFixed(2)} añadido a la meta!`);
      setAddAmount('');
      fetchSavingGoals();
    } catch (err) {
      console.error('DEBUG: SavingGoalsPage - Error al añadir monto a meta:', err.response?.data || err.message); // Debug
      toast.error(`Error al añadir monto: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta meta de ahorro?')) {
      try {
        console.log('DEBUG: SavingGoalsPage - Enviando DELETE a /api/savinggoals/:id...'); // Debug
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/savinggoals/${id}`);
        toast.success('Meta de ahorro eliminada exitosamente!');
        fetchSavingGoals();
      } catch (err) {
        console.error('DEBUG: SavingGoalsPage - Error al eliminar meta de ahorro:', err.response?.data || err.message); // Debug
        toast.error(`Error al eliminar meta de ahorro: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Mis Metas de Ahorro</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingGoal ? 'Editar Meta de Ahorro' : 'Crear Nueva Meta'}
          </Card.Title>
          <Form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}>
            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group controlId="goalName">
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingGoal ? editingGoal.name : newGoalName}
                    onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, name: e.target.value }) : setNewGoalName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="goalTargetAmount">
                  <Form.Label>Monto Objetivo:</Form.Label>
                  <Form.Control
                    type="number"
                    value={editingGoal ? editingGoal.targetAmount : newGoalTargetAmount}
                    onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, targetAmount: e.target.value }) : setNewGoalTargetAmount(e.target.value)}
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
                      onChange={(e) => setEditingGoal({ ...editingGoal, currentAmount: e.target.value })}
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
                    onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, dueDate: e.target.value }) : setNewGoalDueDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="goalDescription" className="mb-4">
              <Form.Label>Descripción (opcional):</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={editingGoal ? editingGoal.description : newGoalDescription}
                onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, description: e.target.value }) : setNewGoalDescription(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant={editingGoal ? 'warning' : 'success'} type="submit">
                {editingGoal ? 'Guardar Cambios' : 'Crear Meta'}
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

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">Tus Metas</Card.Title>
          {console.log('DEBUG: SavingGoalsPage - Estado de goals ANTES del map:', goals)}
          {goals.length === 0 ? (
            <p className="text-center">No tienes metas de ahorro. ¡Crea una para empezar a ahorrar!</p>
          ) : (
            <ListGroup variant="flush">
              {goals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && !goal.isCompleted;

                return (
                  <ListGroup.Item key={goal._id} className="mb-3 p-3 position-relative">
                    {goal.isCompleted && (
                      <span className="badge bg-success position-absolute top-0 end-0 mt-2 me-2">¡Completada!</span>
                    )}
                    <h4 className="mb-2">{goal.name}</h4>
                    <p className="mb-1">
                      Objetivo: <strong>{goal.targetAmount.toFixed(2)} USD</strong> | Actual: <strong>{goal.currentAmount.toFixed(2)} USD</strong>
                    </p>
                    <ProgressBar
                      now={Math.min(100, progress)}
                      variant={goal.isCompleted ? 'success' : 'primary'}
                      className="mb-2"
                      style={{ height: '15px' }}
                    />
                    <p className="mb-1 text-muted" style={{ fontSize: '0.9em' }}>
                      Progreso: {progress.toFixed(2)}%
                      {goal.dueDate && (
                        <span className={`ms-3 ${isOverdue ? 'text-danger' : ''}`}>
                          Fecha Límite: {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {goal.description && <p className="text-muted fst-italic mb-2" style={{ fontSize: '0.85em' }}>{goal.description}</p>}

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
                      <Button variant="info" className="me-auto" onClick={() => handleAddAmountToGoal(goal._id, goal.currentAmount)}>
                        Añadir
                      </Button>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => startEditGoal(goal)}>
                        <FaEdit /> Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteGoal(goal._id)}>
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
