// frontend/src/pages/TransactionsPage.jsx
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
} from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const TransactionsPage = ({ token }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Estados para el formulario de AÑADIR/EDITAR TRANSACCIÓN
  const [transactionType, setTransactionType] = useState("Gasto");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Funciones de Carga de Datos (Cuentas, Transacciones, Categorías)
  const fetchAccounts = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common["x-auth-token"] = token;
      } else {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/api/accounts");
      setAccounts(res.data);
      if (res.data.length > 0 && !selectedAccountId && !editingTransaction) {
        setSelectedAccountId(res.data[0]._id);
      } else if (res.data.length === 0) {
        setSelectedAccountId("");
      }
    } catch (err) {
      console.error(
        "Error al cargar cuentas:",
        err.response?.data?.msg || err.message
      );
      toast.error(
        `Error al cargar cuentas: ${err.response?.data?.msg || "Error de red"}`
      );
    }
  }, [token, selectedAccountId, editingTransaction]);

  const fetchTransactions = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common["x-auth-token"] = token;
      } else {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/api/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(
        "Error al cargar transacciones:",
        err.response?.data?.msg || err.message
      );
      toast.error(
        `Error al cargar transacciones: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common["x-auth-token"] = token;
      } else {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(
        "Error al cargar categorías:",
        err.response?.data?.msg || err.message
      );
      toast.error(
        `Error al cargar categorías: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchCategories();
  }, [fetchAccounts, fetchTransactions, fetchCategories]);

  // Funciones para TRANSACCIONES
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        account: selectedAccountId,
        type: transactionType,
        category: transactionCategory,
        description: transactionDescription,
        amount: parseFloat(transactionAmount),
        date: transactionDate,
      };
      if (transactionType === "Transferencia") {
        transactionData.toAccount = toAccountId;
      }

      await axios.post(
        "${process.env.REACT_APP_BACKEND_URL}/api/transactions",
        transactionData
      );
      toast.success("Transacción registrada exitosamente!");
      fetchAccounts(); // Recargar cuentas para actualizar saldos
      fetchTransactions(); // Recargar transacciones para ver la nueva
      // Limpiar formulario de transacción
      setTransactionAmount("");
      setTransactionCategory("");
      setTransactionDescription("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setTransactionType("Gasto");
      setToAccountId("");
    } catch (err) {
      toast.error(
        `Error al registrar transacción: ${
          err.response?.data?.msg || err.message
        }`
      );
    }
  };

  const startEditTransaction = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
    setTransactionType(transaction.type);
    setTransactionAmount(transaction.amount);
    setTransactionCategory(transaction.category || "");
    setTransactionDescription(transaction.description || "");
    setTransactionDate(new Date(transaction.date).toISOString().slice(0, 10));
    setSelectedAccountId(transaction.account?._id);
    setToAccountId(
      transaction.type === "Transferencia" && transaction.toAccount
        ? transaction.toAccount._id
        : ""
    );
  };

  const cancelEditTransaction = () => {
    setEditingTransaction(null);
    setTransactionAmount("");
    setTransactionCategory("");
    setTransactionDescription("");
    setTransactionDate(new Date().toISOString().slice(0, 10));
    setTransactionType("Gasto");
    setToAccountId("");
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      const updatedTransactionData = {
        account: selectedAccountId,
        type: transactionType,
        category: transactionCategory,
        description: transactionDescription,
        amount: parseFloat(transactionAmount),
        date: transactionDate,
        toAccount:
          transactionType === "Transferencia" ? toAccountId : undefined,
      };

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/transactions/${editingTransaction._id}`,
        updatedTransactionData
      );
      toast.success("Transacción actualizada exitosamente!");
      fetchAccounts();
      fetchTransactions();
      cancelEditTransaction();
    } catch (err) {
      toast.error(
        `Error al actualizar transacción: ${
          err.response?.data?.msg || err.message
        }`
      );
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta transacción?")
    ) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/transactions/${id}`);
        toast.success("Transacción eliminada y saldos actualizados!");
        fetchAccounts();
        fetchTransactions();
      } catch (err) {
        toast.error(
          `Error al eliminar transacción: ${
            err.response?.data?.msg || err.message
          }`
        );
      }
    }
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Gestión de Transacciones</h2>

      {/* Formulario para Añadir/Editar Transacción */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingTransaction
              ? "Editar Transacción"
              : "Añadir Nueva Transacción"}
          </Card.Title>
          <Form
            onSubmit={
              editingTransaction
                ? handleUpdateTransaction
                : handleAddTransaction
            }
          >
            <Row className="mb-3 g-3">
              <Col xs={12} md={4}>
                {" "}
                {/* xs={12} para ocupar todo el ancho en móviles */}
                <Form.Group
                  controlId="transactionType"
                  className="mb-3 mb-md-0"
                >
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    value={transactionType}
                    onChange={(e) => {
                      setTransactionType(e.target.value);
                      setTransactionCategory("");
                      if (e.target.value !== "Transferencia")
                        setToAccountId("");
                    }}
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Transferencia">Transferencia</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group
                  controlId="selectedAccountId"
                  className="mb-3 mb-md-0"
                >
                  <Form.Label>Cuenta:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                    disabled={accounts.length === 0}
                  >
                    <option value="">Selecciona una cuenta</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name} ({account.balance.toFixed(2)}{" "}
                        {account.currency})
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              {transactionType === "Transferencia" && (
                <Col xs={12} md={4}>
                  <Form.Group controlId="toAccountId" className="mb-3 mb-md-0">
                    <Form.Label>Cuenta Destino:</Form.Label>
                    <Form.Control
                      as="select"
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      required
                      disabled={
                        accounts.length === 0 || selectedAccountId === ""
                      }
                    >
                      <option value="">Selecciona cuenta destino</option>
                      {accounts
                        .filter((acc) => acc._id !== selectedAccountId)
                        .map((account) => (
                          <option key={account._id} value={account._id}>
                            {account.name}
                          </option>
                        ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Row className="mb-3 g-3">
              <Col xs={12} md={4}>
                <Form.Group
                  controlId="transactionAmount"
                  className="mb-3 mb-md-0"
                >
                  <Form.Label>Monto:</Form.Label>
                  <Form.Control
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              {transactionType !== "Transferencia" && (
                <Col xs={12} md={4}>
                  <Form.Group
                    controlId="transactionCategory"
                    className="mb-3 mb-md-0"
                  >
                    <Form.Label>Categoría:</Form.Label>
                    <Form.Control
                      as="select"
                      value={transactionCategory}
                      onChange={(e) => setTransactionCategory(e.target.value)}
                      required={transactionType !== "Transferencia"}
                    >
                      <option value="">Selecciona una categoría</option>
                      {filteredCategories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              )}
              <Col xs={12} md={4}>
                <Form.Group
                  controlId="transactionDate"
                  className="mb-3 mb-md-0"
                >
                  <Form.Label>Fecha:</Form.Label>
                  <Form.Control
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                  />
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
              <Button
                variant={editingTransaction ? "warning" : "primary"}
                type="submit"
              >
                {editingTransaction ? "Guardar Cambios" : "Añadir Transacción"}
              </Button>
              {editingTransaction && (
                <Button variant="secondary" onClick={cancelEditTransaction}>
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Listado de Transacciones */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            Historial de Transacciones
          </Card.Title>
          {transactions.length === 0 ? (
            <p className="text-center">
              No tienes transacciones registradas. ¡Añade una para empezar!
            </p>
          ) : (
            <ListGroup variant="flush">
              {transactions.map((trans) => (
                <ListGroup.Item
                  key={trans._id}
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2"
                >
                  <div className="mb-2 mb-md-0">
                    <strong
                      className={
                        trans.type === "Ingreso"
                          ? "text-success"
                          : trans.type === "Gasto"
                          ? "text-danger"
                          : "text-primary"
                      }
                    >
                      {trans.type}: {trans.amount.toFixed(2)}{" "}
                      {trans.account?.currency || "USD"}
                    </strong>
                    <div className="text-muted" style={{ fontSize: "0.85em" }}>
                      {trans.description || trans.category || "Sin descripción"}
                    </div>
                  </div>
                  <small className="text-muted">
                    {new Date(trans.date).toLocaleDateString()}
                  </small>
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    {" "}
                    {/* mt-2 para móvil, mt-md-0 para med+ */}
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => startEditTransaction(trans)}
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTransaction(trans._id)}
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

export default TransactionsPage;
