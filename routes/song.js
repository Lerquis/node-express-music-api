// Importar dependencias
const { Router } = require("express");
const SongController = require("../controllers/song");
const auth = require("../middlewares/auth");
const multer = require("multer");

// Configurar el router
const router = Router();

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/songs/");
  },
  filename: (req, file, cb) => {
    cb(null, `song-${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

// Rutas
// ? GET
router.get("/prueba", SongController.prueba);
router.get("/song/:id", auth, SongController.getSong);
router.get("/songs_by_album/:id", auth, SongController.songsByAlbum);
router.get("/audio/:audio", auth, SongController.audio);

// ? POST
router.post("/save", auth, SongController.save);
router.post(
  "/upload/:id",
  [auth, uploads.single("audio")],
  SongController.upload
);

// ? PUT
router.put("/update/:id", auth, SongController.update);

// ? DELETE
router.delete("/delete/:id", auth, SongController.remove);

// Exportar router
module.exports = router;
