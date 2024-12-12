// Importar dependencias
const { Router } = require("express");
const AlbumController = require("../controllers/album");
const auth = require("../middlewares/auth");
const multer = require("multer");

// Configurar el router
const router = Router();

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/albums/");
  },
  filename: (req, file, cb) => {
    cb(null, `album-${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

// Rutas
// ? GET
router.get("/prueba", AlbumController.prueba);
router.get("/album/:id", auth, AlbumController.getAlbum);
router.get("/album_by_artist/:id", auth, AlbumController.albumsByArtist);
router.get("/show/:file", auth, AlbumController.show);

// ? POST
router.post("/save", auth, AlbumController.save);
router.post(
  "/upload/:id",
  [auth, uploads.single("file")],
  AlbumController.upload
);

// ? PUT
router.put("/edit/:id", auth, AlbumController.editAlbum);

// ? DELETE
router.delete("/delete/:id", auth, AlbumController.remove);

// Exportar router
module.exports = router;
