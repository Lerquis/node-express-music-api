// Importar dependencias y conexion a la base de datos
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user");
const albumRouter = require("./routes/album");
const artistRouter = require("./routes/artist");
const songRouter = require("./routes/song");

// Mensaje de bienvenida
console.log("API REST con Node para la App de Musica arrancada");
// Ejecutar conexion a la base de datos
connection();

// Crear servidor node
const app = express();
const port = 3910;

// Configurar cors
app.use(cors());

// Conversion de los datos del body a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba
app.get("/api/ruta-prueba", (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "Accion de prueba",
  });
});

// Rutas con sus routers
app.use("/api/album", albumRouter);
app.use("/api/artist", artistRouter);
app.use("/api/user", userRouter);
app.use("/api/song", songRouter);

// Poner el servidor a escuchar peticiones http
app.listen(port, () => {
  console.log("Servidor escuchando en el puerto" + port);
});
