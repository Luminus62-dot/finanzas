// File: backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  let token = req.header("x-auth-token");
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res.status(401).json({ message: "No token, acceso denegado." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Usuario no válido." });
    req.user = user;
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError" ? "Token expirado." : "Token inválido.";
    res.status(401).json({ message: msg });
  }
};
