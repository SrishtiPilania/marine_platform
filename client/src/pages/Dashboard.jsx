import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts'

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  border: '1px solid #dce3f0',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
}

function Dashboard() {
  const [oceanData, setOceanData] = useState([])
  const [speciesData, setSpeciesData] = useState([])
  const [clusterResult, setClusterResult] = useState(null)
  const [correlations, setCorrelations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oceanRes, speciesRes] = await Promise.all([
          axios.get('https://marine-platform-1.onrender.com/api/ocean'),
          axios.get('https://marine-platform-1.onrender.com/api/species')
        ])
        setOceanData(oceanRes.data)
        setSpeciesData(speciesRes.data)

        const clusterPayload = oceanRes.data.map(d => ({
          latitude: d.location.latitude,
          longitude: d.location.longitude
        }))
        const clusterRes = await axios.post('https://marine-platform-cjyl.onrender.com/cluster', clusterPayload)
        setClusterResult(clusterRes.data)

        const correlPayload = oceanRes.data.map(d => ({
          seaSurfaceTemperature: d.parameters.seaSurfaceTemperature,
          salinity: d.parameters.salinity,
          pH: d.parameters.pH,
          chlorophyll: d.parameters.chlorophyll,
          dissolvedOxygen: d.parameters.dissolvedOxygen,
          catchVolume: d.fisheries.catchVolume
        }))
        const correlRes = await axios.post('https://marine-platform-cjyl.onrender.com/correlate', correlPayload)
        setCorrelations(correlRes.data)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const regionMap = {}
  oceanData.forEach(d => {
    const r = d.location.region
    if (!regionMap[r]) regionMap[r] = { region: r, catch: 0, temp: 0, salinity: 0, pH: 0, chlorophyll: 0, oxygen: 0, count: 0 }
    regionMap[r].catch += d.fisheries.catchVolume
    regionMap[r].temp += d.parameters.seaSurfaceTemperature
    regionMap[r].salinity += d.parameters.salinity
    regionMap[r].pH += d.parameters.pH
    regionMap[r].chlorophyll += d.parameters.chlorophyll
    regionMap[r].oxygen += d.parameters.dissolvedOxygen
    regionMap[r].count += 1
  })
  const regionData = Object.values(regionMap).map(r => ({
    region: r.region,
    catch: r.catch,
    temp: +(r.temp / r.count).toFixed(2),
    salinity: +(r.salinity / r.count).toFixed(2),
    pH: +(r.pH / r.count).toFixed(2),
    chlorophyll: +(r.chlorophyll / r.count).toFixed(3),
    oxygen: +(r.oxygen / r.count).toFixed(2),
  }))

  const sourceCount = speciesData.reduce((acc, s) => {
    acc[s.source] = (acc[s.source] || 0) + 1
    return acc
  }, {})
  const sourceData = Object.entries(sourceCount).map(([source, count]) => ({ source, count }))

  const scatterData = oceanData.map(d => ({
    temp: d.parameters.seaSurfaceTemperature,
    catch: d.fisheries.catchVolume,
    region: d.location.region
  }))

  if (loading) return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#1565c0', fontSize: '1.1rem', fontWeight: '600' }}>Loading analytics...</div>
        <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.3rem' }}>Fetching data and running AI analysis</div>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Analytics Dashboard</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Real-time insights from integrated OBIS · GBIF · CMLRE marine datasets
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Species Records', value: speciesData.length, sub: 'OBIS + GBIF' },
          { label: 'Oceanographic Records', value: oceanData.length, sub: 'CMLRE Indian Ocean' },
          { label: 'Ocean Regions', value: regionData.length, sub: 'Arabian Sea, Bay of Bengal...' },
          { label: 'Data Sources', value: Object.keys(sourceCount).length, sub: 'Integrated repositories' },
          { label: 'Biodiversity Zones', value: clusterResult ? 3 : 0, sub: 'AI K-Means clustering' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #dce3f0',
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            flex: '1',
            minWidth: '150px',
            borderTop: '3px solid #1565c0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1565c0', lineHeight: '1' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginTop: '0.3rem' }}>{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.2rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Total Fish Catch by Region</h3>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Aggregated catch volume (kg) per ocean region</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" stroke="#718096" tick={{ fontSize: 11 }} />
              <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
              <Bar dataKey="catch" fill="#1565c0" name="Catch Volume (kg)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Species Records by Source</h3>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Distribution of integrated records across data repositories</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="source" stroke="#718096" tick={{ fontSize: 11 }} />
              <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
              <Bar dataKey="count" fill="#00838f" name="Records" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Sea Surface Temperature vs Fish Catch</h3>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Correlation between SST and catch volume across Indian Ocean regions</p>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="temp" name="SST (°C)" stroke="#718096" tick={{ fontSize: 11 }} label={{ value: 'SST (°C)', position: 'insideBottom', offset: -5, fill: '#718096', fontSize: 11 }} />
              <YAxis dataKey="catch" name="Catch (kg)" stroke="#718096" tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
              <Scatter data={scatterData} fill="#1565c0" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Avg Ocean Parameters by Region</h3>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Temperature, salinity and dissolved oxygen averages per region</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" stroke="#718096" tick={{ fontSize: 10 }} />
              <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Bar dataKey="temp" fill="#e53935" name="Temp (°C)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="salinity" fill="#1565c0" name="Salinity" radius={[4, 4, 0, 0]} />
              <Bar dataKey="oxygen" fill="#00838f" name="Dissolved O₂" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Chlorophyll Concentration by Region</h3>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Higher chlorophyll indicates higher marine productivity and biodiversity</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" stroke="#718096" tick={{ fontSize: 10 }} />
              <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
              <Line type="monotone" dataKey="chlorophyll" stroke="#2e7d32" strokeWidth={2} dot={{ fill: '#2e7d32', r: 5 }} name="Chlorophyll (mg/L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>pH Levels by Region</h3>
          <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Ocean acidification monitoring — healthy marine pH range: 7.8–8.3</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="region" stroke="#718096" tick={{ fontSize: 10 }} />
              <YAxis stroke="#718096" tick={{ fontSize: 11 }} domain={[7.5, 8.5]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
              <Line type="monotone" dataKey="pH" stroke="#e65100" strokeWidth={2} dot={{ fill: '#e65100', r: 5 }} name="pH Level" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — Correlations + Clusters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {correlations && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>AI Correlation Analysis</h3>
            <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Pearson correlation between ocean parameters and fish catch volume</p>
            {Object.entries(correlations.correlations).map(([key, val], i) => (
              <div key={i} style={{
                backgroundColor: '#f8faff',
                border: '1px solid #dce3f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1a2a4a' }}>
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
                    {val.interpretation} Correlation
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1565c0' }}>{val.correlation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>Pearson r</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1565c0' }}>{val.pvalue}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>p-value</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {clusterResult && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>AI Biodiversity Zone Detection</h3>
            <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>K-Means clustering identified 3 distinct marine ecosystem zones</p>
            {clusterResult.centers.map((center, i) => {
              const zoneNames = ['Arabian Sea Zone', 'Bay of Bengal Zone', 'Indian Ocean EEZ Zone']
              const zoneColors = ['#1565c0', '#00838f', '#2e7d32']
              return (
                <div key={i} style={{
                  backgroundColor: '#f8faff',
                  border: `1px solid ${zoneColors[i]}`,
                  borderLeft: `4px solid ${zoneColors[i]}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: zoneColors[i], fontSize: '0.95rem' }}>Zone {i + 1} — {zoneNames[i]}</div>
                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.3rem' }}>
                      Center: {center[0].toFixed(2)}°N, {center[1].toFixed(2)}°E
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: zoneColors[i],
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Cluster {i + 1}
                  </div>
                </div>
              )
            })}
            <div style={{ backgroundColor: '#e8f5e9', borderRadius: '8px', padding: '0.8rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: '600' }}>{clusterResult.interpretation}</div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard