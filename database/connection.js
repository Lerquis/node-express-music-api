// Importar mongoose
const mongo0se = require("mongoose");

// Metodo de conexion
const connection = async () => {
  try {
    await mongo0se.connect("mongodb://localhost:27017/app_musica");
    console.log("Conectado a la base de datos de app_musica");
  } catch (error) {
    console.log(error);
    throw new Error("Error conectando a la base de datos");
  }
};

// Exportar conexion
module.exports = connection;
