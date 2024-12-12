// Importar
const Artist = require("../models/Artist");
const fs = require("fs");
const path = require("path");
const Album = require("../models/Album");
const Song = require("../models/Song");

// Acion de prueba
const prueba = (req, res) => {
  return res.status(200).send({
    status: 200,
    message: "Accion de prueba",
  });
};

// Acciones

const save = async (req, res) => {
  // Sacamos la informacion
  const params = req.body;

  // Verificamos que vengan los espacios requeridos
  if (!params.name)
    return res
      .status(400)
      .json({ status: 400, message: "Faltan datos requeridos" });

  // Crear el objeto
  const newArtist = new Artist(params);

  try {
    // Guardar el objeto en la base de datos
    const artistCreated = await newArtist.save();
    if (!artistCreated)
      return res
        .status(400)
        .json({ status: 400, message: "Algo salio mal creado el artista" });

    // Devolver respuesta
    return res.status(200).json({ status: 200, artist: artistCreated });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Algo salio mal creado el artista" });
  }
};

const profile = async (req, res) => {
  // Sacamos el id de los params
  const { id } = req.params;

  try {
    // Buscamos si existe
    const artistExist = await Artist.findById(id);

    if (!artistExist)
      return res
        .status(200)
        .json({ status: 200, message: "El artista no existe" });
    // Devolvemos respuesta
    return res.status(200).json({ status: 200, artist: artistExist });
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .json({ status: 200, message: "El artista no existe" });
  }
};

const listArtist = async (req, res) => {
  try {
    // Sacar todos los artistas y paginarlos
    const artistList = await Artist.paginate(
      {},
      {
        page: req.params.page ?? 1,
        limit: 5,
        sort: [["name", "asc"]],
        select: "-created_at -__v",
      }
    );

    // Devolvemos respuesta
    if (!artistList.totalDocs)
      return res.status(400).json({ status: 400, message: "No hay artistas" });

    return res.status(200).json({
      status: 200,
      totalArtist: artistList.totalDocs,
      totalPages: artistList.totalPages,
      page: req.params.page ?? 1,
      limit: 5,
      hasNextPage: artistList.hasNextPage,
      hasPrevPage: artistList.hasPrevPage,
      artistList: artistList.docs,
    });
  } catch (error) {
    return res.status(400).json({ status: 400, message: "No hay artistas" });
  }
};

const edit = async (req, res) => {
  // Sacamos el id y los parametros que vengan en el body
  const { id } = req.params;
  const artistToUpdate = req.body;
  try {
    // Buscamos y editamos el artista
    const artistUpdated = await Artist.findByIdAndUpdate(id, artistToUpdate, {
      new: true,
    });

    if (!artistToUpdate)
      return res
        .status(400)
        .json({ status: 400, message: "No se pudo actualizar el artista" });

    // Devolvemos respuesta
    return res.status(200).json({ status: 200, artist: artistUpdated });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "No se pudo actualizar el artista" });
  }
};

const remove = async (req, res) => {
  // Sacamos el id del artista
  const { id } = req.params;
  try {
    // Buscamos y eliminamos
    const deletedArtist = await Artist.findById(id).deleteOne();

    // Devolvemos respuesta
    if (!deletedArtist.deletedCount)
      return res
        .status(400)
        .json({ status: 400, message: "No se ha encontrado el artista" });

    // Eliminamos tambien los albums y canciones
    // Como puede tener una lista de albums, tenemos que recorrer la lista, sacar los ids
    // Y eliminar con el deleteMany
    let albumsToRemove = await Album.find({ artist: id });
    albumsToRemove.map(async (album) => {
      // La cancion deberia de tener tambien el artista, por si no tiene album para que no quede
      // en el aire
      await Song.find({ album: album._id }).deleteMany();
      await album.deleteOne();
    });

    // Devolvemos respuestas
    return res
      .status(200)
      .json({ status: 200, message: "Se ha eliminado el artista" });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "No se ha encontrado el artista" });
  }
};

const upload = async (req, res) => {
  // Sacamos el id
  const { id } = req.params;

  // Sacamos el file
  if (!req.file)
    return res
      .status(404)
      .json({ status: 404, message: "No se ha subido el file" });
  // Verificamos extension
  const { originalname } = req.file;
  const imageSplit = originalname.split(".");
  const extention = imageSplit[imageSplit.length - 1];

  // Si no es correcta, borrarla de la base de datos
  if (!["jpg", "jpeg", "png", "gif"].includes(extention)) {
    fs.unlinkSync(req.file.path);

    return res.status(400).json({
      status: 400,
      message: "Extension del archivo incorrecta",
    });
  }

  try {
    // Si es, encontramos y actualizamos el artista
    const artistUpdated = await Artist.findByIdAndUpdate(
      id,
      {
        image: req.file.filename,
      },
      { new: true }
    ).select("-__v -created_at");

    // Devolvemos respuesta
    if (!artistUpdated)
      return res.status(400).json({
        status: 400,
        message: "Error actualizando la imagen del artista",
      });

    return res.status(200).json({ status: 200, artist: artistUpdated });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      message: "Error actualizando la imagen del artista",
    });
  }
};

const showImage = async (req, res) => {
  // Sacamos el nombre de la imagen
  const { file } = req.params;

  // Obtener el path real de la imagen
  const filePath = "./uploads/artists/" + file;

  // Comprobar si la imagen existe
  fs.stat(filePath, (error, exist) => {
    if (error || !exist)
      return res
        .status(404)
        .json({ status: 404, message: "La imagen no existe" });
  });

  return res.sendFile(path.resolve(filePath));
};

// Exportar modelos
module.exports = {
  prueba,
  save,
  profile,
  listArtist,
  edit,
  remove,
  upload,
  showImage,
};
