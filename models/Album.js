// Importar dependencias
const { Schema, model } = require("mongoose");
const mongoosePagination = require("mongoose-paginate-v2");

// Crear el schema
const AlbumSchema = Schema({
  artist: { type: Schema.ObjectId, ref: "Artist" },
  title: { type: String, required: true },
  description: String,
  year: { type: Number, required: true },
  image: { type: String, default: "album.png" },
  created_at: { type: Date, default: Date.now() },
});

// Agregar el plugin de paginacion
AlbumSchema.plugin(mongoosePagination);

// Exportar
module.exports = model("Album", AlbumSchema, "albums");
