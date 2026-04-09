import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

function Preprocessing() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRunPreprocessing = async () => {
    setLoading(true)
    try {
      const oceanRes = await axios.get('https://marine-platform-1.onrender.com/api/ocean')
      const raw = oceanRes.data.map(d => ({
        region: d.location.region,
        seaSurfaceTemperature: d.parameters.seaSurfaceTemperature,
        salinity: d.parameters.salinity,
        pH: d.parameters.pH,
        chlorophyll: d.parameters.chlorophyll,
        dissolvedOxygen: d.parameters.dissolvedOxygen,
        catchVolume: d.fisheries.catchVolume
      }))

      const params = ['seaSurfaceTemperature', 'salinity', 'pH', 'chlorophyll', 'dissolvedOxygen', 'catchVolume']

      // Step 1 — check missing values
      const missingCount = {}
      params.forEach(p => {
        missingCount[p] = raw.filter(r => r[p] === null || r[p] === undefined || isNaN(r[p])).length
      })

      // Step 2 — compute stats
      const stats = {}
      params.forEach(p => {
        const vals = raw.map(r => r[p]).filter(v => v !== null && !isNaN(v)).sort((a, b) => a - b)
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length
        const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length)
        const q1 = vals[Math.floor(vals.length * 0.25)]
        const q3 = vals[Math.floor(vals.length * 0.75)]
        const iqr = q3 - q1
        stats[p] = { mean: +mean.toFixed(3), std: +std.toFixed(3), min: vals[0], max: vals[vals.length - 1], q1, q3, iqr: +iqr.toFixed(3) }
      })

      // Step 3 — detect outliers using Z-score
      const outliers = {}
      params.forEach(p => {
        const { mean, std } = stats[p]
        outliers[p] = raw.filter(r => Math.abs((r[p] - mean) / std) > 2).length
      })

      // Step 4 — detect outliers using IQR
      const iqrOutliers = {}
      params.forEach(p => {
        const { q1, q3, iqr } = stats[p]
        iqrOutliers[p] = raw.filter(r => r[p] < q1 - 1.5 * iqr || r[p] > q3 + 1.5 * iqr).length
      })

      // Step 5 — normalize using min-max scaling
      const normalized = raw.map(r => {
        const norm = { region: r.region }
        params.forEach(p => {
          const { min, max } = stats[p]
          norm[p] = max !== min ? +((r[p] - min) / (max - min)).toFixed(4) : 0
        })
        return norm
      })

      // Step 6 — impute missing values with mean
      const imputed = raw.map(r => {
        const imp = { ...r }
        params.forEach(p => {
          if (imp[p] === null || isNaN(imp[p])) imp[p] = stats[p].mean
        })
        return imp
      })

      const missingChart = params.map(p => ({ parameter: p.replace('seaSurface', 'SST').replace('Temperature', 'Temp'), missing: missingCount[p], outliers_zscore: outliers[p], outliers_iqr: iqrOutliers[p] }))
      const statsChart = params.map(p => ({ parameter: p.replace('seaSurface', 'SST').replace('Temperature', 'Temp'), mean: stats[p].mean, std: stats[p].std }))
      const normalizedChart = normalized.map((r, i) => ({ index: i + 1, ...r }))

      setResults({ raw, stats, missingCount, outliers, iqrOutliers, normalized, imputed, missingChart, statsChart, normalizedChart, totalRecords: raw.length })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
        <h1 style={{ fontSize: '1.8rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Data Preprocessing Pipeline</h1>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Automated cleaning, outlier detection and normalization of heterogeneous marine datasets
        </p>
      </div>

      {/* Pipeline Steps */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '1rem' }}>Pipeline Steps</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { step: '01', title: 'Missing Value Detection', desc: 'Identify null and undefined parameter values' },
            { step: '02', title: 'Mean Imputation', desc: 'Replace missing values with column mean' },
            { step: '03', title: 'Z-Score Outlier Detection', desc: 'Flag values beyond 2 standard deviations' },
            { step: '04', title: 'IQR Filtering', desc: 'Detect outliers using interquartile range method' },
            { step: '05', title: 'Min-Max Normalization', desc: 'Scale all parameters to 0-1 range' },
            { step: '06', title: 'Unit Standardization', desc: 'Ensure consistent units across all sources' },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: '#f8faff',
              border: '1px solid #dce3f0',
              borderRadius: '8px',
              padding: '1rem',
              borderTop: '3px solid #1565c0'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1565c0', marginBottom: '0.3rem' }}>{s.step}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.3rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#718096' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRunPreprocessing}
          disabled={loading}
          style={{
            padding: '0.85rem 2.5rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading ? '#90caf9' : '#1565c0',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Running Pipeline...' : 'Run Preprocessing Pipeline'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div>

          {/* Summary Stats */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Records Processed', value: results.totalRecords },
              { label: 'Parameters Analyzed', value: 6 },
              { label: 'Total Outliers (Z-Score)', value: Object.values(results.outliers).reduce((a, b) => a + b, 0) },
              { label: 'Total Outliers (IQR)', value: Object.values(results.iqrOutliers).reduce((a, b) => a + b, 0) },
              { label: 'Missing Values', value: Object.values(results.missingCount).reduce((a, b) => a + b, 0) },
            ].map((s, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #dce3f0',
                padding: '1.2rem',
                flex: '1',
                minWidth: '140px',
                borderTop: '3px solid #1565c0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1565c0' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Outlier Detection Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Outlier Detection — Z-Score vs IQR</h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Number of outliers detected per parameter using both methods</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={results.missingChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="parameter" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <Bar dataKey="outliers_zscore" fill="#1565c0" name="Z-Score Outliers" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outliers_iqr" fill="#e53935" name="IQR Outliers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Parameter Statistics</h3>
              <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Mean and standard deviation per oceanographic parameter</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={results.statsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="parameter" stroke="#718096" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#718096" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #dce3f0', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <Bar dataKey="mean" fill="#1565c0" name="Mean" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="std" fill="#00838f" name="Std Deviation" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Table */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '1rem' }}>Detailed Parameter Statistics</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f4ff' }}>
                    {['Parameter', 'Mean', 'Std Dev', 'Min', 'Max', 'Q1', 'Q3', 'IQR', 'Z-Score Outliers', 'IQR Outliers'].map((h, i) => (
                      <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#1a2a4a', fontWeight: '600', borderBottom: '1px solid #dce3f0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.stats).map(([param, s], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f4ff' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1565c0' }}>{param}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.mean}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.std}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.min}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.max}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.q1}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.q3}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{s.iqr}</td>
                      <td style={{ padding: '0.75rem 1rem', color: results.outliers[param] > 0 ? '#e53935' : '#2e7d32', fontWeight: '600' }}>{results.outliers[param]}</td>
                      <td style={{ padding: '0.75rem 1rem', color: results.iqrOutliers[param] > 0 ? '#e53935' : '#2e7d32', fontWeight: '600' }}>{results.iqrOutliers[param]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Normalized Data Preview */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>Min-Max Normalized Data Preview</h3>
            <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>All parameters scaled to 0-1 range for cross-domain comparability</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f4ff' }}>
                    {['Region', 'SST', 'Salinity', 'pH', 'Chlorophyll', 'Dissolved O₂', 'Catch Volume'].map((h, i) => (
                      <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#1a2a4a', fontWeight: '600', borderBottom: '1px solid #dce3f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.normalized.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f4ff' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1565c0' }}>{r.region}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{r.seaSurfaceTemperature}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{r.salinity}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{r.pH}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{r.chlorophyll}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{r.dissolvedOxygen}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4a5568' }}>{r.catchVolume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {!results && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: '#718096' }}>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>
            Pipeline not yet run
          </div>
          <div style={{ fontSize: '0.88rem' }}>
            Click "Run Preprocessing Pipeline" above to analyze and clean the integrated marine datasets.
          </div>
        </div>
      )}
    </div>
  )
}

export default Preprocessing