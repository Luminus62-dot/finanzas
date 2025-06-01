import React from "react";
import { Link } from "react-router-dom";
// Asegúrate de importar FaChartPie aquí junto con los otros íconos
import {
  FaHome,
  FaWallet,
  FaExchangeAlt,
  FaTags,
  FaBullseye,
  FaCog,
  FaSignOutAlt,
  FaChartPie,
} from "react-icons/fa";

const Layout = ({ onLogout, children }) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f7f6",
      }}
    >
      <aside
        style={{
          width: "250px",
          backgroundColor: "#2c3e50", // Color oscuro
          color: "#ecf0f1", // Texto claro
          padding: "20px",
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: "#3498db",
            }}
          >
            Mi Dinero Hoy
          </h2>
          <nav>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/dashboard"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaHome style={{ marginRight: "10px" }} /> Dashboard
                </Link>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/accounts"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaWallet style={{ marginRight: "10px" }} /> Cuentas
                </Link>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/transactions"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaExchangeAlt style={{ marginRight: "10px" }} />{" "}
                  Transacciones
                </Link>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/categories"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaTags style={{ marginRight: "10px" }} /> Categorías
                </Link>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/saving-goals"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaBullseye style={{ marginRight: "10px" }} /> Metas de Ahorro
                </Link>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/reports"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaChartPie style={{ marginRight: "10px" }} /> Reportes
                </Link>
              </li>
              <li style={{ marginBottom: "15px" }}>
                <Link
                  to="/settings"
                  style={{
                    textDecoration: "none",
                    color: "#ecf0f1",
                    fontSize: "1.1em",
                    padding: "10px 15px",
                    display: "block",
                    borderRadius: "5px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#34495e")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <FaCog style={{ marginRight: "10px" }} /> Configuración
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#e74c3c", // Rojo suave
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1em",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c0392b")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#e74c3c")}
        >
          <FaSignOutAlt style={{ marginRight: "8px" }} /> Cerrar Sesión
        </button>
      </aside>

      <main
        style={{ flexGrow: 1, padding: "20px", backgroundColor: "#f4f7f6" }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
