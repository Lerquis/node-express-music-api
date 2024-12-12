const { Schema, model } = require("mongoose");
const mongoosePagination = require("mongoose-paginate-v2");

// Crear el schema
const SongSchema = Schema({
  album: { type: Schema.ObjectId, ref: "Album", required: false },
  track: { type: Number, required: true },
  name: { type: String, required: true },
  duration: { type: String, required: true },
  file: { type: String, default: "default.mp3" },
  created_at: { type: Date, default: Date.now() },
});

// Agregar el plugin de paginacion
SongSchema.plugin(mongoosePagination);

// Exportar
module.exports = model("Song", SongSchema, "songs");
