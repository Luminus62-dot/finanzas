// frontend/src/App.js
import React, { useState, useContext } from "react";
import api from "./services/api";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SavingGoalsPage from "./pages/SavingGoalsPage";
import BudgetCalculatorPage from "./pages/BudgetCalculatorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const [registerErrors, setRegisterErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  const { user, token, login, logout, loading } = useContext(AuthContext);
  const isAuthenticated = !!token;

  const validateRegisterForm = () => {
    /* ...sin cambios... */
    const errors = {};
    if (!firstName.trim()) errors.firstName = "El nombre es requerido.";
    if (!lastName.trim()) errors.lastName = "El apellido es requerido.";
    if (!registerEmail) errors.email = "El correo electrónico es requerido.";
    else if (!/\S+@\S+\.\S+/.test(registerEmail))
      errors.email = "El correo electrónico no es válido.";
    if (!registerPassword) errors.password = "La contraseña es requerida.";
    else if (registerPassword.length < 6)
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLoginForm = () => {
    /* ...sin cambios... */
    const errors = {};
    if (!loginEmail) errors.email = "El correo electrónico es requerido.";
    if (!loginPassword) errors.password = "La contraseña es requerida.";
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    /* ...sin cambios... */
    e.preventDefault();
    if (!validateRegisterForm()) return;
    try {
      await api.post(`/auth/register`, {
        username: registerEmail,
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
      });
      toast.success("Registro exitoso. Por favor, inicia sesión.");
      setShowRegisterForm(false);
      setRegisterEmail("");
      setRegisterPassword("");
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setRegisterErrors({});
    } catch (err) {
      toast.error(
        `Error de registro: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    try {
      await login(loginEmail, loginPassword);
      toast.success("Inicio de sesión exitoso.");
      setLoginEmail("");
      setLoginPassword("");
      setLoginErrors({});
    } catch (err) {
      toast.error(
        `Error de inicio de sesión: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("Sesión cerrada.");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <div
        className="App"
        style={{
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {isAuthenticated ? (
          <Layout>
            <Switch>
              <Route
                exact
                path="/"
                render={() => <Redirect to="/dashboard" />}
              />
              <ProtectedRoute path="/dashboard" component={DashboardPage} />
              <ProtectedRoute path="/accounts" component={AccountsPage} />
              <ProtectedRoute path="/transactions" component={TransactionsPage} />
              <ProtectedRoute path="/categories" component={CategoriesPage} />
              <ProtectedRoute path="/saving-goals" component={SavingGoalsPage} />
              <Route
                path="/budget-calculator"
                component={BudgetCalculatorPage}
              />
              <ProtectedRoute path="/reports" component={ReportsPage} />
              <ProtectedRoute path="/settings" component={SettingsPage} />
              <Route path="*" render={() => <Redirect to="/dashboard" />} />
            </Switch>
          </Layout>
        ) : (
          <Container
            className="login-background d-flex flex-column justify-content-center align-items-center"
            style={{
              flexGrow: 1,
              paddingTop: "2rem",
              paddingBottom: "2rem",
            }}
          >
            {/* ... Formulario de Login/Registro sin cambios ... */}
            <Row className="w-100 justify-content-center">
              <Col md={6} lg={5} xl={4}>
                <h1 className="text-center mb-4">Mi Dinero Hoy</h1>
                <Card className="shadow-sm login-card">
                  <Card.Body>
                    {showRegisterForm ? (
                      <>
                        <h2 className="text-center mb-3">Registrarse</h2>
                        <Form onSubmit={handleRegister}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nombre:</Form.Label>
                            <Form.Control
                              type="text"
                              value={firstName}
                              onChange={(e) => {
                                setFirstName(e.target.value);
                                setRegisterErrors({});
                              }}
                              isInvalid={!!registerErrors.firstName}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {registerErrors.firstName}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Apellido:</Form.Label>
                            <Form.Control
                              type="text"
                              value={lastName}
                              onChange={(e) => {
                                setLastName(e.target.value);
                                setRegisterErrors({});
                              }}
                              isInvalid={!!registerErrors.lastName}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {registerErrors.lastName}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Fecha de Nacimiento:</Form.Label>
                            <Form.Control
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => {
                                setDateOfBirth(e.target.value);
                                setRegisterErrors({});
                              }}
                              isInvalid={!!registerErrors.dateOfBirth}
                            />
                            <Form.Control.Feedback type="invalid">
                              {registerErrors.dateOfBirth}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                              type="email"
                              value={registerEmail}
                              onChange={(e) => {
                                setRegisterEmail(e.target.value);
                                setRegisterErrors({});
                              }}
                              isInvalid={!!registerErrors.email}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {registerErrors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label>Contraseña:</Form.Label>
                            <Form.Control
                              type="password"
                              value={registerPassword}
                              onChange={(e) => {
                                setRegisterPassword(e.target.value);
                                setRegisterErrors({});
                              }}
                              isInvalid={!!registerErrors.password}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {registerErrors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <div className="d-grid gap-2">
                            <Button variant="success" type="submit">
                              Registrarme
                            </Button>
                          </div>
                        </Form>
                        <p className="text-center mt-3">
                          ¿Ya tienes una cuenta?{" "}
                          <Button
                            variant="link"
                            onClick={() => setShowRegisterForm(false)}
                          >
                            Inicia Sesión
                          </Button>
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-center mb-3">Iniciar Sesión</h2>
                        <Form onSubmit={handleLogin}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                              type="email"
                              value={loginEmail}
                              onChange={(e) => {
                                setLoginEmail(e.target.value);
                                setLoginErrors({});
                              }}
                              isInvalid={!!loginErrors.email}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {loginErrors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label>Contraseña:</Form.Label>
                            <Form.Control
                              type="password"
                              value={loginPassword}
                              onChange={(e) => {
                                setLoginPassword(e.target.value);
                                setLoginErrors({});
                              }}
                              isInvalid={!!loginErrors.password}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {loginErrors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <div className="d-grid gap-2">
                            <Button variant="primary" type="submit">
                              Iniciar Sesión
                            </Button>
                          </div>
                        </Form>
                        <p className="text-center mt-3">
                          ¿No tienes una cuenta?{" "}
                          <Button
                            variant="link"
                            onClick={() => setShowRegisterForm(true)}
                          >
                            Regístrate aquí
                          </Button>
                        </p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </div>
    </Router>
  );
}

export default App;
