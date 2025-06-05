// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Necesitamos el modelo User para buscar en la BD

module.exports = async function (req, res, next) {
  // La función ahora es async
  let token;
  // Opción 1: Obtener token del header 'x-auth-token' (si lo usas)
  token = req.header("x-auth-token");

  // Opción 2: Obtener token del header 'Authorization' como Bearer token (más común)
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
    } catch (error) {
      console.error("Error al parsear el token Bearer:", error);
      return res.status(401).json({ msg: "Formato de token Bearer inválido" });
    }
  }

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: "No hay token, permiso no válido" });
  }

  // Verificar token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // En lugar de solo el ID, buscamos el usuario completo y lo adjuntamos a req.user
    const userFromDb = await User.findById(decoded.userId).select("-password"); // Excluimos la contraseña

    if (!userFromDb) {
      // Si el token es válido pero el ID de usuario no existe en la BD (ej. usuario eliminado)
      return res
        .status(401)
        .json({ msg: "Usuario del token no encontrado, permiso no válido" });
    }

    req.user = userFromDb; // Adjuntamos el objeto completo del usuario a la petición
    next();
  } catch (err) {
    // Manejo específico para errores de JWT (token expirado, malformado, etc.)
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token no es válido o ha expirado" });
    }
    // Otros errores inesperados durante la verificación o búsqueda del usuario
    console.error("Error en el middleware de autenticación:", err.message);
    return res
      .status(500)
      .json({ msg: "Error del servidor durante la autenticación" });
  }
};
