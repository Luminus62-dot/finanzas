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
  FaBookOpen, // Icono para Educación Financiera
} from "react-icons/fa"; // FaQuestionCircle para Ayuda/FAQ
import { useAuth } from "../context/AuthContext"; // Asegúrate que la ruta sea correcta

const Layout = ({ children }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const { isAuthenticated, logout, user } = useAuth(); // user para mostrar nombre/rol
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowOffcanvas(false); // Cerrar offcanvas al desloguear
  };

  const handleSelect = (path) => {
    navigate(path);
    setShowOffcanvas(false); // Cerrar offcanvas al seleccionar una opción
  };

  // Cerrar offcanvas si la ruta cambia (navegación por botones del navegador)
  useEffect(() => {
    setShowOffcanvas(false);
  }, [location]);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Cuentas", path: "/accounts", icon: <FaCreditCard /> },
    { name: "Transacciones", path: "/transactions", icon: <FaListAlt /> },
    { name: "Categorías", path: "/categories", icon: <FaListAlt /> }, // Podría ser FaShapes o similar
    { name: "Reportes", path: "/reports", icon: <FaChartBar /> },
    // ESTA ES LA LÍNEA CON EL TEXTO ORIGINAL
    {
      name: "Calculadora de Presupuesto",
      path: "/budget-calculator",
      icon: <FaCalculator />,
    },
    { name: "Metas de Ahorro", path: "/saving-goals", icon: <FaBullseye /> },
    { name: "Educación Financiera", path: "/educate", icon: <FaBookOpen /> },
    { name: "Configuración", path: "/settings", icon: <FaCog /> },
    { name: "Ayuda y FAQ", path: "/help", icon: <FaQuestionCircle /> },
  ];

  const guestLinks = [
    { name: "Iniciar Sesión", path: "/login", icon: <FaSignInAlt /> },
    { name: "Registrarse", path: "/register", icon: <FaUserPlus /> },
    // ESTA ES LA LÍNEA CON EL TEXTO ORIGINAL
    {
      name: "Calculadora de Presupuesto",
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
              Hola, {user.username}
            </Navbar.Text>
          )}
          {isAuthenticated ? (
            <Button
              variant="outline-danger"
              onClick={handleLogout}
              className="d-none d-sm-block"
            >
              <FaSignOutAlt /> Salir
            </Button>
          ) : (
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
              <p className="h5">Hola, {user.username}</p>
              {/* <p className="small text-muted">{user.role || 'Usuario'}</p> */}
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
                  style={{ cursor: "pointer" }} // Añadido para mejor UX
                >
                  <span className="me-3 icon-container">{link.icon}</span>
                  {link.name}
                </Nav.Link>
              </Nav.Item>
            ))}
            {isAuthenticated && (
              <Nav.Item className="mt-auto pt-3 border-top d-sm-none">
                {" "}
                {/* Visible solo en S y XS */}
                <Nav.Link
                  onClick={handleLogout}
                  className="text-danger d-flex align-items-center sidebar-link"
                >
                  <FaSignOutAlt className="me-3 icon-container" />
                  Salir
                </Nav.Link>
              </Nav.Item>
            )}
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
          {/* <Nav className="justify-content-center">
            <Nav.Link as={Link} to="/about" className="text-white">Sobre Nosotros</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="text-white">Contacto</Nav.Link>
            <Nav.Link as={Link} to="/privacy" className="text-white">Privacidad</Nav.Link>
          </Nav> */}
        </Container>
      </footer>
    </>
  );
};

export default Layout;
