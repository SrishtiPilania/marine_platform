const express = require('express');
const router = express.Router();
const axios = require('axios');
const Species = require('../models/Species');

// Get all species from our database
router.get('/', async (req, res) => {
  try {
    const species = await Species.find();
    res.json(species);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch real data from OBIS API and save to our database
router.get('/fetch-obis', async (req, res) => {
  try {
    const response = await axios.get('https://api.obis.org/v3/occurrence', {
      params: {
        scientificname: 'Thunnus albacares',
        size: 20
      }
    });

    const records = response.data.results.map(record => ({
      scientificName: record.scientificName || 'Unknown',
      commonName: record.vernacularName || '',
      taxonomy: {
        kingdom: record.kingdom || '',
        phylum: record.phylum || '',
        class: record.class || '',
        order: record.order || '',
        family: record.family || '',
        genus: record.genus || ''
      },
      occurrence: {
        latitude: record.decimalLatitude,
        longitude: record.decimalLongitude,
        location: record.locality || '',
        observedAt: record.eventDate ? new Date(record.eventDate) : new Date()
      },
      source: 'OBIS',
      tags: ['auto-fetched', 'tuna', 'indian-ocean']
    }));

    await Species.insertMany(records, { ordered: false });
    res.json({ message: `${records.length} species records fetched and saved!`, data: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch real data from GBIF API
router.get('/fetch-gbif', async (req, res) => {
  try {
    const response = await axios.get('https://api.gbif.org/v1/occurrence/search', {
      params: {
        scientificName: 'Thunnus albacares',
        limit: 20,
        hasCoordinate: true
      }
    });

    const records = response.data.results.map(record => ({
      scientificName: record.scientificName || 'Unknown',
      commonName: record.vernacularName || '',
      taxonomy: {
        kingdom: record.kingdom || '',
        phylum: record.phylum || '',
        class: record.class || '',
        order: record.order || '',
        family: record.family || '',
        genus: record.genus || ''
      },
      occurrence: {
        latitude: record.decimalLatitude,
        longitude: record.decimalLongitude,
        location: record.country || '',
        observedAt: record.eventDate ? new Date(record.eventDate) : new Date()
      },
      source: 'GBIF',
      tags: ['auto-fetched', 'tuna', 'gbif']
    }));

    await Species.insertMany(records, { ordered: false });
    res.json({ message: `${records.length} GBIF records fetched and saved!`, data: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk fetch multiple species from OBIS
router.get('/fetch-bulk', async (req, res) => {
  try {
    const speciesList = [
      { name: 'Thunnus albacares', tags: ['tuna', 'yellowfin'] },
      { name: 'Katsuwonus pelamis', tags: ['tuna', 'skipjack'] },
      { name: 'Xiphias gladius', tags: ['swordfish'] },
      { name: 'Sardinella longiceps', tags: ['sardine', 'indian-ocean'] },
      { name: 'Rastrelliger kanagurta', tags: ['mackerel', 'indian-ocean'] },
      { name: 'Euthynnus affinis', tags: ['tuna', 'kawakawa'] },
    ]

    let totalSaved = 0

    for (const sp of speciesList) {
      try {
        const response = await axios.get('https://api.obis.org/v3/occurrence', {
          params: { scientificname: sp.name, size: 100 }
        })

        const records = response.data.results
          .filter(r => r.decimalLatitude && r.decimalLongitude)
          .map(record => ({
            scientificName: record.scientificName || sp.name,
            commonName: record.vernacularName || '',
            taxonomy: {
              kingdom: record.kingdom || '',
              phylum: record.phylum || '',
              class: record.class || '',
              order: record.order || '',
              family: record.family || '',
              genus: record.genus || ''
            },
            occurrence: {
              latitude: record.decimalLatitude,
              longitude: record.decimalLongitude,
              location: record.locality || record.waterBody || '',
              observedAt: record.eventDate ? new Date(record.eventDate) : new Date()
            },
            source: 'OBIS',
            tags: ['auto-fetched', ...sp.tags]
          }))

        await Species.insertMany(records, { ordered: false })
        totalSaved += records.length
      } catch (err) {
        console.log(`Skipped ${sp.name}: ${err.message}`)
      }
    }

    res.json({ message: `Bulk fetch complete! ${totalSaved} records saved across 6 species.` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router;
