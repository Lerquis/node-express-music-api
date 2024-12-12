// Importar dependencias y clave secreta
const jwt = require("jwt-simple");
const moment = require("moment");
const { secret } = require("../helpers/jwt");

// Funcion del middleware
const auth = (req, res, next) => {
  // Comprobar si me llega la cabecera del token
  if (!req.headers.authorization)
    return res.status(400).json({ status: 400, message: "Unauthorized" });

  // Limpiar el token por si tiene comillas mediante un regEx
  const token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    // Decodificar el token
    const payload = jwt.decode(token, secret);

    // Comprobar la expiracion del token
    if (payload.exp <= moment().unix())
      return res.status(401).json({ status: 404, message: "Token invalido" });

    // Agregar datos del usuario a la request
    req.user = payload;

    // Pasar a la ejecucion de la accion con req.next
    next();
  } catch (error) {
    return res.status(404).json({ status: 404, message: "Token invalido" });
  }
};

// Exportar
module.exports = auth;
