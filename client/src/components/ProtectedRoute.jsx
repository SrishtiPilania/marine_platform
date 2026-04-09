import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#1565c0', fontSize: '1.1rem', fontWeight: '600' }}>Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute