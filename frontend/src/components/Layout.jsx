// frontend/src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

// Ya no importamos useAuth de AuthContext

// El componente Layout ahora recibe props de App.js
const Layout = ({ children, isAuthenticated, user, onLogout }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutInternal = () => {
    if (onLogout) {
      onLogout(); // Llama a la función handleLogout de App.js
    }
    // No es necesario navegar aquí si App.js ya lo hace o controla la redirección
    setShowOffcanvas(false);
  };

  const handleSelect = (path) => {
    navigate(path);
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
    }, // Usamos la versión corta que preferiste
    { name: "Metas de Ahorro", path: "/saving-goals", icon: <FaBullseye /> },
    { name: "Educación Financiera", path: "/educate", icon: <FaBookOpen /> },
    { name: "Configuración", path: "/settings", icon: <FaCog /> },
    { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> },
  ];

  const guestLinks = [
    { name: "Iniciar Sesión", path: "/login", icon: <FaSignInAlt /> }, // App.js maneja la vista de login
    { name: "Registrarse", path: "/register", icon: <FaUserPlus /> }, // App.js maneja la vista de registro
    {
      name: "Presupuestos",
      path: "/budget-calculator",
      icon: <FaCalculator />,
    },
    { name: "Educación Financiera", path: "/educate", icon: <FaBookOpen /> },
    { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> },
  ];

  // App.js decide si mostrar el Layout o los formularios de login/registro.
  // Aquí, si Layout se renderiza, asumimos que isAuthenticated es true (según la lógica de App.js)
  // pero igual lo usamos para el saludo y el botón de logout.
  // esta lógica interna puede simplificarse si Layout
  // solo se usa cuando isAuthenticated es true.

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
          {isAuthenticated &&
            user && ( // Asumimos que 'user' es un objeto con 'username' o similar
              <Navbar.Text className="ms-auto me-3 text-light d-none d-sm-block">
                {/* Necesitarás asegurarte de que App.js pase un objeto 'user' con la info */}
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
            // Esta parte del Navbar no se mostraría si App.js ya redirige a login
            // Pero la dejamos por si acaso la lógica de App.js cambia.
            <Nav className="ms-auto d-none d-sm-flex flex-row">
              <Nav.Link as={Link} to="/login" className="text-light">
                <FaSignInAlt /> Iniciar Sesión
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="text-light">
                <FaUserPlus /> Registrarse
              </Nav.Link>
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
            {/* Si Layout solo se muestra cuando está autenticado, guestLinks no se usaría aquí */}
            {(isAuthenticated ? navLinks : guestLinks).map((link) => (
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
            {/* Los botones de login/register en el offcanvas para móviles si no está autenticado
                no serían necesarios si App.js maneja esto a nivel superior.
                Considera si esta lógica es necesaria aquí. */}
            {!isAuthenticated && (
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

      <Container fluid className="pt-5 mt-4">
        <main>{children}</main>
      </Container>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <Container>
          <p>
            &copy; {new Date().getFullYear()} Gestor de Finanzas. Todos los
            derechos reservados.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
