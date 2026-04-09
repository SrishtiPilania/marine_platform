const mongoose = require('mongoose');

const oceanDataSchema = new mongoose.Schema({
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    region: { type: String }
  },
  parameters: {
    seaSurfaceTemperature: { type: Number },
    salinity: { type: Number },
    pH: { type: Number },
    chlorophyll: { type: Number },
    dissolvedOxygen: { type: Number }
  },
  fisheries: {
    speciesName: { type: String },
    catchVolume: { type: Number },
    unit: { type: String, default: 'kg' }
  },
  recordedAt: { type: Date, required: true },
  source: { type: String, enum: ['OBIS', 'GBIF', 'CMLRE', 'manual'], default: 'manual' },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('OceanData', oceanDataSchema);