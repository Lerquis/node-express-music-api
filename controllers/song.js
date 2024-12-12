// Importamos las dependencias
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

const save = async (req, res) => {
  // Recoger los datos que me llegan
  const params = req.body;

  // Verificamos que venga album, track y name
  if (!params.album || !params.name || !params.track)
    return res
      .status(400)
      .json({ status: 400, message: "Faltan datos en el body" });

  try {
    // Vemos si el track ya existe en ese album
    const trackExist = await Song.find({
      album: params.album,
      track: params.track,
    });

    if (trackExist.length)
      return res.status(400).json({
        status: 400,
        message: "Ya existe ese numero de track en la cancion",
      });
    // Crear el objeto
    const newSong = new Song(params);

    // Guardar en la base de datos
    const songSaved = await newSong.save();

    // Devolvemos respuesta
    if (!songSaved)
      return res
        .status(400)
        .json({ status: 400, message: "No se ha guardado la cancion" });
    return res.status(200).json({ status: 200, song: songSaved });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "No se ha guardado la cancion" });
  }
};

const getSong = async (req, res) => {
  const { id } = req.params;

  try {
    const songExist = await Song.findById(id).populate({ path: "album" });
    if (!songExist)
      return res
        .status(400)
        .json({ status: 400, message: "No existe la cancion" });

    return res.status(200).json({ status: 200, song: songExist });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "No existe la cancion" });
  }
};

const songsByAlbum = async (req, res) => {
  const { id } = req.params;

  try {
    const songsList = await Song.find({ album: id })
      .populate({ path: "album", populate: "artist" })
      .sort("track");

    return res.status(200).json({ status: 200, list: songsList });
  } catch (error) {
    return res.status(400).json({ message: "No existe el album" });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const songToUpdate = req.body;

  try {
    const songUpdated = await Song.findByIdAndUpdate(id, songToUpdate, {
      new: true,
    });

    if (!songUpdated)
      return res
        .status(400)
        .json({ status: 400, message: "No se pudo actualizar la cancion" });

    return res.status(200).json({ status: 200, song: songUpdated });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 400, message: "No se pudo actualizar la cancion" });
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const songDeleted = await Song.findById(id).deleteOne();
    console.log(songDeleted);
    if (!songDeleted.deletedCount)
      return res
        .status(400)
        .json({ status: 400, message: "No se pudo eliminar la cancion" });

    return res.status(200).json({ status: 200, message: "Cancion eliminada" });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "No se pudo eliminar la cancion" });
  }
};

const upload = async (req, res) => {
  // Sacamos el id
  const { id } = req.params;

  // Sacamos la informacion de la extension
  const { originalname } = req.file;
  const songSplit = originalname.split(".");
  const extention = songSplit[songSplit.length - 1];

  if (!["mp3", "ogg"].includes(extention)) {
    fs.unlinkSync(req.file.path);

    return res.status(400).json({
      status: 400,
      message: "Extension del archivo incorrecta",
    });
  }

  try {
    // Buscamos y actualizamos el album
    const songUpdated = await Song.findByIdAndUpdate(
      id,
      {
        file: req.file.filename,
      },
      { new: true }
    );
    // Devolvemos respuesta

    // Devolver respuesta
    if (!songUpdated)
      return res
        .status(400)
        .json({ status: 400, message: "Error al actualizar la cancion" });

    return res.status(200).json({ status: 200, user: songUpdated });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error al subir el archivo" });
  }
};

const audio = (req, res) => {
  // Sacar el parametro de la url
  const { audio } = req.params;

  // Montar el path real de la imagen
  const filePath = `./uploads/songs/${audio}`;

  // Comprobar si existe el fichero
  fs.stat(filePath, (error, exist) => {
    if (error || !exist)
      return res
        .status(404)
        .json({ status: 404, message: "No existe la cancion" });

    // Devolver el fichero
    return res.sendFile(path.resolve(filePath));
  });
};

// Exportar modelos
module.exports = {
  prueba,
  save,
  getSong,
  songsByAlbum,
  update,
  remove,
  upload,
  audio,
};
