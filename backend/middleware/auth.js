// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Obtener el token del header
  const token = req.header("x-auth-token"); // Esperamos el token en el header 'x-auth-token'

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: "No hay token, autorización denegada" });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar el ID del usuario al objeto de la petición para usarlo en las rutas protegidas
    req.user = decoded.user;
    next(); // Pasar al siguiente middleware/función de la ruta
  } catch (err) {
    res.status(401).json({ msg: "Token no es válido" });
  }
};
