// frontend/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

// Importar los componentes de página
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SavingGoalsPage from "./pages/SavingGoalsPage";
import BudgetCalculatorPage from "./pages/BudgetCalculatorPage";
import ReportsPage from "./pages/ReportsPage"; // <-- ¡VERIFICAR ESTA LÍNEA!
import SettingsPage from "./pages/SettingsPage";

function App() {
  // Campos de registro y login (manejados directamente en App.js)
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Estados para errores de validación de formularios
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  // Controla si se muestra el formulario de registro (false = muestra login por defecto)
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Efecto para verificar el token al cargar la aplicación y configurarlo en Axios
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      axios.defaults.headers.common["x-auth-token"] = token;
    } else {
      setIsAuthenticated(false);
      delete axios.defaults.headers.common["x-auth-token"];
    }
  }, [token]);

  // FUNCIONES DE VALIDACIÓN
  const validateRegisterForm = () => {
    const errors = {};
    if (!firstName.trim()) {
      errors.firstName = "El nombre es requerido.";
    }
    if (!lastName.trim()) {
      errors.lastName = "El apellido es requerido.";
    }
    if (!dateOfBirth) {
      errors.dateOfBirth = "La fecha de nacimiento es requerida.";
    }
    if (!registerEmail) {
      errors.email = "El correo electrónico es requerido.";
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      errors.email = "El correo electrónico no es válido.";
    }
    if (!registerPassword) {
      errors.password = "La contraseña es requerida.";
    } else if (registerPassword.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLoginForm = () => {
    const errors = {};
    if (!loginEmail) {
      errors.email = "El correo electrónico es requerido.";
    }
    if (!loginPassword) {
      errors.password = "La contraseña es requerida.";
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) {
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`,
        {
          email: registerEmail,
          password: registerPassword,
          firstName,
          lastName,
          dateOfBirth,
        }
      );
      toast.success("Registro exitoso. ¡Bienvenido! Por favor, inicia sesión.");
      setShowRegisterForm(false);

      setRegisterEmail("");
      setRegisterPassword("");
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setRegisterErrors({});
    } catch (err) {
      toast.error(
        `Error de registro: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) {
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        {
          email: loginEmail,
          password: loginPassword,
        }
      );
      toast.success("Inicio de sesión exitoso.");
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setIsAuthenticated(true);

      setLoginEmail("");
      setLoginPassword("");
      setLoginErrors({});
    } catch (err) {
      toast.error(
        `Error de inicio de sesión: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    toast.info("Sesión cerrada.");
  };

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div
        className="App"
        style={{ fontFamily: "Arial, sans-serif", padding: "0" }}
      >
        {isAuthenticated ? (
          // Si está autenticado, muestra el Layout con las rutas protegidas
          <Layout onLogout={handleLogout}>
            <Switch>
              <Route
                exact
                path="/"
                render={() => <Redirect to="/dashboard" />}
              />
              <Route
                path="/dashboard"
                render={(props) => <DashboardPage {...props} token={token} />}
              />
              <Route
                path="/accounts"
                render={(props) => <AccountsPage {...props} token={token} />}
              />
              <Route
                path="/transactions"
                render={(props) => (
                  <TransactionsPage {...props} token={token} />
                )}
              />
              <Route
                path="/categories"
                render={(props) => <CategoriesPage {...props} token={token} />}
              />
              <Route
                path="/saving-goals"
                render={(props) => <SavingGoalsPage {...props} token={token} />}
              />
              <Route
                path="/budget-calculator"
                render={(props) => <BudgetCalculatorPage {...props} />}
              />
              <Route
                path="/reports"
                render={(props) => <ReportsPage {...props} token={token} />}
              />{" "}
              {/* <-- ¡VERIFICAR ESTA LÍNEA! */}
              <Route
                path="/settings"
                render={(props) => <SettingsPage {...props} token={token} />}
              />
              <Route path="*" render={() => <Redirect to="/dashboard" />} />
            </Switch>
          </Layout>
        ) : (
          // Si no está autenticado, muestra el formulario de login o registro
          <Container
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
          >
            <Row className="w-100">
              <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                <h1 className="text-center mb-4">Mi Dinero Hoy</h1>
                <Card className="shadow-sm">
                  <Card.Body>
                    {showRegisterForm ? (
                      // FORMULARIO DE REGISTRO
                      <>
                        <h2 className="text-center mb-3">Registrarse</h2>
                        <Form onSubmit={handleRegister}>
                          <Form.Group
                            className="mb-3"
                            controlId="formFirstName"
                          >
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
                          <Form.Group className="mb-3" controlId="formLastName">
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
                          <Form.Group
                            className="mb-3"
                            controlId="formDateOfBirth"
                          >
                            <Form.Label>Fecha de Nacimiento:</Form.Label>
                            <Form.Control
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => {
                                setDateOfBirth(e.target.value);
                                setRegisterErrors({});
                              }}
                              isInvalid={!!registerErrors.dateOfBirth}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {registerErrors.dateOfBirth}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            className="mb-3"
                            controlId="formRegisterEmail"
                          >
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
                          <Form.Group
                            className="mb-4"
                            controlId="formRegisterPassword"
                          >
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
                      // FORMULARIO DE LOGIN (DEFAULT)
                      <>
                        <h2 className="text-center mb-3">Iniciar Sesión</h2>
                        <Form onSubmit={handleLogin}>
                          <Form.Group
                            className="mb-3"
                            controlId="formLoginEmail"
                          >
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
                          <Form.Group
                            className="mb-4"
                            controlId="formLoginPassword"
                          >
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
