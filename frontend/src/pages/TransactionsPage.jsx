// frontend/src/pages/TransactionsPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const TransactionsPage = () => {
  const { token } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Estados para el formulario de AÑADIR/EDITAR TRANSACCIÓN
  const [transactionType, setTransactionType] = useState('Gasto');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionCategory, setTransactionCategory] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);

  // NUEVO ESTADO para errores del formulario de transacciones
  const [transactionFormErrors, setTransactionFormErrors] = useState({});

  // Funciones de Carga de Datos (Cuentas, Transacciones, Categorías)
  const fetchAccounts = useCallback(async () => {
    try {
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      // console.log('DEBUG: TransactionsPage - Enviando GET a /api/accounts...');
      const res = await api.get('/accounts');
      // console.log('DEBUG: TransactionsPage - Respuesta de /api/accounts:', res.data);
      if (Array.isArray(res.data)) {
        setAccounts(res.data);
        // Seleccionar la primera cuenta por defecto si no hay ninguna seleccionada
        if (res.data.length > 0 && !selectedAccountId && !editingTransaction) {
          setSelectedAccountId(res.data[0]._id);
        } else if (res.data.length === 0) {
          setSelectedAccountId('');
        }
      } else {
        console.error('DEBUG: TransactionsPage - La respuesta de /api/accounts NO es un array:', res.data);
        setAccounts([]);
        toast.error('Formato de datos de cuentas inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: TransactionsPage - Error al cargar cuentas:', err.response?.data || err.message);
      toast.error(`Error al cargar cuentas: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token, selectedAccountId, editingTransaction]);

  const fetchTransactions = useCallback(async () => {
    try {
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      // console.log('DEBUG: TransactionsPage - Enviando GET a /api/transactions...');
      const res = await api.get('/transactions');
      // console.log('DEBUG: TransactionsPage - Respuesta de /api/transactions:', res.data);
      if (Array.isArray(res.data)) {
        setTransactions(res.data);
      } else {
        console.error('DEBUG: TransactionsPage - La respuesta de /api/transactions NO es un array:', res.data);
        setTransactions([]);
        toast.error('Formato de datos de transacciones inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: TransactionsPage - Error al cargar transacciones:', err.response?.data || err.message);
      toast.error(`Error al cargar transacciones: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      // console.log('DEBUG: TransactionsPage - Enviando GET a /api/categories...');
      const res = await api.get('/categories');
      // console.log('DEBUG: CategoriesPage - Respuesta de /api/categories:', res.data);
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        console.error('DEBUG: CategoriesPage - La respuesta de /api/categories NO es un array:', res.data);
        setCategories([]);
        toast.error('Formato de datos de categorías inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: CategoriesPage - Error al cargar categorías:', err.response?.data || err.message);
      toast.error(`Error al cargar categorías: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  useEffect(() => {
    // console.log('DEBUG: TransactionsPage - Iniciando carga inicial de datos...');
    fetchAccounts();
    fetchTransactions();
    fetchCategories();
  }, [fetchAccounts, fetchTransactions, fetchCategories]);


  // NUEVA FUNCIÓN DE VALIDACIÓN PARA EL FORMULARIO DE TRANSACCIONES
  const validateTransactionForm = () => {
    const errors = {};

    if (!selectedAccountId) {
      errors.selectedAccount = 'Debes seleccionar una cuenta.';
    }
    if (isNaN(parseFloat(transactionAmount)) || parseFloat(transactionAmount) <= 0) {
      errors.amount = 'El monto debe ser un número positivo.';
    }
    if (!transactionDate) {
      errors.date = 'La fecha es requerida.';
    }

    if (transactionType === 'Transferencia') {
      if (!toAccountId) {
        errors.toAccount = 'La cuenta de destino es requerida para transferencias.';
      }
      if (selectedAccountId === toAccountId && selectedAccountId) { // Asegura que no sea la misma cuenta
        errors.toAccount = 'La cuenta de origen y destino no pueden ser la misma.';
      }
    } else { // Ingreso o Gasto
      if (!transactionCategory) {
        errors.category = 'La categoría es requerida para ingresos/gastos.';
      }
    }

    setTransactionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!validateTransactionForm()) { // Validar antes de enviar
      return;
    }
    try {
      // console.log('DEBUG: TransactionsPage - Enviando POST a /api/transactions...');
      const transactionData = {
        account: selectedAccountId,
        type: transactionType,
        category: transactionType !== 'Transferencia' ? transactionCategory : undefined, // No enviar categoría para transferencias
        description: transactionDescription,
        amount: parseFloat(transactionAmount),
        date: transactionDate
      };
      if (transactionType === 'Transferencia') {
        transactionData.toAccount = toAccountId;
      }

      await api.post('/transactions', transactionData);
      toast.success('Transacción registrada exitosamente!');
      fetchAccounts();
      fetchTransactions();
      // Limpiar formulario y errores
      setTransactionAmount('');
      setTransactionCategory('');
      setTransactionDescription('');
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setTransactionType('Gasto');
      setSelectedAccountId(accounts.length > 0 ? accounts[0]._id : ''); // Vuelve a la primera cuenta
      setToAccountId('');
      setTransactionFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(`Error al registrar transacción: ${err.response?.data?.msg || err.message}`);
    }
  };

  const startEditTransaction = (transaction) => {
    setEditingTransaction({ ...transaction, date: new Date(transaction.date).toISOString().slice(0, 10) });
    setTransactionType(transaction.type);
    setTransactionAmount(transaction.amount);
    setTransactionCategory(transaction.category || '');
    setTransactionDescription(transaction.description || '');
    setTransactionDate(new Date(transaction.date).toISOString().slice(0, 10));
    setSelectedAccountId(transaction.account?._id);
    setToAccountId(transaction.type === 'Transferencia' && transaction.toAccount ? transaction.toAccount._id : '');
    setTransactionFormErrors({}); // Limpiar errores al iniciar edición
  };

  const cancelEditTransaction = () => {
    setEditingTransaction(null);
    setTransactionAmount('');
    setTransactionCategory('');
    setTransactionDescription('');
    setTransactionDate(new Date().toISOString().slice(0, 10));
    setTransactionType('Gasto');
    setSelectedAccountId(accounts.length > 0 ? accounts[0]._id : ''); // Vuelve a la primera cuenta
    setToAccountId('');
    setTransactionFormErrors({}); // Limpiar errores al cancelar
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;
    if (!validateTransactionForm()) { // Validar antes de enviar
        return;
    }

    try {
      // console.log('DEBUG: TransactionsPage - Enviando PUT a /api/transactions/:id...');
      const updatedTransactionData = {
        account: selectedAccountId,
        type: transactionType,
        category: transactionType !== 'Transferencia' ? transactionCategory : undefined,
        description: transactionDescription,
        amount: parseFloat(transactionAmount),
        date: transactionDate,
        toAccount: transactionType === 'Transferencia' ? toAccountId : undefined,
      };

      await api.put(`/transactions/${editingTransaction._id}`, updatedTransactionData);
      toast.success('Transacción actualizada exitosamente!');
      fetchAccounts();
      fetchTransactions();
      cancelEditTransaction();
      setTransactionFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(`Error al actualizar transacción: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        // console.log('DEBUG: TransactionsPage - Enviando DELETE a /api/transactions/:id...');
        await api.delete(`/transactions/${id}`);
        toast.success('Transacción eliminada y saldos actualizados!');
        fetchAccounts();
        fetchTransactions();
      } catch (err) {
        toast.error(`Error al eliminar transacción: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Gestión de Transacciones</h2>

      {/* Formulario para Añadir/Editar Transacción */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingTransaction ? 'Editar Transacción' : 'Añadir Nueva Transacción'}
          </Card.Title>
          <Form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}>
            <Row className="mb-3 g-3">
              <Col xs={12} md={4}>
                <Form.Group controlId="transactionType">
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    value={transactionType}
                    onChange={(e) => {
                      setTransactionType(e.target.value);
                      setTransactionCategory('');
                      if (e.target.value !== 'Transferencia') setToAccountId('');
                      setTransactionFormErrors({}); // Limpiar errores al cambiar tipo
                    }}
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Transferencia">Transferencia</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="selectedAccountId">
                  <Form.Label>Cuenta:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedAccountId}
                    onChange={(e) => {
                      setSelectedAccountId(e.target.value);
                      setTransactionFormErrors({ ...transactionFormErrors, selectedAccount: '' }); // Limpiar error
                    }}
                    isInvalid={!!transactionFormErrors.selectedAccount} // Marcar inválido
                    required
                    disabled={accounts.length === 0}
                  >
                    <option value="">Selecciona una cuenta</option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.name} ({account.balance.toFixed(2)} {account.currency})
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {transactionFormErrors.selectedAccount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {transactionType === 'Transferencia' && (
                <Col xs={12} md={4}>
                  <Form.Group controlId="toAccountId">
                    <Form.Label>Cuenta Destino:</Form.Label>
                    <Form.Control
                      as="select"
                      value={toAccountId}
                      onChange={(e) => {
                        setToAccountId(e.target.value);
                        setTransactionFormErrors({ ...transactionFormErrors, toAccount: '' }); // Limpiar error
                      }}
                      isInvalid={!!transactionFormErrors.toAccount} // Marcar inválido
                      required
                      disabled={accounts.length === 0 || selectedAccountId === ''}
                    >
                      <option value="">Selecciona cuenta destino</option>
                      {accounts.filter(acc => acc._id !== selectedAccountId).map(account => (
                        <option key={account._id} value={account._id}>
                          {account.name}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {transactionFormErrors.toAccount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Row className="mb-3 g-3">
              <Col xs={12} md={4}>
                <Form.Group controlId="transactionAmount">
                  <Form.Label>Monto:</Form.Label>
                  <Form.Control
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => {
                      setTransactionAmount(e.target.value);
                      setTransactionFormErrors({ ...transactionFormErrors, amount: '' }); // Limpiar error
                    }}
                    isInvalid={!!transactionFormErrors.amount} // Marcar inválido
                    required
                    min="0.01"
                    step="0.01"
                  />
                  <Form.Control.Feedback type="invalid">
                    {transactionFormErrors.amount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {transactionType !== 'Transferencia' && (
                <Col xs={12} md={4}>
                  <Form.Group controlId="transactionCategory">
                    <Form.Label>Categoría:</Form.Label>
                    <Form.Control
                      as="select"
                      value={transactionCategory}
                      onChange={(e) => {
                        setTransactionCategory(e.target.value);
                        setTransactionFormErrors({ ...transactionFormErrors, category: '' }); // Limpiar error
                      }}
                      isInvalid={!!transactionFormErrors.category} // Marcar inválido
                      required={transactionType !== 'Transferencia'}
                    >
                      <option value="">Selecciona una categoría</option>
                      {filteredCategories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {transactionFormErrors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col xs={12} md={4}>
                <Form.Group controlId="transactionDate">
                  <Form.Label>Fecha:</Form.Label>
                  <Form.Control
                    type="date"
                    value={transactionDate}
                    onChange={(e) => {
                      setTransactionDate(e.target.value);
                      setTransactionFormErrors({ ...transactionFormErrors, date: '' }); // Limpiar error
                    }}
                    isInvalid={!!transactionFormErrors.date} // Marcar inválido
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {transactionFormErrors.date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="transactionDescription" className="mb-4">
              <Form.Label>Descripción (opcional):</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant={editingTransaction ? 'warning' : 'primary'} type="submit" className="fancy-btn">
                {editingTransaction ? 'Guardar Cambios' : 'Añadir Transacción'}
              </Button>
              {editingTransaction && (
                <Button variant="secondary" onClick={cancelEditTransaction} className="fancy-btn">
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">Historial de Transacciones</Card.Title>
          {transactions.length === 0 ? (
            <p className="text-center">No tienes transacciones registradas. ¡Añade una para empezar!</p>
          ) : (
            <ListGroup variant="flush">
              {transactions.map(trans => (
                <ListGroup.Item key={trans._id} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2">
                  <div className="mb-2 mb-md-0">
                    <strong className={trans.type === 'Ingreso' ? 'text-success' : trans.type === 'Gasto' ? 'text-danger' : 'text-primary'}>
                      {trans.type}: {trans.amount.toFixed(2)} {trans.account?.currency || 'USD'}
                    </strong>
                    <div className="text-muted" style={{ fontSize: '0.85em' }}>
                      {trans.description || trans.category || 'Sin descripción'}
                    </div>
                  </div>
                  <small className="text-muted">{new Date(trans.date).toLocaleDateString()}</small>
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Button variant="info" size="sm" onClick={() => startEditTransaction(trans)} className="fancy-btn">
                      <FaEdit /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteTransaction(trans._id)} className="fancy-btn">
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

export default TransactionsPage;