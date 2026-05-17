import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // For development, accept any non-empty credentials
    // This bypasses the real API call for testing
    setTimeout(() => {
      if (username.trim() !== '' && password.trim() !== '') {
        // Mock successful login
        const mockUser = {
          username: username,
          email: `${username}@example.com`,
          first_name: 'Test',
          last_name: 'User'
        }
        localStorage.setItem('access_token', 'mock-token-12345')
        localStorage.setItem('refresh_token', 'mock-refresh-token')
        login(mockUser)
        navigate('/dashboard')
      } else {
        setError('Please enter username and password')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="login-container" style={styles.container}>
      <div className="login-card" style={styles.card}>
        <h1 style={styles.title}>CBS Clinic</h1>
        <h2 style={styles.subtitle}>Patient Portal Login</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter any username"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter any password"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={styles.demoNote}>
          Demo: Enter any username and password to login
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '18px',
    marginBottom: '30px',
    fontWeight: 'normal',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  demoNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
    marginTop: '20px',
  },
}

export default LoginPage