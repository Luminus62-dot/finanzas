// frontend/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios"; // Asegúrate de tener axios instalado
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Estilos para react-toastify

// Importar los componentes de página
import Layout from "./components/Layout"; // Asegúrate que la ruta sea correcta
import DashboardPage from "./pages/DashboardPage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SavingGoalsPage from "./pages/SavingGoalsPage";
import BudgetCalculatorPage from "./pages/BudgetCalculatorPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
// Importa tus otras páginas si las tienes (HelpPage, EducatePage)
// import HelpPage from './pages/HelpPage';
// import EducatePage from './pages/EducatePage';

function App() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  ); // Estado para el usuario
  const [showRegisterForm, setShowRegisterForm] = useState(false); // Estado para mostrar/ocultar formulario de registro

  const [registerErrors, setRegisterErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`; // Usar Bearer token
    } else {
      setIsAuthenticated(false);
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []); // Ejecutar solo una vez al montar

  // Efecto para actualizar axios headers cuando el token cambia
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const validateRegisterForm = () => {
    const errors = {};
    if (!firstName.trim()) {
      errors.firstName = "El nombre es requerido.";
    }
    if (!lastName.trim()) {
      errors.lastName = "El apellido es requerido.";
    }
    // Puedes añadir más validaciones si es necesario (ej. fecha de nacimiento)
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
      // Tu backend en authController.js, registerUser devuelve el usuario creado (sin token)
      // No hace login automático.
      await axios.post(`/api/auth/register`, {
        // Asumiendo que tienes un proxy o usas la URL completa
        username: registerEmail, // o el campo que use tu backend para username si es diferente a email
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
        dateOfBirth, // Asegúrate que el backend espera este campo
      });
      toast.success("Registro exitoso. Por favor, inicia sesión.");
      setShowRegisterForm(false); // Volver al formulario de login
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
    if (!validateLoginForm()) {
      return;
    }
    try {
      const res = await axios.post(`/api/auth/login`, {
        // Asumiendo proxy
        email: loginEmail,
        password: loginPassword,
      });
      toast.success("Inicio de sesión exitoso.");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Guardar el objeto user
      setToken(res.data.token);
      setUser(res.data.user); // Establecer el usuario
      setIsAuthenticated(true);

      setLoginEmail("");
      setLoginPassword("");
      setLoginErrors({});
      // No necesitas Redirect aquí, el render condicional de App se encargará
    } catch (err) {
      toast.error(
        `Error de inicio de sesión: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null); // Limpiar usuario
    setIsAuthenticated(false);
    // axios.defaults.headers.common['Authorization'] = null; // Esto se maneja en el useEffect de token
    toast.info("Sesión cerrada.");
    // No necesitas Redirect aquí, el render condicional de App se encargará
  };

  // Si se está cargando el estado inicial del token, podrías mostrar un loader
  // if (isLoadingInitial) return <p>Cargando...</p>;

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
          <Layout
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            user={user}
          >
            <Switch>
              <Route
                exact
                path="/"
                render={() => <Redirect to="/dashboard" />}
              />
              <Route path="/dashboard" component={DashboardPage} />
              <Route path="/accounts" component={AccountsPage} />
              <Route path="/transactions" component={TransactionsPage} />
              <Route path="/categories" component={CategoriesPage} />
              <Route path="/saving-goals" component={SavingGoalsPage} />
              <Route
                path="/budget-calculator"
                component={BudgetCalculatorPage}
              />
              <Route path="/reports" component={ReportsPage} />
              <Route path="/settings" component={SettingsPage} />
              {/* Añade rutas para HelpPage y EducatePage si existen */}
              {/* <Route path="/help" component={HelpPage} /> */}
              {/* <Route path="/educate" component={EducatePage} /> */}
              <Route path="*" render={() => <Redirect to="/dashboard" />} />
            </Switch>
          </Layout>
        ) : (
          <Container
            className="d-flex flex-column justify-content-center align-items-center"
            style={{
              flexGrow: 1,
              backgroundColor: "#f8f9fa",
              paddingTop: "2rem",
              paddingBottom: "2rem",
            }}
          >
            <Row className="w-100 justify-content-center">
              <Col md={6} lg={5} xl={4}>
                <h1 className="text-center mb-4">Mi Dinero Hoy</h1>
                <Card className="shadow-sm">
                  <Card.Body>
                    {showRegisterForm ? (
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
