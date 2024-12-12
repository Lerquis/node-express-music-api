// Importar dependencias
const { Router } = require("express");
const ArtistController = require("../controllers/artist");
const auth = require("../middlewares/auth");
const multer = require("multer");

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/artists/");
  },
  filename: (req, file, cb) => {
    cb(null, `artist-${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

// Configurar el router
const router = Router();
// Rutas
// ? GET
router.get("/prueba", ArtistController.prueba);
router.get("/profile/:id", auth, ArtistController.profile);
router.get("/list/:page?", auth, ArtistController.listArtist);
router.get("/image/:file", auth, ArtistController.showImage);

// ? POST
router.post("/save", auth, ArtistController.save);
router.post(
  "/upload/:id",
  [auth, uploads.single("file")],
  ArtistController.upload
);

// ? PUT
router.put("/edit/:id", auth, ArtistController.edit);

// ? DELETE
router.delete("/delete/:id", auth, ArtistController.remove);

// Exportar router
module.exports = router;
