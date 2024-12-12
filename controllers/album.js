// Importar dependencias
const Album = require("../models/Album");
const Song = require("../models/Song");
const fs = require("fs");
const path = require("path");

// Acion de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: 200,
    message: "Accion de prueba",
  });
};

// Acciones

const save = async (req, res) => {
  // Sacamos los params
  const params = req.body;

  // Comprobamos que venga el artista, el titulo y anio
  if (!params.title || !params.year || !params.artist)
    return res
      .status(404)
      .json({ status: 404, message: "Faltan datos por enviar" });

  // Creamos el objeto
  const newAlbum = new Album(params);

  try {
    // Guardamos en la base de datos
    const albumSaved = await newAlbum.save();

    // Devolvemos respuesta
    if (!albumSaved)
      return res
        .status(400)
        .json({ status: 400, message: "Error guardando album" });

    return res.status(200).json({ status: 200, album: albumSaved });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error guardando album" });
  }
};

const getAlbum = async (req, res) => {
  // Sacamos el id
  const { id } = req.params;

  try {
    // Buscamos el album, hacemos populate y sacamos la informacion que queremos
    const albumExist = await Album.findById(id)
      .populate({ path: "artist", select: "-__v -created_at" })
      .select("-__v -created_at");

    // Devolvemos respuesta
    if (!albumExist)
      return res
        .status(400)
        .json({ status: 400, message: "No se encontro el album" });

    return res.status(200).json({ status: 200, album: albumExist });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "No se encontro el album" });
  }
};

const albumsByArtist = async (req, res) => {
  // Obtenemos el id
  const { id } = req.params;

  try {
    // Buscamos todos los albums por el id del artista
    const albumsBy = await Album.find({ artist: id })
      .sort({ year: 1 })
      .populate({ path: "artist", select: "-created_at -__v" })
      .select("-__v -created_at");

    // Devolvemos respuesta
    return res.status(200).json({ status: 200, albums: albumsBy });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error obteniendo informacion" });
  }
};

const editAlbum = async (req, res) => {
  // Sacamos el id
  const { id } = req.params;

  // Sacamos el body
  const albumToUpdated = req.body;

  try {
    // Buscamos y actualizamos
    const albumUpdated = await Album.findByIdAndUpdate(id, albumToUpdated, {
      new: true,
    });
    if (!albumUpdated)
      return res
        .status(400)
        .json({ status: 400, message: "No se ha actualzado el album" });

    return res.status(200).json({ status: 200, album: albumUpdated });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error actualizando el album" });
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAlbum = await Album.findById(id).deleteOne();

    if (!deletedAlbum.deletedCount)
      return res
        .status(400)
        .json({ status: 400, message: "No se encontro el album" });

    // Tenemos que encontrar las canciones que tienen en el atributo {album:id}
    const songsByAlbum = await Song.find({ album: id });
    songsByAlbum.map(async (song) => song.deleteOne());

    return res.status(200).json({ status: 200, message: "Album eliminado" });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error eliminando el album" });
  }
};

const upload = async (req, res) => {
  // Sacamos el id
  const { id } = req.params;

  // Sacamos la informacion de la extension
  const { originalname } = req.file;
  const imageSplit = originalname.split(".");
  const extention = imageSplit[imageSplit.length - 1];

  if (!["jpg", "jpeg", "png", "gif"].includes(extention)) {
    fs.unlinkSync(req.file.path);

    return res.status(400).json({
      status: 400,
      message: "Extension del archivo incorrecta",
    });
  }

  try {
    // Buscamos y actualizamos el album
    const albumUpdated = await Album.findByIdAndUpdate(
      id,
      {
        image: req.file.filename,
      },
      { new: true }
    );
    // Devolvemos respuesta

    // Devolver respuesta
    if (!albumUpdated)
      return res
        .status(400)
        .json({ status: 400, message: "Error al actualizar el album" });

    return res.status(200).json({ status: 200, user: albumUpdated });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error al subir el archivo" });
  }
};

const show = (req, res) => {
  // Sacar el parametro de la url
  const { file } = req.params;

  // Montar el path real de la imagen
  const filePath = `./uploads/albums/${file}`;

  // Comprobar si existe el fichero
  fs.stat(filePath, (error, exist) => {
    if (error || !exist)
      return res
        .status(404)
        .json({ status: 404, message: "No existe la imagen" });

    // Devolver el fichero
    return res.sendFile(path.resolve(filePath));
  });
};

// Exportar modelos
module.exports = {
  prueba,
  save,
  getAlbum,
  albumsByArtist,
  editAlbum,
  upload,
  show,
  remove,
};
