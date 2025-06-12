// frontend/src/pages/SubscriptionsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const SubscriptionsPage = () => {
  const { token } = useContext(AuthContext);
  const [subs, setSubs] = useState([]);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newFrequency, setNewFrequency] = useState("Mensual");
  const [editing, setEditing] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const fetchSubs = useCallback(async () => {
    try {
      if (!token) return;
      const res = await api.get(`/subscriptions`);
      if (Array.isArray(res.data)) setSubs(res.data);
      else {
        setSubs([]);
        toast.error("Formato de datos de suscripciones inesperado.");
      }
    } catch (err) {
      toast.error(
        `Error al cargar suscripciones: ${err.response?.data?.msg || err.message}`
      );
    }
  }, [token]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    subs.forEach((s) => {
      const date = new Date(s.nextBillingDate);
      date.setHours(0, 0, 0, 0);
      const diff = (date - today) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= 3) {
        toast.info(
          `La suscripción "${s.name}" se cobrará pronto (${date.toLocaleDateString()}).`,
          { icon: <FaBell /> }
        );
      }
    });
  }, [subs]);

  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = "El nombre es requerido";
    if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0)
      errors.amount = "Monto inválido";
    if (!data.nextBillingDate) errors.nextBillingDate = "Fecha requerida";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const data = {
      name: newName,
      amount: newAmount,
      nextBillingDate: newDate,
      frequency: newFrequency,
    };
    if (!validateForm(data)) return;
    try {
      await api.post(`/subscriptions`, data);
      toast.success("Suscripción creada");
      setNewName("");
      setNewAmount("");
      setNewDate("");
      setNewFrequency("Mensual");
      setFormErrors({});
      fetchSubs();
    } catch (err) {
      toast.error(
        `Error al crear suscripción: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const startEdit = (sub) => {
    setEditing({
      ...sub,
      nextBillingDate: sub.nextBillingDate
        ? new Date(sub.nextBillingDate).toISOString().slice(0, 10)
        : "",
    });
    setFormErrors({});
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormErrors({});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!validateForm(editing)) return;
    try {
      await api.put(`/subscriptions/${editing._id}`, editing);
      toast.success("Suscripción actualizada");
      setEditing(null);
      fetchSubs();
    } catch (err) {
      toast.error(
        `Error al actualizar: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar suscripción?")) {
      try {
        await api.delete(`/subscriptions/${id}`);
        toast.success("Suscripción eliminada");
        fetchSubs();
      } catch (err) {
        toast.error(
          `Error al eliminar: ${err.response?.data?.msg || err.message}`
        );
      }
    }
  };

  const handleChangeEditing = (field, value) => {
    setEditing({ ...editing, [field]: value });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center page-title">Suscripciones</h2>
      <Row>
        <Col md={5} lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="mb-3 text-center">
                {editing ? "Editar Suscripción" : "Nueva Suscripción"}
              </Card.Title>
              <Form onSubmit={editing ? handleUpdate : handleAdd}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={editing ? editing.name : newName}
                    onChange={(e) =>
                      editing
                        ? handleChangeEditing("name", e.target.value)
                        : setNewName(e.target.value)
                    }
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="amount">
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    type="number"
                    value={editing ? editing.amount : newAmount}
                    onChange={(e) =>
                      editing
                        ? handleChangeEditing("amount", e.target.value)
                        : setNewAmount(e.target.value)
                    }
                    isInvalid={!!formErrors.amount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.amount}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nextBillingDate">
                  <Form.Label>Próximo cobro</Form.Label>
                  <Form.Control
                    type="date"
                    value={editing ? editing.nextBillingDate : newDate}
                    onChange={(e) =>
                      editing
                        ? handleChangeEditing("nextBillingDate", e.target.value)
                        : setNewDate(e.target.value)
                    }
                    isInvalid={!!formErrors.nextBillingDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.nextBillingDate}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="frequency">
                  <Form.Label>Frecuencia</Form.Label>
                  <Form.Control
                    as="select"
                    value={editing ? editing.frequency : newFrequency}
                    onChange={(e) =>
                      editing
                        ? handleChangeEditing("frequency", e.target.value)
                        : setNewFrequency(e.target.value)
                    }
                  >
                    <option>Mensual</option>
                    <option>Anual</option>
                  </Form.Control>
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" className="fancy-btn">
                    {editing ? "Actualizar" : "Agregar"}
                  </Button>
                  {editing && (
                    <Button variant="secondary" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7} lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3 text-center">
                Tus Suscripciones
              </Card.Title>
              {subs.length === 0 ? (
                <p className="text-center text-muted">Sin suscripciones.</p>
              ) : (
                <ListGroup variant="flush">
                  {subs.map((s) => (
                    <ListGroup.Item
                      key={s._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{s.name}</strong>
                        <div className="text-muted" style={{ fontSize: "0.85em" }}>
                          {new Date(s.nextBillingDate).toLocaleDateString()} - $
                          {s.amount.toFixed(2)} ({s.frequency})
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => startEdit(s)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(s._id)}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionsPage;
