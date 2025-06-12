import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Container, Row, Col, Card, Form, Button, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const RemindersPage = () => {
  const { token } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', remindAt: '' });
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchReminders = async () => {
    try {
      if (!token) return;
      const res = await api.get(`/reminders`);
      setReminders(res.data);
    } catch (err) {
      toast.error(`Error al cargar recordatorios: ${err.response?.data?.msg || err.message}`);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [token]);

  useEffect(() => {
    const today = new Date();
    reminders.forEach((r) => {
      const date = new Date(r.remindAt);
      const diff = (date - today) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= 1) {
        toast.info(`Recordatorio: ${r.title} (${date.toLocaleDateString()})`, { icon: <FaBell /> });
      }
    });
  }, [reminders]);

  const validate = (data) => {
    const errs = {};
    if (!data.title) errs.title = 'Título requerido';
    if (!data.remindAt) errs.remindAt = 'Fecha requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = editing || form;
    if (!validate(data)) return;
    try {
      if (editing) {
        await api.put(`/reminders/${editing._id}`, data);
        toast.success('Recordatorio actualizado');
      } else {
        await api.post(`/reminders`, data);
        toast.success('Recordatorio creado');
      }
      setForm({ title: '', message: '', remindAt: '' });
      setEditing(null);
      setErrors({});
      fetchReminders();
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar recordatorio?')) {
      try {
        await api.delete(`/reminders/${id}`);
        toast.success('Recordatorio eliminado');
        fetchReminders();
      } catch (err) {
        toast.error(`Error: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  const startEdit = (rem) => {
    setEditing({
      ...rem,
      remindAt: rem.remindAt ? new Date(rem.remindAt).toISOString().slice(0, 10) : ''
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ title: '', message: '', remindAt: '' });
    setErrors({});
  };

  const handleChange = (field, value) => {
    if (editing) {
      setEditing({ ...editing, [field]: value });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center page-title">Recordatorios</h2>
      <Row>
        <Col md={5} lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="mb-3 text-center">
                {editing ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    value={editing ? editing.title : form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    isInvalid={!!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="message">
                  <Form.Label>Mensaje</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editing ? editing.message : form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="remindAt">
                  <Form.Label>Recordar el</Form.Label>
                  <Form.Control
                    type="date"
                    value={editing ? editing.remindAt : form.remindAt}
                    onChange={(e) => handleChange('remindAt', e.target.value)}
                    isInvalid={!!errors.remindAt}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.remindAt}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" className="fancy-btn">
                    {editing ? 'Actualizar' : 'Agregar'}
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
              <Card.Title className="mb-3 text-center">Tus Recordatorios</Card.Title>
              {reminders.length === 0 ? (
                <p className="text-center text-muted">Sin recordatorios.</p>
              ) : (
                <ListGroup variant="flush">
                  {reminders.map((r) => (
                    <ListGroup.Item
                      key={r._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{r.title}</strong>
                        <div className="text-muted" style={{ fontSize: '0.85em' }}>
                          {new Date(r.remindAt).toLocaleDateString()}
                        </div>
                        {r.message && <div style={{ fontSize: '0.9em' }}>{r.message}</div>}
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => startEdit(r)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(r._id)}
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

export default RemindersPage;

