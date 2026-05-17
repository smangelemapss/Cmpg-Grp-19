import { useState, useEffect } from 'react'
import { getPatientDashboard } from '../services/api'

const PatientDashboard = () => {
  const [dashboard, setDashboard] = useState({
    upcomingCount: 0,
    pastVisitsCount: 0,
    pendingResultsCount: 0,
    cancelledCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await getPatientDashboard()
      setDashboard(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Patient Dashboard</h1>
      <p style={styles.welcome}>Welcome back! Here's your health summary.</p>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{dashboard.upcomingCount}</h3>
          <p style={styles.statLabel}>Upcoming Appointments</p>
        </div>
        
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{dashboard.pastVisitsCount}</h3>
          <p style={styles.statLabel}>Past Visits</p>
        </div>
        
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{dashboard.pendingResultsCount}</h3>
          <p style={styles.statLabel}>Pending Results</p>
        </div>
        
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{dashboard.cancelledCount}</h3>
          <p style={styles.statLabel}>Cancelled Appointments</p>
        </div>
      </div>
      
      <div style={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div style={styles.actionButtons}>
          <button style={styles.actionBtn} onClick={() => window.location.href = '/book-appointment'}>
            Book Appointment
          </button>
          <button style={styles.actionBtn} onClick={() => window.location.href = '/medical-history'}>
            View Medical History
          </button>
          <button style={styles.actionBtn} onClick={() => window.location.href = '/emergency-contacts'}>
            Emergency Contacts
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    marginBottom: '10px',
  },
  welcome: {
    color: '#666',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statNumber: {
    fontSize: '36px',
    color: '#007bff',
    marginBottom: '10px',
  },
  statLabel: {
    color: '#666',
    fontSize: '14px',
  },
  quickActions: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '15px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
}

export default PatientDashboard