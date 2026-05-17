import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctors, getTimeslots, bookAppointment } from '../services/api'

const BookAppointment = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [timeslots, setTimeslots] = useState([])
  const [reason, setReason] = useState('')
  const [appointmentType, setAppointmentType] = useState('in-person')
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingTimeslots, setLoadingTimeslots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadTimeslots()
    }
  }, [selectedDoctor, selectedDate])

  const loadDoctors = async () => {
    try {
      const data = await getDoctors()
      setDoctors(data)
    } catch (error) {
      console.error('Error loading doctors:', error)
      setError('Failed to load doctors')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const loadTimeslots = async () => {
    setLoadingTimeslots(true)
    try {
      const data = await getTimeslots(selectedDoctor, selectedDate)
      setTimeslots(data)
    } catch (error) {
      console.error('Error loading timeslots:', error)
      setTimeslots([])
    } finally {
      setLoadingTimeslots(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    const doctor = doctors.find(d => d.id === parseInt(selectedDoctor))
    const appointmentData = {
      doctor_id: parseInt(selectedDoctor),
      doctor_name: doctor?.name || '',
      appointment_date: selectedDate,
      time_slot: selectedTime,
      reason: reason,
      type: appointmentType
    }

    try {
      await bookAppointment(appointmentData)
      setSuccess('Appointment booked successfully!')
      setTimeout(() => {
        navigate('/appointments')
      }, 2000)
    } catch (error) {
      console.error('Error booking appointment:', error)
      setError('Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <h1 style={styles.pageTitle}>Book an Appointment</h1>
      <p style={styles.subtitle}>Schedule your visit with our doctors</p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Select Doctor *</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
            style={styles.select}
            disabled={loadingDoctors}
          >
            <option value="">-- Select a doctor --</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
                {!doctor.available && ' (Not Available)'}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Select Date *</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Select Time *</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            style={styles.select}
            disabled={loadingTimeslots || !selectedDoctor || !selectedDate}
          >
            <option value="">-- Select a time --</option>
            {loadingTimeslots ? (
              <option disabled>Loading timeslots...</option>
            ) : (
              timeslots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))
            )}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Appointment Type *</label>
          <select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            style={styles.select}
          >
            <option value="in-person">In-Person Visit</option>
            <option value="online">Online Consultation</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Reason for Visit</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={styles.textarea}
            placeholder="Please describe your symptoms or reason for visit..."
            rows="4"
          />
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
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
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '5px',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '5px',
    backgroundColor: 'white',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    marginTop: '5px',
    fontFamily: 'inherit',
  },
  submitBtn: {
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
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
}

export default BookAppointment