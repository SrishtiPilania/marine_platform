import { Link } from 'react-router-dom'

const stats = [
  { value: '40+', label: 'Species Records', desc: 'From OBIS & GBIF APIs' },
  { value: '8', label: 'Oceanographic Records', desc: 'CMLRE Indian Ocean data' },
  { value: '3', label: 'Biodiversity Zones', desc: 'AI-identified clusters' },
  { value: '5', label: 'Ocean Parameters', desc: 'SST, salinity, pH, chlorophyll, O₂' },
]

const features = [
  {
    title: 'Multi-Source Integration',
    desc: 'Unified pipeline ingesting data from OBIS, GBIF and CMLRE — previously siloed across incompatible formats — into a single standardized ecosystem.'
  },
  {
    title: 'AI/ML Analysis',
    desc: 'K-Means clustering identifies biodiversity zones. Pearson correlation links oceanographic parameters to species distribution and fish catch volumes.'
  },
  {
    title: 'Geospatial Visualization',
    desc: 'Interactive world map plots real species occurrence records with source-coded markers. Filter by OBIS, GBIF or view all simultaneously.'
  },
  {
    title: 'Automated Metadata Tagging',
    desc: 'NLP-based pipeline automatically tags ingested records with domain categories — eliminating manual labeling and ensuring data consistency.'
  },
  {
    title: 'Parameter Correlation',
    desc: 'Analyze how sea surface temperature, salinity, pH and chlorophyll levels correlate with fish abundance and species distribution patterns.'
  },
  {
    title: 'Indian Ocean Focus',
    desc: "Specialized coverage of India's Exclusive Economic Zone — Arabian Sea, Bay of Bengal and Lakshadweep Sea — supporting MoES research goals."
  },
]

function Home() {
  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2a4a 0%, #1565c0 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '0.3rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          color: '#90caf9',
          letterSpacing: '1px'
        }}>
          SCHOOL OF COMPUTER SCIENCE & ENGINEERING · PBL PROJECT
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '700', marginBottom: '1rem', color: 'white', lineHeight: '1.3' }}>
          Intelligent Data Integration Framework<br />for Marine Biodiversity Research
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#90caf9', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: '1.8' }}>
          A unified platform that integrates marine, fisheries and molecular biodiversity
          datasets from OBIS, GBIF and CMLRE — enabling cross-domain AI/ML analysis
          for ecosystem monitoring and sustainable ocean resource management.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/map" style={{
            backgroundColor: '#ffffff',
            color: '#1a2a4a',
            padding: '0.85rem 2rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}>
            Explore Map
          </Link>
          <Link to="/dashboard" style={{
            backgroundColor: 'transparent',
            color: '#ffffff',
            padding: '0.85rem 2rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: '2px solid rgba(255,255,255,0.5)'
          }}>
            View Dashboard
          </Link>
          <Link to="/explore" style={{
            backgroundColor: 'transparent',
            color: '#ffffff',
            padding: '0.85rem 2rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: '2px solid rgba(255,255,255,0.5)'
          }}>
            Explore Data
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dce3f0',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        flexWrap: 'wrap'
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1565c0' }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#718096' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1a2a4a' }}>
          Platform Capabilities
        </h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '3rem', fontSize: '1rem' }}>
          Addressing the research gap in cross-domain marine data integration
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              padding: '1.8rem',
              borderRadius: '10px',
              border: '1px solid #dce3f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderTop: '3px solid #1565c0'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2a4a', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#4a5568', lineHeight: '1.7' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div style={{ backgroundColor: '#1a2a4a', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Integrated Data Sources</h2>
        <p style={{ color: '#90caf9', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Real-time data ingestion from international and national marine repositories
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { name: 'OBIS', full: 'Ocean Biodiversity Information System' },
            { name: 'GBIF', full: 'Global Biodiversity Information Facility' },
            { name: 'CMLRE', full: 'Centre for Marine Living Resources & Ecology' },
          ].map((src, i) => (
            <div key={i} style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '1.5rem 2rem',
              borderRadius: '10px',
              minWidth: '220px'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.3rem' }}>{src.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#90caf9' }}>{src.full}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Home