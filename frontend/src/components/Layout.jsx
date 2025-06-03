// frontend/src/components/Layout.jsx
import React, { useState, useEffect } from "react";
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
  const history = useHistory();
  const location = useLocation();

  const handleLogoutInternal = () => {
    if (onLogout) onLogout();
    setShowOffcanvas(false);
  };

  const handleSelect = (path) => {
    history.push(path);
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
    // { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> }, // Comentado si no tienes la página
  ];

  const guestLinks = [
    { name: "Iniciar Sesión", path: "/login", icon: <FaSignInAlt /> },
    { name: "Registrarse", path: "/register", icon: <FaUserPlus /> },
    {
      name: "Presupuestos",
      path: "/budget-calculator",
      icon: <FaCalculator />,
    },
    { name: "Educación Financiera", path: "/educate", icon: <FaBookOpen /> },
    // { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> }, // Comentado si no tienes la página
  ];

  // Si Layout solo se renderiza cuando isAuthenticated es true (según App.js),
  // activeLinks siempre será navLinks.
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
          {isAuthenticated && ( // El botón de Salir solo si está autenticado
            <Button
              variant="outline-danger"
              onClick={handleLogoutInternal}
              className="d-none d-sm-block"
            >
              <FaSignOutAlt /> Salir
            </Button>
          )}
          {/* Los botones de Login/Register en la navbar principal no son necesarios si App.js maneja esto */}
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
        <Offcanvas.Body className="d-flex flex-column">
          {" "}
          {/* Para alinear el logout al final */}
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
          </Nav>
          {isAuthenticated && ( // Botón de Salir en Offcanvas para móviles
            <Nav className="flex-column mt-auto">
              {" "}
              {/* mt-auto para empujar al final */}
              <Nav.Item className="pt-3 border-top">
                <Nav.Link
                  onClick={handleLogoutInternal}
                  className="text-danger d-flex align-items-center sidebar-link"
                >
                  <FaSignOutAlt className="me-3 icon-container" />
                  Salir
                </Nav.Link>
              </Nav.Item>
            </Nav>
          )}
          {/* Los enlaces de Login/Register en el offcanvas no son necesarios si App.js maneja esto y Layout solo se muestra autenticado */}
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="pt-5 mt-4" style={{ flexGrow: 1 }}>
        <main>{children}</main>
      </Container>

      <footer className="bg-dark text-white text-center py-3">
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
