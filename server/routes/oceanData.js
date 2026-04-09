const express = require('express');
const router = express.Router();
const OceanData = require('../models/OceanData');

// Get all ocean data
router.get('/', async (req, res) => {
  try {
    const data = await OceanData.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add sample oceanographic data (simulating CMLRE data)
router.post('/seed', async (req, res) => {
  try {
    const sampleData = [
      { location: { latitude: 8.5, longitude: 76.9, region: 'Arabian Sea' }, parameters: { seaSurfaceTemperature: 28.5, salinity: 35.2, pH: 8.1, chlorophyll: 0.45, dissolvedOxygen: 6.2 }, fisheries: { speciesName: 'Thunnus albacares', catchVolume: 120 }, recordedAt: new Date('2024-01-15'), source: 'CMLRE', tags: ['arabian-sea', 'indian-ocean'] },
      { location: { latitude: 11.9, longitude: 75.3, region: 'Lakshadweep Sea' }, parameters: { seaSurfaceTemperature: 29.1, salinity: 34.8, pH: 8.2, chlorophyll: 0.38, dissolvedOxygen: 6.5 }, fisheries: { speciesName: 'Katsuwonus pelamis', catchVolume: 85 }, recordedAt: new Date('2024-02-20'), source: 'CMLRE', tags: ['lakshadweep', 'indian-ocean'] },
      { location: { latitude: 6.9, longitude: 79.8, region: 'Bay of Bengal' }, parameters: { seaSurfaceTemperature: 27.8, salinity: 33.1, pH: 7.9, chlorophyll: 0.62, dissolvedOxygen: 5.8 }, fisheries: { speciesName: 'Rastrelliger kanagurta', catchVolume: 200 }, recordedAt: new Date('2024-03-10'), source: 'CMLRE', tags: ['bay-of-bengal', 'indian-ocean'] },
      { location: { latitude: 15.2, longitude: 72.8, region: 'Arabian Sea' }, parameters: { seaSurfaceTemperature: 26.3, salinity: 36.1, pH: 8.0, chlorophyll: 0.51, dissolvedOxygen: 6.8 }, fisheries: { speciesName: 'Thunnus albacares', catchVolume: 95 }, recordedAt: new Date('2024-04-05'), source: 'CMLRE', tags: ['arabian-sea', 'indian-ocean'] },
      { location: { latitude: 9.1, longitude: 77.5, region: 'Indian Ocean EEZ' }, parameters: { seaSurfaceTemperature: 30.2, salinity: 34.5, pH: 8.3, chlorophyll: 0.29, dissolvedOxygen: 7.1 }, fisheries: { speciesName: 'Xiphias gladius', catchVolume: 45 }, recordedAt: new Date('2024-05-18'), source: 'CMLRE', tags: ['eez', 'indian-ocean'] },
      { location: { latitude: 12.5, longitude: 74.1, region: 'Arabian Sea' }, parameters: { seaSurfaceTemperature: 31.0, salinity: 35.8, pH: 8.1, chlorophyll: 0.33, dissolvedOxygen: 5.9 }, fisheries: { speciesName: 'Thunnus albacares', catchVolume: 150 }, recordedAt: new Date('2024-06-22'), source: 'CMLRE', tags: ['arabian-sea', 'indian-ocean'] },
      { location: { latitude: 7.5, longitude: 81.2, region: 'Bay of Bengal' }, parameters: { seaSurfaceTemperature: 28.9, salinity: 32.8, pH: 7.8, chlorophyll: 0.71, dissolvedOxygen: 5.5 }, fisheries: { speciesName: 'Sardinella longiceps', catchVolume: 310 }, recordedAt: new Date('2024-07-14'), source: 'CMLRE', tags: ['bay-of-bengal', 'indian-ocean'] },
      { location: { latitude: 10.3, longitude: 73.2, region: 'Lakshadweep Sea' }, parameters: { seaSurfaceTemperature: 29.7, salinity: 34.2, pH: 8.2, chlorophyll: 0.41, dissolvedOxygen: 6.3 }, fisheries: { speciesName: 'Katsuwonus pelamis', catchVolume: 175 }, recordedAt: new Date('2024-08-30'), source: 'CMLRE', tags: ['lakshadweep', 'indian-ocean'] }
    ];

    await OceanData.insertMany(sampleData);
    res.json({ message: `${sampleData.length} oceanographic records seeded!`, data: sampleData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Bulk save ocean records
router.post('/bulk-save', async (req, res) => {
  try {
    const records = req.body
    if (!records || records.length === 0) {
      return res.status(400).json({ message: 'No records provided' })
    }
    
    const cleanedRecords = records.map(r => ({
      location: {
        latitude: Number(r.location.latitude),
        longitude: Number(r.location.longitude),
        region: r.location.region || ''
      },
      parameters: {
        seaSurfaceTemperature: Number(r.parameters.seaSurfaceTemperature),
        salinity: Number(r.parameters.salinity),
        pH: Number(r.parameters.pH),
        chlorophyll: Number(r.parameters.chlorophyll),
        dissolvedOxygen: Number(r.parameters.dissolvedOxygen)
      },
      fisheries: {
        speciesName: r.fisheries.speciesName || '',
        catchVolume: Number(r.fisheries.catchVolume),
        unit: r.fisheries.unit || 'kg'
      },
      recordedAt: new Date(r.recordedAt),
      source: r.source || 'manual',
      tags: r.tags || []
    }))

    const result = await OceanData.insertMany(cleanedRecords, { ordered: false })
    console.log(`Successfully saved ${result.length} records`)
    res.json({ message: `${result.length} ocean records saved successfully!` })
  } catch (err) {
    console.error('Bulk save error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

router.post('/seed-large', async (req, res) => {
  try {
    const regions = [
      { name: 'Arabian Sea', latRange: [8, 25], lonRange: [55, 78] },
      { name: 'Bay of Bengal', latRange: [5, 22], lonRange: [80, 100] },
      { name: 'Indian Ocean EEZ', latRange: [-10, 8], lonRange: [60, 90] },
      { name: 'Lakshadweep Sea', latRange: [8, 15], lonRange: [72, 78] },
      { name: 'Arabian Sea North', latRange: [20, 28], lonRange: [58, 70] },
    ]

    const species = [
      'Thunnus albacares', 'Katsuwonus pelamis', 'Xiphias gladius',
      'Sardinella longiceps', 'Rastrelliger kanagurta', 'Euthynnus affinis'
    ]

    const records = []

    for (let i = 0; i < 200; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)]
      const lat = region.latRange[0] + Math.random() * (region.latRange[1] - region.latRange[0])
      const lon = region.lonRange[0] + Math.random() * (region.lonRange[1] - region.lonRange[0])
      const sst = +(24 + Math.random() * 8).toFixed(2)
      const salinity = +(33 + Math.random() * 4).toFixed(2)
      const pH = +(7.8 + Math.random() * 0.5).toFixed(2)
      const chlorophyll = +(0.1 + Math.random() * 0.8).toFixed(3)
      const dissolvedOxygen = +(5 + Math.random() * 3).toFixed(2)
      const catchVolume = +(
  Math.max(10,
    10 +
    sst * 6 +
    chlorophyll * 250 +
    dissolvedOxygen * 15 +
    salinity * 2 +
    (pH - 7.8) * 10 +
    (Math.random() - 0.5) * 8
  )
).toFixed(1)

      const months = ['2022-01', '2022-04', '2022-07', '2022-10',
                      '2023-01', '2023-04', '2023-07', '2023-10',
                      '2024-01', '2024-04', '2024-07', '2024-10']
      const month = months[Math.floor(Math.random() * months.length)]

      records.push({
        location: { latitude: +lat.toFixed(4), longitude: +lon.toFixed(4), region: region.name },
        parameters: {
          seaSurfaceTemperature: sst,
          salinity, pH, chlorophyll, dissolvedOxygen
        },
        fisheries: {
          speciesName: species[Math.floor(Math.random() * species.length)],
          catchVolume: +catchVolume,
          unit: 'kg'
        },
        recordedAt: new Date(`${month}-15`),
        source: 'CMLRE',
        tags: ['seeded', region.name.toLowerCase().replace(/ /g, '-')]
      })
    }

    await OceanData.insertMany(records, { ordered: false })
    res.json({ message: `${records.length} ocean records seeded successfully!` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.delete('/clear-seeded', async (req, res) => {
  try {
    const result = await OceanData.deleteMany({ 
      source: { $in: ['CMLRE', 'manual'] }
    })
    res.json({ message: `Deleted ${result.deletedCount} seeded records` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router;
