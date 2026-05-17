import { useState, useEffect } from 'react'
import { getMedicalRecords, getMedicalRecordById } from '../services/api'

const MedicalHistory = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      const data = await getMedicalRecords()
      setRecords(data)
    } catch (error) {
      console.error('Error loading medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (id) => {
    try {
      const record = await getMedicalRecordById(id)
      setSelectedRecord(record)
      setShowModal(true)
    } catch (error) {
      console.error('Error loading record details:', error)
    }
  }

  if (loading) {
    return <div>Loading medical records...</div>
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Medical History</h1>
      <p style={styles.subtitle}>View your past medical records and diagnoses</p>

      {records.length === 0 ? (
        <div style={styles.emptyState}>No medical records found.</div>
      ) : (
        <div style={styles.recordsList}>
          {records.map((record) => (
            <div key={record.id} style={styles.recordCard}>
              <div style={styles.recordHeader}>
                <div>
                  <h3 style={styles.recordDate}>{record.date}</h3>
                  <p style={styles.recordDoctor}>Dr. {record.doctor}</p>
                </div>
                <button 
                  style={styles.viewBtn}
                  onClick={() => handleViewDetails(record.id)}
                >
                  View Details
                </button>
              </div>
              <div style={styles.recordInfo}>
                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                <p><strong>Department:</strong> {record.department}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for record details */}
      {showModal && selectedRecord && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Medical Record Details</h2>
            <div style={styles.modalContent}>
              <p><strong>Date:</strong> {selectedRecord.date}</p>
              <p><strong>Doctor:</strong> Dr. {selectedRecord.doctor}</p>
              <p><strong>Department:</strong> {selectedRecord.department}</p>
              <p><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
              {selectedRecord.symptoms && (
                <p><strong>Symptoms:</strong> {selectedRecord.symptoms}</p>
              )}
              {selectedRecord.prescription && (
                <p><strong>Prescription:</strong> {selectedRecord.prescription}</p>
              )}
            </div>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#666',
    marginBottom: '30px',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  recordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  recordDate: {
    fontSize: '18px',
    marginBottom: '5px',
  },
  recordDoctor: {
    color: '#666',
    fontSize: '14px',
  },
  recordInfo: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
  },
  viewBtn: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
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
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalContent: {
    margin: '20px 0',
  },
  closeBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

export default MedicalHistory