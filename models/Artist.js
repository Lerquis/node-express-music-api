// Importar dependencias
const { Schema, model } = require("mongoose");
const mongoosePagination = require("mongoose-paginate-v2");

// Crear schema
const ArtistSchema = Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String, default: "artist.png" },
  created_at: { type: Date, default: Date.now() },
});

// Agregar plugin de paginacion\
ArtistSchema.plugin(mongoosePagination);

// Exportar
module.exports = model("Artist", ArtistSchema, "artists");
