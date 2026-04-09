import { useState } from 'react'
import axios from 'axios'

function Upload() {
  const [speciesFile, setSpeciesFile] = useState(null)
  const [oceanFile, setOceanFile] = useState(null)
  const [speciesMsg, setSpeciesMsg] = useState(null)
  const [oceanMsg, setOceanMsg] = useState(null)
  const [speciesLoading, setSpeciesLoading] = useState(false)
  const [oceanLoading, setOceanLoading] = useState(false)

  const handleSpeciesUpload = async () => {
    if (!speciesFile) return
    setSpeciesLoading(true)
    setSpeciesMsg(null)
    try {
      const formData = new FormData()
      formData.append('file', speciesFile)
      const res = await axios.post('https://marine-platform-1.onrender.com/api/upload/species-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSpeciesMsg({ type: 'success', text: res.data.message })
    } catch (err) {
      setSpeciesMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed' })
    } finally {
      setSpeciesLoading(false)
    }
  }

  const handleOceanUpload = async () => {
    if (!oceanFile) return
    setOceanLoading(true)
    setOceanMsg(null)
    try {
      const formData = new FormData()
      formData.append('file', oceanFile)
      const res = await axios.post('https://marine-platform-1.onrender.com/api/upload/ocean-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setOceanMsg({ type: 'success', text: res.data.message })
    } catch (err) {
      setOceanMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed' })
    } finally {
      setOceanLoading(false)
    }
  }

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #dce3f0',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: '1.5rem'
  }

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Data Upload</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Upload CSV files to integrate custom marine datasets into the platform
        </p>
      </div>

      {/* Species CSV Upload */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Species Occurrence Data</h3>
        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
          Upload species occurrence records in CSV format
        </p>

        <div style={{
          backgroundColor: '#f0f4ff',
          border: '1px solid #dce3f0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#4a5568'
        }}>
          <strong>Required CSV columns:</strong> scientificName, latitude, longitude
          <br />
          <strong>Optional columns:</strong> commonName, kingdom, phylum, class, family, genus, location, observedAt, tags
        </div>

        <div style={{
          border: '2px dashed #dce3f0',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1rem',
          backgroundColor: speciesFile ? '#f0f4ff' : '#fafafa'
        }}>
          <input
            type="file"
            accept=".csv"
            onChange={e => setSpeciesFile(e.target.files[0])}
            style={{ display: 'none' }}
            id="species-file"
          />
          <label htmlFor="species-file" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '0.95rem', color: '#1565c0', fontWeight: '600', marginBottom: '0.3rem' }}>
              {speciesFile ? speciesFile.name : 'Click to select CSV file'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>
              {speciesFile ? `${(speciesFile.size / 1024).toFixed(1)} KB` : 'Supports .csv files'}
            </div>
          </label>
        </div>

        {speciesMsg && (
          <div style={{
            backgroundColor: speciesMsg.type === 'success' ? '#e8f5e9' : '#fce4ec',
            border: `1px solid ${speciesMsg.type === 'success' ? '#a5d6a7' : '#f48fb1'}`,
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.88rem',
            color: speciesMsg.type === 'success' ? '#2e7d32' : '#c62828'
          }}>
            {speciesMsg.text}
          </div>
        )}

        <button
          onClick={handleSpeciesUpload}
          disabled={!speciesFile || speciesLoading}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: !speciesFile || speciesLoading ? '#90caf9' : '#1565c0',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: !speciesFile || speciesLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {speciesLoading ? 'Uploading...' : 'Upload Species CSV'}
        </button>
      </div>

      {/* Ocean CSV Upload */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Oceanographic Data</h3>
        <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
          Upload oceanographic parameter records in CSV format
        </p>

        <div style={{
          backgroundColor: '#f0f4ff',
          border: '1px solid #dce3f0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#4a5568'
        }}>
          <strong>Required CSV columns:</strong> latitude, longitude
          <br />
          <strong>Optional columns:</strong> region, seaSurfaceTemperature, salinity, pH, chlorophyll, dissolvedOxygen, speciesName, catchVolume, recordedAt
        </div>

        <div style={{
          border: '2px dashed #dce3f0',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1rem',
          backgroundColor: oceanFile ? '#f0f4ff' : '#fafafa'
        }}>
          <input
            type="file"
            accept=".csv"
            onChange={e => setOceanFile(e.target.files[0])}
            style={{ display: 'none' }}
            id="ocean-file"
          />
          <label htmlFor="ocean-file" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '0.95rem', color: '#1565c0', fontWeight: '600', marginBottom: '0.3rem' }}>
              {oceanFile ? oceanFile.name : 'Click to select CSV file'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>
              {oceanFile ? `${(oceanFile.size / 1024).toFixed(1)} KB` : 'Supports .csv files'}
            </div>
          </label>
        </div>

        {oceanMsg && (
          <div style={{
            backgroundColor: oceanMsg.type === 'success' ? '#e8f5e9' : '#fce4ec',
            border: `1px solid ${oceanMsg.type === 'success' ? '#a5d6a7' : '#f48fb1'}`,
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.88rem',
            color: oceanMsg.type === 'success' ? '#2e7d32' : '#c62828'
          }}>
            {oceanMsg.text}
          </div>
        )}

        <button
          onClick={handleOceanUpload}
          disabled={!oceanFile || oceanLoading}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: !oceanFile || oceanLoading ? '#90caf9' : '#1565c0',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: !oceanFile || oceanLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {oceanLoading ? 'Uploading...' : 'Upload Ocean CSV'}
        </button>
      </div>

      {/* Sample CSV format */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '1rem' }}>Sample CSV Format</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.5rem' }}>Species CSV</div>
            <pre style={{
              backgroundColor: '#f8faff',
              border: '1px solid #dce3f0',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.78rem',
              color: '#4a5568',
              overflow: 'auto'
            }}>
{`scientificName,latitude,longitude,location
Thunnus albacares,8.5,76.9,Arabian Sea
Katsuwonus pelamis,11.9,75.3,Lakshadweep`}
            </pre>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.5rem' }}>Ocean CSV</div>
            <pre style={{
              backgroundColor: '#f8faff',
              border: '1px solid #dce3f0',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.78rem',
              color: '#4a5568',
              overflow: 'auto'
            }}>
{`latitude,longitude,region,seaSurfaceTemperature,salinity
8.5,76.9,Arabian Sea,28.5,35.2
11.9,75.3,Lakshadweep,29.1,34.8`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload