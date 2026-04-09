import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const links = [
    { path: '/', label: 'Home' },
    { path: '/explore', label: 'Explore Data' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/map', label: 'Map' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/upload', label: 'Upload Data' },
    { path: '/preprocessing', label: 'Preprocessing' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      backgroundColor: '#1a2a4a',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '1rem', letterSpacing: '0.3px' }}>
            Marine Biodiversity Platform
          </div>
          <div style={{ color: '#90caf9', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
            CMLRE · OBIS · GBIF Integration
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {links.map(link => {
          const isActive = location.pathname === link.path
          return (
            <Link key={link.path} to={link.path} style={{
              color: isActive ? '#ffffff' : '#90caf9',
              padding: '0.5rem 1.1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: isActive ? '600' : '400',
              backgroundColor: isActive ? '#2c3e6b' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {link.label}
            </Link>
          )
        })}

        {/* Auth section */}
        <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {user ? (
            <>
              <div style={{
                backgroundColor: '#2c3e6b',
                border: '1px solid #4a5f8a',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                fontSize: '0.85rem',
                color: '#90caf9'
              }}>
                {user.name}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #4a5f8a',
                  backgroundColor: 'transparent',
                  color: '#90caf9',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#1565c0',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: '600'
            }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar