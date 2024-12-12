const User = require("../models/User");
const validator = require("../helpers/validator");
const bcrypt = require("bcrypt");
const { createToken, decodeToken } = require("../helpers/jwt");
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
const register = async (req, res) => {
  // Recoger datos de la peticion
  const params = req.body;

  // Comprobar que llegan bien
  if (
    !params.name ||
    !params.surname ||
    !params.email ||
    !params.password ||
    !params.nick
  )
    return res.status(400).json({
      status: 200,
      message: "Faltan datos para la creacion del modelo",
    });
  // Validar los datos
  if (!validator.registerValidator(params))
    return res.status(400).json({
      status: 400,
      message: "Fallo la verificacion avanzada",
    });

  try {
    // Control de usuarios duplicados
    const duplicates = await User.find({
      $or: [{ email: params.email }, { nick: params.nick }],
    });
    if (duplicates.length)
      return res
        .status(400)
        .json({ status: 400, message: "Ya existe un usuario" });

    // Cifrar la contrasena
    params.password = await bcrypt.hash(params.password, 10);

    // Crear objeto del usuario
    const newUser = new User(params);

    // Guardar usuario en la base de datos
    const savedUserResponse = await newUser.save();
    if (!savedUserResponse)
      return res
        .status(400)
        .json({ status: 400, message: "Algo salio mal guardando el usuario" });

    // Limpiar el objeto a devolver
    // Tenemos que crear una copia del objeto para poder eliminar los datos
    const userClean = savedUserResponse.toObject();
    delete userClean.password;
    delete userClean.__v;
    delete userClean.role;
    delete userClean._id;

    return res.status(200).json({ status: 200, user: userClean });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Algo salio mal buscando los duplicados" });
  }
};

const login = async (req, res) => {
  // Sacar la informacion del request\
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ status: 400, message: "Faltan datos" });

  // Buscar si existe por el correo
  const userExist = await User.findOne({ email });
  if (!userExist)
    return res
      .status(404)
      .json({ status: 404, message: "El usuario no fue encontrado" });
  // Descencriptar la contrasena y comprobar
  if (!bcrypt.compareSync(password, userExist.password))
    return res
      .status(400)
      .json({ status: 400, message: "Credenciales incorrectas" });

  // Crear un JWT
  const token = createToken(userExist);

  // Eliminar los datos que no queremos mostrar
  const userClean = userExist.toObject();
  delete userClean.password;
  delete userClean.__v;
  delete userClean.role;
  delete userClean._id;

  // Devolver respuesta
  return res.status(200).json({ status: 200, user: userClean, token });
};

const profile = async (req, res) => {
  // Sacamos el id
  const id = req.params.id ?? req.user.id;

  try {
    // Existe el usuario?
    const userExist = await User.findById(id).select(
      "-password -role -__v -email"
    );

    if (!userExist)
      return res
        .status(404)
        .json({ status: 404, message: "El usuario no existe" });

    // Devolvemos respuesta
    return res.status(200).json({ status: 200, user: userExist });
  } catch (error) {
    return res
      .status(404)
      .json({ status: 404, message: "El usuario no existe" });
  }
};

const update = async (req, res) => {
  // Sacamos el id del req.user
  const { id } = req.user;

  // Sacamos los parametros a actualizar
  const userToUpdate = req.body;

  // Validacion avanzada de los datos
  if (!validator.registerValidator(userToUpdate))
    return res
      .status(400)
      .json({ status: 400, message: "No paso la validacion de datos" });

  try {
    // Si quiere cambiar el nick tenemos que comprobar que no exista alguien con ese nick
    if (userToUpdate.nick) {
      let userExist = await User.find({ nick: userToUpdate.nick });
      if (userExist.length)
        return res
          .status(404)
          .json({ status: 404, message: "Ya existe un usuario con ese nick" });
    }

    // Si viene contrasena, ciframos nueva contrasena
    if (userToUpdate.password)
      userToUpdate.password = await bcrypt.hashSync(userToUpdate.password, 10);

    // Buscamos el modelo y actualizamos
    userExist = await User.findByIdAndUpdate(id, userToUpdate, { new: true });

    // Damos una respuesta
    if (!userExist)
      return res.status(400).json({
        status: 400,
        message: "Algo salio mal actualizando al usuario",
      });

    // Eliminamos los datos
    const userClean = userExist.toObject();
    delete userClean.password;
    delete userClean.__v;
    delete userClean.role;
    delete userClean._id;

    return res.status(200).json({ status: 200, user: userClean });
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ status: 404, message: "No existe el usuario" });
  }
};

const upload = async (req, res) => {
  // Recoger el archivo y comprobar si existe
  if (!req.file)
    return res
      .status(404)
      .json({ status: 404, message: "No existe el archivo 'file'" });
  // Conseguir el nombre del archivo
  let { originalname } = req.file;

  // Sacar la extencion y comprobar la extension
  const imageSplit = originalname.split(".");
  const extention = imageSplit[imageSplit.length - 1];

  // Si no es correcta, tenemos que eliminarla de la base de datos y devolver respuesta
  if (!["jpg", "jpeg", "png", "gif"].includes(extention)) {
    fs.unlinkSync(req.file.path);

    return res.status(400).json({
      status: 400,
      message: "Extension del archivo incorrecta",
    });
  }

  try {
    // Si es correcto, lo guardamos en la base de datos
    const userUpdated = await User.findOneAndUpdate(
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    ).select("-password -email -__v -role");

    // Devolver respuesta
    if (!userUpdated)
      return res
        .status(400)
        .json({ status: 400, message: "Error al actualizar el usuario" });

    return res.status(200).json({ status: 200, user: userUpdated });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ status: 400, message: "Error al actualizar el usuario" });
  }
};

const showAvatar = (req, res) => {
  // Sacar el parametro de la url
  const { file } = req.params;

  // Montar el path real de la imagen
  const filePath = `./uploads/avatars/${file}`;

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
  register,
  login,
  profile,
  update,
  upload,
  showAvatar,
};
