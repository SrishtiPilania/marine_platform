const mongoose = require('mongoose');

const speciesSchema = new mongoose.Schema({
  scientificName: { type: String, required: true },
  commonName: { type: String },
  taxonomy: {
    kingdom: String,
    phylum: String,
    class: String,
    order: String,
    family: String,
    genus: String
  },
  occurrence: {
    latitude: { type: Number },
    longitude: { type: Number },
    location: { type: String },
    observedAt: { type: Date }
  },
  source: { type: String, enum: ['OBIS', 'GBIF', 'CMLRE', 'manual'], default: 'manual' },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Species', speciesSchema);