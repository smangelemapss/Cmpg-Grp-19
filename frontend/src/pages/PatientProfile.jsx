import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const PatientProfile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.first_name || 'John',
    lastName: user?.last_name || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '071 234 5678',
    dateOfBirth: '1990-01-01',
    address: '123 Main Street, Johannesburg',
    bloodType: 'O+',
    allergies: 'None'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would call an API to update the profile
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>My Profile</h1>
      
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            {formData.firstName[0]}{formData.lastName[0]}
          </div>
          <div>
            <h2>{formData.firstName} {formData.lastName}</h2>
            <p style={styles.patientId}>Patient ID: #CBS-2024-001</p>
          </div>
          <button 
            style={styles.editBtn}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Blood Type</label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              >
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Allergies</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled)}}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                style={{...styles.input, ...(isEditing ? {} : styles.disabled), minHeight: '60px'}}
              />
            </div>
          </div>

          {isEditing && (
            <div style={styles.formActions}>
              <button type="submit" style={styles.saveBtn}>
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    marginBottom: '20px',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  patientId: {
    color: '#666',
    marginTop: '5px',
  },
  editBtn: {
    marginLeft: 'auto',
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '5px',
    fontFamily: 'inherit',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  formActions: {
    marginTop: '30px',
    textAlign: 'right',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

export default PatientProfile