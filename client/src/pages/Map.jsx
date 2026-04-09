import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

function Map() {
  const [species, setSpecies] = useState([])
  const [oceanData, setOceanData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [showOcean, setShowOcean] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [speciesRes, oceanRes] = await Promise.all([
          axios.get('http://localhost:5000/api/species'),
          axios.get('http://localhost:5000/api/ocean')
        ])
        const valid = speciesRes.data.filter(s => s.occurrence.latitude && s.occurrence.longitude)
        setSpecies(valid)
        setOceanData(oceanRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = filter === 'ALL' ? species : species.filter(s => s.source === filter)

  const getColor = (source) => {
    if (source === 'OBIS') return '#1565c0'
    if (source === 'GBIF') return '#00838f'
    return '#e65100'
  }

  const getHeatColor = (lat, lng) => {
    const nearbyCount = filtered.filter(s =>
      Math.abs(s.occurrence.latitude - lat) < 5 &&
      Math.abs(s.occurrence.longitude - lng) < 5
    ).length
    if (nearbyCount > 15) return { color: '#c62828', opacity: 0.7 }
    if (nearbyCount > 8) return { color: '#e65100', opacity: 0.6 }
    if (nearbyCount > 4) return { color: '#f9a825', opacity: 0.5 }
    return { color: '#0288d1', opacity: 0.4 }
  }

  const handleHeatmapToggle = () => {
    if (!showHeatmap) setShowOcean(false)
    else setShowOcean(true)
    setShowHeatmap(!showHeatmap)
  }

  if (loading) return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#1565c0', fontSize: '1.1rem', fontWeight: '600' }}>Loading map data...</div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Species Distribution Map</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Global occurrence records from integrated marine databases — click any marker for details
        </p>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dce3f0',
        borderRadius: '10px',
        padding: '1.2rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Source</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'OBIS', 'GBIF'].map(src => (
              <button key={src} onClick={() => setFilter(src)} style={{
                padding: '0.4rem 1rem', borderRadius: '6px',
                border: `1px solid ${filter === src ? '#1565c0' : '#dce3f0'}`,
                backgroundColor: filter === src ? '#1565c0' : '#ffffff',
                color: filter === src ? '#ffffff' : '#4a5568',
                cursor: 'pointer', fontSize: '0.85rem',
                fontWeight: filter === src ? '600' : '400'
              }}>{src}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Map Layers</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowOcean(!showOcean)} style={{
              padding: '0.4rem 1rem', borderRadius: '6px',
              border: `1px solid ${showOcean ? '#e65100' : '#dce3f0'}`,
              backgroundColor: showOcean ? '#e65100' : '#ffffff',
              color: showOcean ? '#ffffff' : '#4a5568',
              cursor: 'pointer', fontSize: '0.85rem',
              fontWeight: showOcean ? '600' : '400'
            }}>{showOcean ? 'CMLRE Stations ON' : 'CMLRE Stations OFF'}</button>
            <button onClick={handleHeatmapToggle} style={{
              padding: '0.4rem 1rem', borderRadius: '6px',
              border: `1px solid ${showHeatmap ? '#2e7d32' : '#dce3f0'}`,
              backgroundColor: showHeatmap ? '#2e7d32' : '#ffffff',
              color: showHeatmap ? '#ffffff' : '#4a5568',
              cursor: 'pointer', fontSize: '0.85rem',
              fontWeight: showHeatmap ? '600' : '400'
            }}>{showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}</button>
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legend</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {!showHeatmap && [
              { color: '#1565c0', label: `OBIS (${species.filter(s => s.source === 'OBIS').length})` },
              { color: '#00838f', label: `GBIF (${species.filter(s => s.source === 'GBIF').length})` },
              { color: '#e65100', label: `CMLRE (${oceanData.length})` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: '#4a5568', fontSize: '0.82rem' }}>{item.label}</span>
              </div>
            ))}
            {showHeatmap && [
              { color: '#c62828', label: 'High density' },
              { color: '#e65100', label: 'Medium density' },
              { color: '#f9a825', label: 'Low density' },
              { color: '#0288d1', label: 'Sparse' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: '#4a5568', fontSize: '0.82rem' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#f0f4ff', border: '1px solid #dce3f0', borderRadius: '8px', padding: '0.6rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1565c0' }}>{filtered.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#718096' }}>records shown</div>
        </div>
      </div>

      {showHeatmap && (
        <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '0.8rem 1.2rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#2e7d32' }}>
          Biodiversity density heatmap active — red indicates high species concentration, blue indicates sparse occurrence across {filtered.length} records.
        </div>
      )}

      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #dce3f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '620px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Normal markers mode */}
          {!showHeatmap && filtered.map((s, i) => (
            <CircleMarker key={i}
              center={[s.occurrence.latitude, s.occurrence.longitude]}
              radius={5}
              fillColor={getColor(s.source)}
              color={getColor(s.source)}
              fillOpacity={0.7} weight={1}
            >
              <Popup>
                <div style={{ minWidth: '180px', fontFamily: 'Segoe UI, sans-serif' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a2a4a', marginBottom: '0.5rem' }}>{s.scientificName}</div>
                  <div style={{ display: 'inline-block', backgroundColor: getColor(s.source), color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{s.source}</div>
                  <div style={{ fontSize: '0.82rem', color: '#4a5568', lineHeight: '1.7' }}>
                    <div>Location: {s.occurrence.location || 'Unknown'}</div>
                    <div>Lat/Lon: {s.occurrence.latitude?.toFixed(3)}°, {s.occurrence.longitude?.toFixed(3)}°</div>
                    <div>Date: {s.occurrence.observedAt ? new Date(s.occurrence.observedAt).toLocaleDateString() : 'N/A'}</div>
                    {s.taxonomy.family && <div>Family: {s.taxonomy.family}</div>}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Heatmap mode — large semi-transparent circles color coded by density */}
          {showHeatmap && filtered.map((s, i) => {
            const heat = getHeatColor(s.occurrence.latitude, s.occurrence.longitude)
            return (
              <CircleMarker key={i}
                center={[s.occurrence.latitude, s.occurrence.longitude]}
                radius={18}
                fillColor={heat.color}
                color={heat.color}
                fillOpacity={heat.opacity}
                weight={0}
              />
            )
          })}

          {/* CMLRE stations */}
          {showOcean && oceanData.map((o, i) => (
            <CircleMarker key={`ocean-${i}`}
              center={[o.location.latitude, o.location.longitude]}
              radius={9} fillColor="#e65100" color="#e65100"
              fillOpacity={0.85} weight={2}
            >
              <Popup>
                <div style={{ minWidth: '200px', fontFamily: 'Segoe UI, sans-serif' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a2a4a', marginBottom: '0.5rem' }}>{o.location.region}</div>
                  <div style={{ display: 'inline-block', backgroundColor: '#e65100', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>CMLRE Station</div>
                  <div style={{ fontSize: '0.82rem', color: '#4a5568', lineHeight: '1.8' }}>
                    <div>SST: {o.parameters.seaSurfaceTemperature}°C</div>
                    <div>Salinity: {o.parameters.salinity} ppt</div>
                    <div>pH: {o.parameters.pH}</div>
                    <div>Chlorophyll: {o.parameters.chlorophyll} mg/L</div>
                    <div>Dissolved O₂: {o.parameters.dissolvedOxygen} mg/L</div>
                    <div>Catch: {o.fisheries.speciesName} — {o.fisheries.catchVolume} kg</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default Map