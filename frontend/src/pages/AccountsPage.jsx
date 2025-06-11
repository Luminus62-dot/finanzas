// frontend/src/pages/AccountsPage.jsx
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
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const AccountsPage = () => {
  const { token } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("Cuenta Bancaria");
  const [newAccountBalance, setNewAccountBalance] = useState(0);
  const [newAccountCurrency, setNewAccountCurrency] = useState("USD");
  const [editingAccount, setEditingAccount] = useState(null);

  // NUEVO ESTADO para errores del formulario de cuentas
  const [accountFormErrors, setAccountFormErrors] = useState({});

  const fetchAccounts = useCallback(async () => {
    try {
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      const res = await api.get(`/accounts`);
      if (Array.isArray(res.data)) {
        setAccounts(res.data);
      } else {
        console.error(
          "DEBUG: AccountsPage - La respuesta de /api/accounts NO es un array:",
          res.data
        );
        setAccounts([]);
        toast.error("Formato de datos de cuentas inesperado.");
      }
    } catch (err) {
      console.error(
        "DEBUG: AccountsPage - Error al cargar cuentas:",
        err.response?.data || err.message
      );
      toast.error(
        `Error al cargar cuentas: ${err.response?.data?.msg || "Error de red"}`
      );
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // NUEVA FUNCIÓN DE VALIDACIÓN PARA EL FORMULARIO DE CUENTAS
  const validateAccountForm = (isEditing = false) => {
    const errors = {};
    const data = isEditing
      ? editingAccount
      : {
          name: newAccountName,
          balance: newAccountBalance,
          currency: newAccountCurrency,
        };

    if (!data.name || data.name.trim() === "") {
      errors.name = "El nombre de la cuenta es requerido.";
    }
    if (isNaN(parseFloat(data.balance)) || parseFloat(data.balance) < 0) {
      // Permitir 0, pero no negativo
      errors.balance = "El saldo debe ser un número positivo o cero.";
    }
    if (!data.currency || data.currency.trim() === "") {
      errors.currency = "La moneda es requerida.";
    }

    setAccountFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!validateAccountForm(false)) {
      // Validar para añadir
      return;
    }
    try {
      await api.post(`/accounts`, {
        name: newAccountName,
        type: newAccountType,
        balance: newAccountBalance,
        currency: newAccountCurrency,
      });
      fetchAccounts();
      toast.success("Cuenta creada exitosamente!");
      setNewAccountName("");
      setNewAccountType("Cuenta Bancaria");
      setNewAccountBalance(0);
      setNewAccountCurrency("USD");
      setAccountFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(
        `Error al crear cuenta: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const startEditAccount = (account) => {
    setEditingAccount({ ...account });
    setAccountFormErrors({}); // Limpiar errores al iniciar edición
  };

  const cancelEditAccount = () => {
    setEditingAccount(null);
    setAccountFormErrors({}); // Limpiar errores al cancelar
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!validateAccountForm(true)) {
      // Validar para editar
      return;
    }

    try {
      await api.put(`/accounts/${editingAccount._id}`, {
        name: editingAccount.name,
        type: editingAccount.type,
        balance: editingAccount.balance,
        currency: editingAccount.currency,
      });
      fetchAccounts();
      toast.success("Cuenta actualizada exitosamente!");
      setEditingAccount(null);
      setAccountFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(
        `Error al actualizar cuenta: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const handleDeleteAccount = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta cuenta? Todas las transacciones asociadas se perderán."
      )
    ) {
      try {
        await api.delete(`/accounts/${id}`);
        fetchAccounts();
        toast.success("Cuenta eliminada exitosamente!");
      } catch (err) {
        toast.error(
          `Error al eliminar cuenta: ${err.response?.data?.msg || err.message}`
        );
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center page-title">Gestión de Cuentas</h2>

      {/* Formulario para Añadir/Editar Cuenta */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingAccount ? "Editar Cuenta" : "Añadir Nueva Cuenta"}
          </Card.Title>
          <Form
            onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}
          >
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="accountName" className="mb-3 mb-md-0">
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      editingAccount ? editingAccount.name : newAccountName
                    }
                    onChange={(e) => {
                      if (editingAccount) {
                        setEditingAccount({
                          ...editingAccount,
                          name: e.target.value,
                        });
                      } else {
                        setNewAccountName(e.target.value);
                      }
                      setAccountFormErrors({ ...accountFormErrors, name: "" }); // Limpiar error al escribir
                    }}
                    isInvalid={!!accountFormErrors.name} // Marcar como inválido
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {accountFormErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="accountType" className="mb-3 mb-md-0">
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    value={
                      editingAccount ? editingAccount.type : newAccountType
                    }
                    onChange={(e) => {
                      if (editingAccount) {
                        setEditingAccount({
                          ...editingAccount,
                          type: e.target.value,
                        });
                      } else {
                        setNewAccountType(e.target.value);
                      }
                    }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Cuenta Bancaria">Cuenta Bancaria</option>
                    <option value="Tarjeta de Crédito">
                      Tarjeta de Crédito
                    </option>
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
                    value={
                      editingAccount
                        ? editingAccount.balance
                        : newAccountBalance
                    }
                    onChange={(e) => {
                      if (editingAccount) {
                        setEditingAccount({
                          ...editingAccount,
                          balance: parseFloat(e.target.value),
                        });
                      } else {
                        setNewAccountBalance(parseFloat(e.target.value));
                      }
                      setAccountFormErrors({
                        ...accountFormErrors,
                        balance: "",
                      }); // Limpiar error
                    }}
                    isInvalid={!!accountFormErrors.balance} // Marcar como inválido
                    required
                    step="0.01"
                  />
                  <Form.Control.Feedback type="invalid">
                    {accountFormErrors.balance}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group
                  controlId="accountCurrency"
                  className="mb-3 mb-md-0"
                >
                  <Form.Label>Moneda:</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      editingAccount
                        ? editingAccount.currency
                        : newAccountCurrency
                    }
                    onChange={(e) => {
                      if (editingAccount) {
                        setEditingAccount({
                          ...editingAccount,
                          currency: e.target.value,
                        });
                      } else {
                        setNewAccountCurrency(e.target.value);
                      }
                      setAccountFormErrors({
                        ...accountFormErrors,
                        currency: "",
                      }); // Limpiar error
                    }}
                    isInvalid={!!accountFormErrors.currency} // Marcar como inválido
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {accountFormErrors.currency}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-grid gap-2">
              <Button
                variant={editingAccount ? "warning" : "success"}
                type="submit"
                className="fancy-btn"
              >
                {editingAccount ? "Guardar Cambios" : "Añadir Cuenta"}
              </Button>
              {editingAccount && (
                <Button variant="secondary" onClick={cancelEditAccount} className="fancy-btn">
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
          {accounts.length === 0 ? (
            <p className="text-center">
              No tienes cuentas añadidas. ¡Añade una para empezar!
            </p>
          ) : (
            <ListGroup variant="flush">
              {accounts.map((account) => (
                <ListGroup.Item
                  key={account._id}
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                >
                  <div className="mb-2 mb-md-0">
                    <strong>{account.name}</strong> ({account.type}) - Saldo:{" "}
                    {account.balance.toFixed(2)} {account.currency}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => startEditAccount(account)}
                      className="fancy-btn"
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAccount(account._id)}
                      className="fancy-btn"
                    >
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
