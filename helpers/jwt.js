// Importar dependencia
const jwt = require("jwt-simple");
const moment = require("moment");

// Definir la clave secreta
const secret = "SECRET_KEY_PARA_APP_MUSICAL_1239853949129";

// Funcion

const createToken = (user) => {
  // Payload tiene la informacion que quiero que este en el usuario
  const payload = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  // Devolver el token
  return jwt.encode(payload, secret);
};

const decodeToken = (token) => {
  return jwt.decode(token, secret);
};

// Exportar
module.exports = {
  createToken,
  secret,
  decodeToken,
};
