import { useState, useEffect } from 'react'
import { getUpcomingAppointments, getAppointmentHistory, cancelAppointment } from '../services/api'

const AppointmentHistory = () => {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const [upcomingData, pastData] = await Promise.all([
        getUpcomingAppointments(),
        getAppointmentHistory()
      ])
      setUpcoming(upcomingData)
      setPast(pastData)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = (id) => {
    setCancellingId(id)
    setCancelReason('')
    setShowCancelModal(true)
  }

  const handleCancelConfirm = async () => {
    try {
      await cancelAppointment(cancellingId, cancelReason)
      setShowCancelModal(false)
      setCancellingId(null)
      setCancelReason('')
      loadAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#28a745'
      case 'pending': return '#ffc107'
      case 'cancelled': return '#dc3545'
      case 'completed': return '#17a2b8'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return <div>Loading appointments...</div>
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>My Appointments</h1>
      
      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'upcoming' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcoming.length})
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'past' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('past')}
        >
          Past ({past.length})
        </button>
      </div>

      {activeTab === 'upcoming' && (
        <div>
          {upcoming.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No upcoming appointments.</p>
              <button style={styles.bookBtn} onClick={() => window.location.href = '/book-appointment'}>
                Book an Appointment
              </button>
            </div>
          ) : (
            <div style={styles.appointmentsList}>
              {upcoming.map((apt) => (
                <div key={apt.id} style={styles.appointmentCard}>
                  <div style={styles.appointmentHeader}>
                    <div>
                      <h3 style={styles.appointmentDate}>{apt.appointment_date}</h3>
                      <p style={styles.appointmentTime}>{apt.time_slot}</p>
                    </div>
                    <div>
                      <span style={{...styles.statusBadge, backgroundColor: getStatusColor(apt.status)}}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                  <div style={styles.appointmentInfo}>
                    <p><strong>Doctor:</strong> {apt.doctor_name}</p>
                    <p><strong>Type:</strong> {apt.type}</p>
                  </div>
                  {apt.status !== 'cancelled' && (
                    <button 
                      style={styles.cancelBtn}
                      onClick={() => handleCancelClick(apt.id)}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          {past.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No past appointments found.</p>
            </div>
          ) : (
            <div style={styles.appointmentsList}>
              {past.map((apt) => (
                <div key={apt.id} style={styles.appointmentCard}>
                  <div style={styles.appointmentHeader}>
                    <div>
                      <h3 style={styles.appointmentDate}>{apt.appointment_date}</h3>
                      <p style={styles.appointmentTime}>{apt.time_slot}</p>
                    </div>
                    <div>
                      <span style={{...styles.statusBadge, backgroundColor: getStatusColor(apt.status)}}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                  <div style={styles.appointmentInfo}>
                    <p><strong>Doctor:</strong> {apt.doctor_name}</p>
                    <p><strong>Type:</strong> {apt.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Cancel Appointment</h2>
            <p>Are you sure you want to cancel this appointment?</p>
            <div style={styles.formGroup}>
              <label>Reason (optional):</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={styles.textarea}
                placeholder="Please provide a reason for cancellation..."
              />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.modalCancelBtn} onClick={() => setShowCancelModal(false)}>
                No, Keep It
              </button>
              <button style={styles.modalConfirmBtn} onClick={handleCancelConfirm}>
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    marginBottom: '20px',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
  },
  activeTab: {
    color: '#007bff',
    borderBottom: '2px solid #007bff',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  appointmentDate: {
    fontSize: '18px',
    marginBottom: '5px',
  },
  appointmentTime: {
    color: '#666',
    fontSize: '14px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'white',
  },
  appointmentInfo: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    marginBottom: '15px',
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  bookBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '15px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '400px',
    width: '90%',
  },
  formGroup: {
    margin: '15px 0',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '5px',
    minHeight: '80px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  modalCancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

export default AppointmentHistory