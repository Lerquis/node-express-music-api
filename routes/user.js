// Importar dependencias
const { Router } = require("express");
const UserController = require("../controllers/user");
const auth = require("../middlewares/auth");
const multer = require("multer");

// Configurar el router
const router = Router();

// Configuracion de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

// Rutas
// ? GET
router.get("/prueba", UserController.prueba);
router.get("/profile/:id?", auth, UserController.profile);
router.get("/avatar/:file", auth, UserController.showAvatar);

// ? POST
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/upload", [auth, uploads.single("file")], UserController.upload);

// ? PUT
router.put("/update", auth, UserController.update);

// ? DELETE

// Exportar router
module.exports = router;
