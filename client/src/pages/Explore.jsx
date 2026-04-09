import { useEffect, useState } from 'react'
import axios from 'axios'

function Explore() {
  const [species, setSpecies] = useState([])
  const [oceanData, setOceanData] = useState([])
  const [activeTab, setActiveTab] = useState('species')
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [speciesRes, oceanRes] = await Promise.all([
          axios.get('http://localhost:5000/api/species'),
          axios.get('http://localhost:5000/api/ocean')
        ])
        setSpecies(speciesRes.data)
        setOceanData(oceanRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filteredSpecies = species.filter(s => {
    const matchSearch =
      s.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      s.occurrence.location?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.join(' ').toLowerCase().includes(search.toLowerCase())
    const matchSource = sourceFilter === 'ALL' || s.source === sourceFilter
    return matchSearch && matchSource
  })

  const filteredOcean = oceanData.filter(o =>
    o.location.region?.toLowerCase().includes(search.toLowerCase()) ||
    o.fisheries.speciesName?.toLowerCase().includes(search.toLowerCase())
  )

  const getSourceColor = (source) => {
    if (source === 'OBIS') return { bg: '#e3f2fd', text: '#1565c0' }
    if (source === 'GBIF') return { bg: '#e0f2f1', text: '#00838f' }
    return { bg: '#fff3e0', text: '#e65100' }
  }

  const regionObservationCount = {}
  oceanData.forEach(o => {
    regionObservationCount[o.location.region] = (regionObservationCount[o.location.region] || 0) + 1
  })
  const regionObservationIndex = {}

  if (loading) return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#1565c0', fontSize: '1.1rem', fontWeight: '600' }}>Loading datasets...</div>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Explore Integrated Data</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Browse and search unified marine datasets from OBIS · GBIF · CMLRE
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dce3f0',
        borderRadius: '10px',
        padding: '1.2rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search by species name, location, tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1',
            minWidth: '250px',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid #dce3f0',
            backgroundColor: '#f8faff',
            color: '#1a2a4a',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />

        {activeTab === 'species' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'OBIS', 'GBIF'].map(src => (
              <button key={src} onClick={() => setSourceFilter(src)} style={{
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: `1px solid ${sourceFilter === src ? '#1565c0' : '#dce3f0'}`,
                backgroundColor: sourceFilter === src ? '#1565c0' : '#ffffff',
                color: sourceFilter === src ? '#ffffff' : '#4a5568',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: sourceFilter === src ? '600' : '400'
              }}>
                {src}
              </button>
            ))}
          </div>
        )}

        <div style={{
          backgroundColor: '#f0f4ff',
          border: '1px solid #dce3f0',
          borderRadius: '8px',
          padding: '0.55rem 1rem',
          fontSize: '0.85rem',
          color: '#1565c0',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          {activeTab === 'species' ? filteredSpecies.length : filteredOcean.length} results
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'species', label: 'Species Records', count: filteredSpecies.length },
          { key: 'ocean', label: 'Oceanographic Data', count: filteredOcean.length }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '0.7rem 1.5rem',
            borderRadius: '8px',
            border: `1px solid ${activeTab === tab.key ? '#1565c0' : '#dce3f0'}`,
            backgroundColor: activeTab === tab.key ? '#1565c0' : '#ffffff',
            color: activeTab === tab.key ? '#ffffff' : '#4a5568',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === tab.key ? '600' : '400'
          }}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Species Tab */}
      {activeTab === 'species' && (
        <div>
          {filteredSpecies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
              No records found matching your search.
            </div>
          ) : filteredSpecies.map((s, i) => {
            const colors = getSourceColor(s.source)
            return (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dce3f0',
                borderRadius: '10px',
                padding: '1.2rem 1.5rem',
                marginBottom: '0.8rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1a2a4a', fontStyle: 'italic' }}>
                      {s.scientificName}
                    </span>
                    <span style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      padding: '0.2rem 0.7rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {s.source}
                    </span>
                  </div>
                  <span style={{ color: '#718096', fontSize: '0.85rem' }}>
                    {s.occurrence.location || 'Unknown location'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: '#4a5568', fontSize: '0.85rem' }}>
                  <span>{s.occurrence.latitude?.toFixed(3)}°N, {s.occurrence.longitude?.toFixed(3)}°E</span>
                  <span>{s.occurrence.observedAt ? new Date(s.occurrence.observedAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                  {s.taxonomy.family && <span>Family: {s.taxonomy.family}</span>}
                  {s.taxonomy.genus && <span>Genus: {s.taxonomy.genus}</span>}
                </div>

                {s.tags?.length > 0 && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {s.tags.map((tag, j) => (
                      <span key={j} style={{
                        backgroundColor: '#f0f4ff',
                        color: '#1565c0',
                        padding: '0.15rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        border: '1px solid #dce3f0'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Ocean Data Tab */}
      {activeTab === 'ocean' && (
        <div>
          {filteredOcean.map((o, i) => {
            regionObservationIndex[o.location.region] = (regionObservationIndex[o.location.region] || 0) + 1
            const obsIndex = regionObservationIndex[o.location.region]
            const obsTotal = regionObservationCount[o.location.region]
            return (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dce3f0',
                borderRadius: '10px',
                padding: '1.2rem 1.5rem',
                marginBottom: '0.8rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1a2a4a' }}>
                      {o.location.region}
                    </span>
                    <span style={{
                      backgroundColor: '#fff3e0',
                      color: '#e65100',
                      padding: '0.2rem 0.7rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {o.source}
                    </span>
                    {obsTotal > 1 && (
                      <span style={{
                        backgroundColor: '#f0f4ff',
                        color: '#1565c0',
                        padding: '0.2rem 0.7rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: '1px solid #dce3f0'
                      }}>
                        Observation {obsIndex} of {obsTotal}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#718096', fontSize: '0.85rem' }}>
                    {new Date(o.recordedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  {[
                    { label: 'Sea Surface Temp', value: `${o.parameters.seaSurfaceTemperature}°C`, color: '#e53935' },
                    { label: 'Salinity', value: `${o.parameters.salinity} ppt`, color: '#1565c0' },
                    { label: 'pH Level', value: o.parameters.pH, color: '#7b1fa2' },
                    { label: 'Chlorophyll', value: `${o.parameters.chlorophyll} mg/L`, color: '#2e7d32' },
                    { label: 'Dissolved O₂', value: `${o.parameters.dissolvedOxygen} mg/L`, color: '#0288d1' },
                  ].map((param, j) => (
                    <div key={j} style={{
                      backgroundColor: '#f8faff',
                      border: '1px solid #dce3f0',
                      borderRadius: '8px',
                      padding: '0.7rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: param.color }}>{param.value}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: '0.2rem' }}>{param.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: '#f0f4ff',
                  border: '1px solid #dce3f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.85rem',
                  color: '#1a2a4a'
                }}>
                  <strong>{o.fisheries.speciesName}</strong> — Catch Volume: <strong>{o.fisheries.catchVolume} {o.fisheries.unit}</strong>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Explore