// frontend/src/components/Layout.jsx
import React, { useState, useEffect } from "react";
// Cambiado: Se importa useHistory en lugar de useNavigate
import { Link, useHistory, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Offcanvas, Button } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaCreditCard,
  FaListAlt,
  FaChartBar,
  FaBullseye,
  FaCog,
  FaCalculator,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaQuestionCircle,
  FaBookOpen,
} from "react-icons/fa";

const Layout = ({ children, isAuthenticated, user, onLogout }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const history = useHistory(); // Cambiado: Se usa useHistory
  const location = useLocation();

  const handleLogoutInternal = () => {
    if (onLogout) {
      onLogout();
    }
    // No es necesario history.push('/login') aquí si App.js ya controla la redirección
    // basada en isAuthenticated.
    setShowOffcanvas(false);
  };

  const handleSelect = (path) => {
    history.push(path); // Cambiado: Se usa history.push()
    setShowOffcanvas(false);
  };

  useEffect(() => {
    setShowOffcanvas(false);
  }, [location]);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Cuentas", path: "/accounts", icon: <FaCreditCard /> },
    { name: "Transacciones", path: "/transactions", icon: <FaListAlt /> },
    { name: "Categorías", path: "/categories", icon: <FaListAlt /> },
    { name: "Reportes", path: "/reports", icon: <FaChartBar /> },
    {
      name: "Presupuestos",
      path: "/budget-calculator",
      icon: <FaCalculator />,
    },
    { name: "Metas de Ahorro", path: "/saving-goals", icon: <FaBullseye /> },
    { name: "Educación Financiera", path: "/educate", icon: <FaBookOpen /> },
    { name: "Configuración", path: "/settings", icon: <FaCog /> },
    { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> },
  ];

  const guestLinks = [
    // Si App.js maneja el renderizado de LoginPage/RegisterPage, estos enlaces podrían no ser necesarios
    // o deberían navegar a rutas que App.js luego redirige o maneja.
    // Por ahora, los dejamos para la navegación dentro del Offcanvas si es visible.
    { name: "Iniciar Sesión", path: "/login", icon: <FaSignInAlt /> },
    { name: "Registrarse", path: "/register", icon: <FaUserPlus /> },
    {
      name: "Presupuestos",
      path: "/budget-calculator",
      icon: <FaCalculator />,
    },
    { name: "Educación Financiera", path: "/educate", icon: <FaBookOpen /> },
    { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> },
  ];

  const activeLinks = isAuthenticated ? navLinks : guestLinks;

  return (
    <>
      <Navbar bg="dark" variant="dark" expand={false} fixed="top">
        <Container fluid>
          <Navbar.Toggle
            aria-controls="offcanvasNavbar"
            onClick={() => setShowOffcanvas(!showOffcanvas)}
          />
          <Navbar.Brand as={Link} to={isAuthenticated ? "/dashboard" : "/"}>
            Gestor de Finanzas
          </Navbar.Brand>
          {isAuthenticated && user && (
            <Navbar.Text className="ms-auto me-3 text-light d-none d-sm-block">
              Hola, {user.firstName || user.email || "Usuario"}
            </Navbar.Text>
          )}
          {isAuthenticated ? (
            <Button
              variant="outline-danger"
              onClick={handleLogoutInternal}
              className="d-none d-sm-block"
            >
              <FaSignOutAlt /> Salir
            </Button>
          ) : (
            // En la versión de App.js que me mostraste, esta sección no se mostraría
            // porque el componente Layout solo se renderiza si isAuthenticated es true.
            // La mantengo por si la lógica de renderizado de App.js cambia.
            <Nav className="ms-auto d-none d-sm-flex flex-row">
              {/* Estos enlaces podrían redirigir a la vista de login/register que maneja App.js */}
              <Button
                variant="outline-light"
                onClick={() => history.push("/login")}
                className="me-2"
              >
                <FaSignInAlt /> Iniciar Sesión
              </Button>
              <Button variant="light" onClick={() => history.push("/register")}>
                <FaUserPlus /> Registrarse
              </Button>
            </Nav>
          )}
        </Container>
      </Navbar>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="start"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        className="bg-dark text-white"
        style={{ width: "280px" }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title id="offcanvasNavbarLabel">Menú</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {isAuthenticated && user && (
            <div className="mb-3 border-bottom pb-3">
              <p className="h5">
                Hola, {user.firstName || user.email || "Usuario"}
              </p>
            </div>
          )}
          <Nav className="flex-column">
            {activeLinks.map((link) => (
              <Nav.Item key={link.name} className="mb-1">
                <Nav.Link
                  onClick={() => handleSelect(link.path)}
                  className={`text-white d-flex align-items-center sidebar-link ${
                    location.pathname === link.path ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-3 icon-container">{link.icon}</span>
                  {link.name}
                </Nav.Link>
              </Nav.Item>
            ))}
            {isAuthenticated && (
              <Nav.Item className="mt-auto pt-3 border-top d-sm-none">
                <Nav.Link
                  onClick={handleLogoutInternal}
                  className="text-danger d-flex align-items-center sidebar-link"
                >
                  <FaSignOutAlt className="me-3 icon-container" />
                  Salir
                </Nav.Link>
              </Nav.Item>
            )}
            {!isAuthenticated && ( // Estos solo se verían si el Offcanvas se muestra cuando no está autenticado
              <>
                <Nav.Item className="mt-auto pt-3 border-top d-sm-none">
                  <Nav.Link
                    onClick={() => handleSelect("/login")}
                    className="text-white d-flex align-items-center sidebar-link"
                  >
                    <FaSignInAlt className="me-3 icon-container" />
                    Iniciar Sesión
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="d-sm-none">
                  <Nav.Link
                    onClick={() => handleSelect("/register")}
                    className="text-white d-flex align-items-center sidebar-link"
                  >
                    <FaUserPlus className="me-3 icon-container" />
                    Registrarse
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="pt-5 mt-4" style={{ flexGrow: 1 }}>
        {" "}
        {/* Añadido flexGrow para el footer */}
        <main>{children}</main>
      </Container>

      <footer className="bg-dark text-white text-center py-3">
        {" "}
        {/* Quitado mt-auto, App.js maneja el flex */}
        <Container>
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Gestor de Finanzas. Todos los
            derechos reservados.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
