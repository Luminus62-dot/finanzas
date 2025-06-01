// frontend/src/pages/AccountsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap'; // Importar Alert
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AccountsPage = ({ token }) => {
  // Asegúrate de que accounts se inicialice como un array vacío
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Cuenta Bancaria');
  const [newAccountBalance, setNewAccountBalance] = useState(0);
  const [newAccountCurrency, setNewAccountCurrency] = useState('USD');
  const [editingAccount, setEditingAccount] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
      } else {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      console.log('DEBUG: AccountsPage - Enviando GET a /api/accounts...'); // Debug 1
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/accounts`);
      console.log('DEBUG: AccountsPage - Respuesta de /api/accounts:', res.data); // Debug 2: CRÍTICO
      // Asegúrate de que res.data es un array
      if (Array.isArray(res.data)) {
        setAccounts(res.data);
      } else {
        console.error('DEBUG: AccountsPage - La respuesta de /api/accounts NO es un array:', res.data);
        setAccounts([]); // Asegurarse de que sea un array vacío para evitar errores
        toast.error('Formato de datos de cuentas inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: AccountsPage - Error al cargar cuentas:', err.response?.data || err.message); // Debug 3
      toast.error(`Error al cargar cuentas: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/accounts`, {
        name: newAccountName,
        type: newAccountType,
        balance: newAccountBalance,
        currency: newAccountCurrency
      });
      fetchAccounts();
      toast.success('Cuenta creada exitosamente!');
      setNewAccountName('');
      setNewAccountType('Cuenta Bancaria');
      setNewAccountBalance(0);
      setNewAccountCurrency('USD');
    } catch (err) {
      toast.error(`Error al crear cuenta: ${err.response?.data?.msg || err.message}`);
    }
  };

  const startEditAccount = (account) => {
    setEditingAccount({ ...account });
  };

  const cancelEditAccount = () => {
    setEditingAccount(null);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/accounts/${editingAccount._id}`, {
        name: editingAccount.name,
        type: editingAccount.type,
        balance: editingAccount.balance,
        currency: editingAccount.currency
      });
      fetchAccounts();
      toast.success('Cuenta actualizada exitosamente!');
      setEditingAccount(null);
    } catch (err) {
      toast.error(`Error al actualizar cuenta: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta? Todas las transacciones asociadas se perderán.')) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/accounts/${id}`);
        fetchAccounts();
        toast.success('Cuenta eliminada exitosamente!');
      } catch (err) {
        toast.error(`Error al eliminar cuenta: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Gestión de Cuentas</h2>

      {/* Formulario para Añadir/Editar Cuenta */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingAccount ? 'Editar Cuenta' : 'Añadir Nueva Cuenta'}
          </Card.Title>
          <Form onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}>
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="accountName" className="mb-3 mb-md-0">
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingAccount ? editingAccount.name : newAccountName}
                    onChange={(e) => editingAccount ? setEditingAccount({ ...editingAccount, name: e.target.value }) : setNewAccountName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="accountType" className="mb-3 mb-md-0">
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    value={editingAccount ? editingAccount.type : newAccountType}
                    onChange={(e) => editingAccount ? setEditingAccount({ ...editingAccount, type: e.target.value }) : setNewAccountType(e.target.value)}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Cuenta Bancaria">Cuenta Bancaria</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Ahorros">Ahorros</option>
                    <option value="Inversión">Inversión</option>
                    <option value="Otro">Otro</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col xs={12} md={6}>
                <Form.Group controlId="accountBalance" className="mb-3 mb-md-0">
                  <Form.Label>Saldo Inicial:</Form.Label>
                  <Form.Control
                    type="number"
                    value={editingAccount ? editingAccount.balance : newAccountBalance}
                    onChange={(e) => editingAccount ? setEditingAccount({ ...editingAccount, balance: parseFloat(e.target.value) }) : setNewAccountBalance(parseFloat(e.target.value))}
                    required
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="accountCurrency" className="mb-3 mb-md-0">
                  <Form.Label>Moneda:</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingAccount ? editingAccount.currency : newAccountCurrency}
                    onChange={(e) => editingAccount ? setEditingAccount({ ...editingAccount, currency: e.target.value }) : setNewAccountCurrency(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-grid gap-2">
              <Button variant={editingAccount ? 'warning' : 'success'} type="submit">
                {editingAccount ? 'Guardar Cambios' : 'Añadir Cuenta'}
              </Button>
              {editingAccount && (
                <Button variant="secondary" onClick={cancelEditAccount}>
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Listado de Cuentas */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">Tus Cuentas</Card.Title>
          {console.log('DEBUG: AccountsPage - Estado de accounts ANTES del map:', accounts)} {/* Debug 4: CRÍTICO */}
          {accounts.length === 0 ? (
            <p className="text-center">No tienes cuentas añadidas. ¡Añade una para empezar!</p>
          ) : (
            <ListGroup variant="flush">
              {accounts.map(account => ( // <-- Aquí es donde ocurre el error
                <ListGroup.Item key={account._id} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                  <div className="mb-2 mb-md-0">
                    <strong>{account.name}</strong> ({account.type}) - Saldo: {account.balance.toFixed(2)} {account.currency}
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="info" size="sm" onClick={() => startEditAccount(account)}>
                      <FaEdit /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteAccount(account._id)}>
                      <FaTrashAlt /> Eliminar
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountsPage;
