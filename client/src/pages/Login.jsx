import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f6f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #dce3f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: '#1a2a4a',
            color: 'white',
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            margin: '0 auto 1rem'
          }}>
            M
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#1a2a4a', marginBottom: '0.3rem' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>
            {isRegister ? 'Register as a marine researcher' : 'Sign in to Marine Biodiversity Platform'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fce4ec',
            border: '1px solid #f48fb1',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            marginBottom: '1.2rem',
            color: '#c62828',
            fontSize: '0.88rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #dce3f0',
                  fontSize: '0.9rem',
                  color: '#1a2a4a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#f8faff'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="researcher@cmlre.gov.in"
              required
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid #dce3f0',
                fontSize: '0.9rem',
                color: '#1a2a4a',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#f8faff'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1a2a4a', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid #dce3f0',
                fontSize: '0.9rem',
                color: '#1a2a4a',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#f8faff'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading ? '#90caf9' : '#1565c0',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#718096' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <span
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ color: '#1565c0', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login