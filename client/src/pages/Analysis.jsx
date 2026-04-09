import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts'

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  border: '1px solid #dce3f0',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
}

const PARAMETERS = ['seaSurfaceTemperature', 'salinity', 'pH', 'chlorophyll', 'dissolvedOxygen']
const PARAMETER_LABELS = {
  seaSurfaceTemperature: 'Sea Surface Temperature (°C)',
  salinity: 'Salinity (ppt)',
  pH: 'pH Level',
  chlorophyll: 'Chlorophyll (mg/L)',
  dissolvedOxygen: 'Dissolved Oxygen (mg/L)'
}

function Analysis() {
  const [oceanData, setOceanData] = useState([])
  const [speciesData, setSpeciesData] = useState([])
  const [loading, setLoading] = useState(true)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState('ALL')
  const [selectedRegion, setSelectedRegion] = useState('ALL')
  const [selectedParam, setSelectedParam] = useState('seaSurfaceTemperature')

  // Analysis results
  const [analysisResult, setAnalysisResult] = useState(null)
const [analyzing, setAnalyzing] = useState(false)
const [prediction, setPrediction] = useState(null)
const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [oceanRes, speciesRes] = await Promise.all([
          axios.get('https://marine-platform-1.onrender.com/api/ocean'),
          axios.get('https://marine-platform-1.onrender.com/api/species')
        ])
        setOceanData(oceanRes.data)
        setSpeciesData(speciesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Unique species and regions for dropdowns
  const uniqueSpecies = ['ALL', ...new Set(speciesData.map(s => s.scientificName))]
  const uniqueRegions = ['ALL', ...new Set(oceanData.map(o => o.location.region))]

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)

    try {
      const tagRes = await axios.post('https://marine-platform-cjyl.onrender.com/tag', { text: searchQuery })
      const tags = tagRes.data.tags

      const query = searchQuery.toLowerCase()
      const matchedSpecies = speciesData.filter(s =>
        s.scientificName.toLowerCase().includes(query) ||
        s.occurrence.location?.toLowerCase().includes(query) ||
        s.tags?.some(t => t.toLowerCase().includes(query))
      )

      const matchedOcean = oceanData.filter(o =>
        o.location.region?.toLowerCase().includes(query) ||
        o.fisheries.speciesName?.toLowerCase().includes(query) ||
        tags.some(tag => o.location.region?.toLowerCase().includes(tag))
      )

      setSearchResults({ species: matchedSpecies, ocean: matchedOcean, tags, query: searchQuery })
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  // Handle analysis
  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      let filteredOcean = oceanData
      if (selectedRegion !== 'ALL') {
        filteredOcean = filteredOcean.filter(o => o.location.region === selectedRegion)
      }

      let filteredSpecies = speciesData
      if (selectedSpecies !== 'ALL') {
        filteredSpecies = filteredSpecies.filter(s => s.scientificName === selectedSpecies)
      }

      const correlPayload = filteredOcean.map(d => ({
        seaSurfaceTemperature: d.parameters.seaSurfaceTemperature,
        salinity: d.parameters.salinity,
        pH: d.parameters.pH,
        chlorophyll: d.parameters.chlorophyll,
        dissolvedOxygen: d.parameters.dissolvedOxygen,
        catchVolume: d.fisheries.catchVolume
      }))

      const clusterPayload = filteredOcean.map(d => ({
        latitude: d.location.latitude,
        longitude: d.location.longitude
      }))

      const [correlRes, clusterRes] = await Promise.all([
        axios.post('https://marine-platform-cjyl.onrender.com/correlate', correlPayload),
        axios.post('https://marine-platform-cjyl.onrender.com/cluster', clusterPayload.length >= 3 ? clusterPayload : oceanData.map(d => ({ latitude: d.location.latitude, longitude: d.location.longitude })))
      ])

      const scatterData = filteredOcean.map(d => ({
        x: d.parameters[selectedParam],
        y: d.fisheries.catchVolume,
        region: d.location.region
      }))

      const regionStats = {}
      filteredOcean.forEach(d => {
        const r = d.location.region
        if (!regionStats[r]) regionStats[r] = { region: r, catch: 0, count: 0, temp: 0, chlorophyll: 0 }
        regionStats[r].catch += d.fisheries.catchVolume
        regionStats[r].temp += d.parameters.seaSurfaceTemperature
        regionStats[r].chlorophyll += d.parameters.chlorophyll
        regionStats[r].count += 1
      })
      const regionData = Object.values(regionStats).map(r => ({
        region: r.region,
        avgCatch: +(r.catch / r.count).toFixed(1),
        avgTemp: +(r.temp / r.count).toFixed(2),
        avgChlorophyll: +(r.chlorophyll / r.count).toFixed(3)
      }))

      setAnalysisResult({
        correlations: correlRes.data.correlations,
        clusters: clusterRes.data,
        scatterData,
        regionData,
        filteredOceanCount: filteredOcean.length,
        filteredSpeciesCount: filteredSpecies.length
      })
    } catch (err) {
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#1565c0', fontSize: '1.1rem', fontWeight: '600' }}>Loading data...</div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Research Analysis</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Search datasets and run AI/ML analysis on marine biodiversity parameters
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Dataset Search</h3>
        <p style={{ fontSize: '0.82rem', color: '#718096', marginBottom: '1rem' }}>
          Search across all integrated datasets — species names, ocean regions, parameters
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="e.g. Arabian Sea, Thunnus albacares, temperature, tuna..."
            style={{
              flex: '1',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #dce3f0',
              fontSize: '0.9rem',
              color: '#1a2a4a',
              backgroundColor: '#f8faff',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={searching}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: searching ? '#90caf9' : '#1565c0',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: searching ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                Results for "{searchResults.query}":
              </span>
              <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>
                {searchResults.species.length} species records
              </span>
              <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>
                {searchResults.ocean.length} ocean records
              </span>
              {searchResults.tags.length > 0 && (
                <span style={{ fontSize: '0.78rem', color: '#718096' }}>
                  Auto-tagged: {searchResults.tags.join(', ')}
                </span>
              )}
            </div>

            {searchResults.species.length === 0 && searchResults.ocean.length === 0 ? (
              <div style={{ color: '#718096', fontSize: '0.9rem', padding: '1rem', textAlign: 'center', backgroundColor: '#f8faff', borderRadius: '8px' }}>
                No records found. Try a different search term.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {searchResults.species.slice(0, 4).map((s, i) => (
                  <div key={i} style={{ backgroundColor: '#f8faff', border: '1px solid #dce3f0', borderRadius: '8px', padding: '0.8rem 1rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2a4a', fontStyle: 'italic' }}>{s.scientificName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>
                      {s.source} · {s.occurrence.location || 'Unknown location'}
                    </div>
                  </div>
                ))}
                {searchResults.ocean.slice(0, 4).map((o, i) => (
                  <div key={i} style={{ backgroundColor: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: '8px', padding: '0.8rem 1rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2a4a' }}>{o.location.region}</div>
                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>
                      SST: {o.parameters.seaSurfaceTemperature}°C · Catch: {o.fisheries.catchVolume}kg · {o.fisheries.speciesName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Filters */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>AI/ML Analysis</h3>
        <p style={{ fontSize: '0.82rem', color: '#718096', marginBottom: '1.2rem' }}>
          Select filters and run correlation analysis, clustering and parameter comparison
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Species
            </label>
            <select
              value={selectedSpecies}
              onChange={e => setSelectedSpecies(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 1rem', borderRadius: '8px',
                border: '1px solid #dce3f0', fontSize: '0.88rem',
                color: '#1a2a4a', backgroundColor: '#f8faff', outline: 'none'
              }}
            >
              {uniqueSpecies.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ocean Region
            </label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 1rem', borderRadius: '8px',
                border: '1px solid #dce3f0', fontSize: '0.88rem',
                color: '#1a2a4a', backgroundColor: '#f8faff', outline: 'none'
              }}
            >
              {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Parameter to Analyze
            </label>
            <select
              value={selectedParam}
              onChange={e => setSelectedParam(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 1rem', borderRadius: '8px',
                border: '1px solid #dce3f0', fontSize: '0.88rem',
                color: '#1a2a4a', backgroundColor: '#f8faff', outline: 'none'
              }}
            >
              {PARAMETERS.map(p => <option key={p} value={p}>{PARAMETER_LABELS[p]}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                padding: '0.65rem 2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: analyzing ? '#90caf9' : '#1565c0',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div>
          {/* Summary */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Ocean Records Analyzed', value: analysisResult.filteredOceanCount },
              { label: 'Species Records', value: analysisResult.filteredSpeciesCount },
              { label: 'Regions', value: analysisResult.regionData.length },
              { label: 'Biodiversity Zones', value: 3 }
            ].map((s, i) => (
              <div key={i} style={{
                ...cardStyle,
                flex: '1',
                minWidth: '140px',
                borderTop: '3px solid #1565c0',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1565c0' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Scatter */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>
                {PARAMETER_LABELS[selectedParam]} vs Fish Catch
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
                Scatter plot showing relationship between selected parameter and catch volume
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="x" name={PARAMETER_LABELS[selectedParam]} stroke="#718096" tick={{ fontSize: 11 }} label={{ value: PARAMETER_LABELS[selectedParam], position: 'insideBottom', offset: -5, fill: '#718096', fontSize: 10 }} />
                  <YAxis dataKey="y" name="Catch (kg)" stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <Scatter data={analysisResult.scatterData} fill="#1565c0" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Region Catch */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Average Catch by Region</h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
                Average fish catch volume per ocean region in filtered dataset
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analysisResult.regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="region" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <Bar dataKey="avgCatch" fill="#1565c0" name="Avg Catch (kg)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Temp trend */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Temperature Trend by Region</h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
                Average sea surface temperature across ocean regions
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analysisResult.regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="region" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <Line type="monotone" dataKey="avgTemp" stroke="#e53935" strokeWidth={2} dot={{ fill: '#e53935', r: 5 }} name="Avg Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Correlation results */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Correlation Analysis Results</h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
                Pearson correlation between ocean parameters and fish catch volume
              </p>
              {Object.entries(analysisResult.correlations).map(([key, val], i) => (
                <div key={i} style={{
                  backgroundColor: '#f8faff',
                  border: '1px solid #dce3f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1a2a4a' }}>
                      {key === 'temperature_vs_catch' ? 'Temperature vs Catch' : 'Chlorophyll vs Catch'}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.7rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: val.interpretation === 'Strong' ? '#e8f5e9' : val.interpretation === 'Moderate' ? '#fff3e0' : '#fce4ec',
                      color: val.interpretation === 'Strong' ? '#2e7d32' : val.interpretation === 'Moderate' ? '#e65100' : '#c62828'
                    }}>
                      {val.interpretation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1565c0' }}>{val.correlation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Pearson r</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1565c0' }}>{val.pvalue}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>p-value</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cluster Zones */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Biodiversity Zone Detection</h3>
            <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
              K-Means clustering identified marine ecosystem zones from filtered data
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {analysisResult.clusters.centers.map((center, i) => {
                const zoneNames = ['Arabian Sea Zone', 'Bay of Bengal Zone', 'Indian Ocean EEZ Zone']
                const zoneColors = ['#1565c0', '#00838f', '#2e7d32']
                return (
                  <div key={i} style={{
                    flex: '1',
                    minWidth: '200px',
                    backgroundColor: '#f8faff',
                    border: `1px solid ${zoneColors[i]}`,
                    borderLeft: `4px solid ${zoneColors[i]}`,
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{ fontWeight: '700', color: zoneColors[i], fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                      Zone {i + 1} — {zoneNames[i]}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#718096' }}>
                      Center: {center[0].toFixed(2)}°N, {center[1].toFixed(2)}°E
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
{/* Random Forest Prediction */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Random Forest — Catch Volume Prediction</h3>
        <p style={{ fontSize: '0.82rem', color: '#718096', marginBottom: '1.2rem' }}>
          Predictive modelling using Random Forest Regressor to forecast fish catch based on oceanographic parameters
        </p>
        <button
          onClick={async () => {
            setPredicting(true)
            try {
              const oceanRes = await axios.get('https://marine-platform-1.onrender.com/api/ocean')
              const payload = oceanRes.data.map(d => ({
                seaSurfaceTemperature: d.parameters.seaSurfaceTemperature,
                salinity: d.parameters.salinity,
                pH: d.parameters.pH,
                chlorophyll: d.parameters.chlorophyll,
                dissolvedOxygen: d.parameters.dissolvedOxygen,
                catchVolume: d.fisheries.catchVolume
              }))
              const res = await axios.post('https://marine-platform-cjyl.onrender.com/predict', payload)
              setPrediction(res.data)
            } catch (err) {
              console.error(err)
            } finally {
              setPredicting(false)
            }
          }}
          disabled={predicting}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: predicting ? '#90caf9' : '#1565c0',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: predicting ? 'not-allowed' : 'pointer',
            marginBottom: prediction ? '1.5rem' : '0'
          }}
        >
          {predicting ? 'Training Model...' : 'Run Random Forest Prediction'}
        </button>

        {prediction && (
          <div>
            {/* Metrics */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'R² Score', value: prediction.metrics.r2_score, desc: 'Model accuracy (1.0 = perfect)' },
{ label: 'RMSE', value: prediction.metrics.rmse, desc: 'Root mean squared error' },
{ label: 'MSE', value: prediction.metrics.mse, desc: 'Mean squared error' },
{ label: 'MAE', value: prediction.metrics.mae, desc: 'Mean absolute error' },
{ label: 'Training Samples', value: prediction.training_samples, desc: 'Records used for training' },
{ label: 'Test Samples', value: prediction.test_samples, desc: 'Records used for testing' },
{ label: 'Trees in Forest', value: prediction.n_estimators, desc: 'Number of decision trees' },
              ].map((s, i) => (
                <div key={i} style={{
                  backgroundColor: '#f8faff',
                  border: '1px solid #dce3f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  flex: '1',
                  minWidth: '130px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1565c0' }}>{s.value}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1a2a4a', marginTop: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: '0.2rem' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

              {/* Feature Importance */}
              <div style={{ backgroundColor: '#f8faff', border: '1px solid #dce3f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '1rem' }}>Feature Importance</div>
                {Object.entries(prediction.feature_importance).map(([feat, imp], i) => (
                  <div key={i} style={{ marginBottom: '0.7rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#4a5568' }}>{feat}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1565c0' }}>{(imp * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ backgroundColor: '#dce3f0', borderRadius: '4px', height: '6px' }}>
                      <div style={{ backgroundColor: '#1565c0', borderRadius: '4px', height: '6px', width: `${imp * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actual vs Predicted */}
              <div style={{ backgroundColor: '#f8faff', border: '1px solid #dce3f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '1rem' }}>Actual vs Predicted Catch Volume</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: '#718096', borderBottom: '1px solid #dce3f0' }}>Actual (kg)</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: '#718096', borderBottom: '1px solid #dce3f0' }}>Predicted (kg)</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', color: '#718096', borderBottom: '1px solid #dce3f0' }}>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.predictions.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f4ff' }}>
                        <td style={{ padding: '0.5rem', color: '#1a2a4a', fontWeight: '600' }}>{p.actual}</td>
                        <td style={{ padding: '0.5rem', color: '#1565c0', fontWeight: '600' }}>{p.predicted}</td>
                        <td style={{ padding: '0.5rem', color: Math.abs(p.actual - p.predicted) < 20 ? '#2e7d32' : '#e65100', fontWeight: '600' }}>
                          {(p.predicted - p.actual).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Temperature prediction chart */}
            <div style={{ backgroundColor: '#f8faff', border: '1px solid #dce3f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.3rem' }}>Predicted Catch vs Temperature Range</div>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>How the model predicts catch volume will change as sea surface temperature varies from 25°C to 32°C</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={prediction.temp_predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="temperature" stroke="#718096" tick={{ fontSize: 11 }} label={{ value: 'SST (°C)', position: 'insideBottom', offset: -5, fill: '#718096', fontSize: 11 }} />
                  <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <Line type="monotone" dataKey="predictedCatch" stroke="#1565c0" strokeWidth={2} dot={{ fill: '#1565c0', r: 4 }} name="Predicted Catch (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {/* Empty state */}
      {!analysisResult && (
        <div style={{
          ...cardStyle,
          textAlign: 'center',
          padding: '3rem',
          color: '#718096'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#dce3f0' }}>
            &#9881;
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>
            No analysis run yet
          </div>
          <div style={{ fontSize: '0.88rem' }}>
            Use the search bar above to find specific data, or select filters and click Run Analysis to generate AI/ML insights.
          </div>
        </div>
      )}

    </div>
  )
}

export default Analysis