import axiosInstance from '../api/axios/Instance'

// Set to false when backend is ready
export const USE_MOCK = true

// ============ MOCK DATA ============

const MOCK_DASHBOARD = {
  upcomingCount: 2,
  pastVisitsCount: 8,
  pendingResultsCount: 1,
  cancelledCount: 0
}

const MOCK_MEDICAL_RECORDS = [
  { id: 1, date: '2025-04-10', doctor: 'Dr. Nkosi', diagnosis: 'Tension headache', department: 'General' },
  { id: 2, date: '2025-03-15', doctor: 'Dr. Sithole', diagnosis: 'Flu', department: 'General' },
  { id: 3, date: '2025-02-20', doctor: 'Dr. Nkosi', diagnosis: 'Annual checkup', department: 'General' }
]

const MOCK_EMERGENCY_CONTACTS = [
  { id: 1, name: 'Thabo Dlamini', relationship: 'Father', phone: '071 234 5678', label: 'Emergency' },
  { id: 2, name: 'Nomsa Dlamini', relationship: 'Mother', phone: '072 345 6789', label: 'Home' }
]

const MOCK_APPOINTMENTS = [
  { id: 1, appointment_date: '2026-05-20', time_slot: '09:00', doctor_name: 'Dr. D. Sithole', type: 'in-person', status: 'confirmed' },
  { id: 2, appointment_date: '2026-05-22', time_slot: '14:00', doctor_name: 'Dr. Nkosi', type: 'online', status: 'pending' },
  { id: 3, appointment_date: '2026-04-10', time_slot: '10:00', doctor_name: 'Dr. Nkosi', type: 'in-person', status: 'completed' }
]

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. D. Sithole', specialization: 'General Practice', available: true },
  { id: 2, name: 'Dr. Nkosi', specialization: 'Internal Medicine', available: true },
  { id: 3, name: 'Dr. Khumalo', specialization: 'Pediatrics', available: false }
]

const MOCK_TIMESLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

// ============ API CALLS ============

// Patient Dashboard
export const getPatientDashboard = async () => {
  if (USE_MOCK) return MOCK_DASHBOARD
  const response = await axiosInstance.get('/api/v1/patient/dashboard/')
  return response.data
}

// Medical Records
export const getMedicalRecords = async () => {
  if (USE_MOCK) return MOCK_MEDICAL_RECORDS
  const response = await axiosInstance.get('/api/v1/medical-records/')
  return response.data
}

export const getMedicalRecordById = async (id) => {
  if (USE_MOCK) return MOCK_MEDICAL_RECORDS.find(r => r.id === id)
  const response = await axiosInstance.get(`/api/v1/medical-records/${id}/`)
  return response.data
}

// Emergency Contacts
export const getEmergencyContacts = async () => {
  if (USE_MOCK) return MOCK_EMERGENCY_CONTACTS
  const response = await axiosInstance.get('/api/v1/emergency-contacts/')
  return response.data
}

export const createEmergencyContact = async (data) => {
  if (USE_MOCK) return { ...data, id: Date.now() }
  const response = await axiosInstance.post('/api/v1/emergency-contacts/', data)
  return response.data
}

export const updateEmergencyContact = async (id, data) => {
  if (USE_MOCK) return { ...data, id }
  const response = await axiosInstance.put(`/api/v1/emergency-contacts/${id}/`, data)
  return response.data
}

export const deleteEmergencyContact = async (id) => {
  if (USE_MOCK) return { success: true }
  const response = await axiosInstance.delete(`/api/v1/emergency-contacts/${id}/`)
  return response.data
}

// Appointments
export const getUpcomingAppointments = async () => {
  if (USE_MOCK) return MOCK_APPOINTMENTS.filter(a => a.status !== 'completed')
  const response = await axiosInstance.get('/api/v1/appointments/upcoming/')
  return response.data
}

export const getAppointmentHistory = async () => {
  if (USE_MOCK) return MOCK_APPOINTMENTS.filter(a => a.status === 'completed')
  const response = await axiosInstance.get('/api/v1/appointments/history/')
  return response.data
}

export const bookAppointment = async (data) => {
  if (USE_MOCK) return { ...data, id: Date.now(), status: 'confirmed' }
  const response = await axiosInstance.post('/api/v1/appointments/', data)
  return response.data
}

export const cancelAppointment = async (id, reason) => {
  if (USE_MOCK) return { success: true }
  const response = await axiosInstance.patch(`/api/v1/appointments/${id}/cancel/`, { cancellation_reason: reason })
  return response.data
}

// Doctors & Timeslots
export const getDoctors = async () => {
  if (USE_MOCK) return MOCK_DOCTORS
  const response = await axiosInstance.get('/api/v1/doctors/')
  return response.data
}

export const getTimeslots = async (doctorId, date) => {
  if (USE_MOCK) return MOCK_TIMESLOTS
  const response = await axiosInstance.get('/api/v1/timeslots/', { params: { doctor_id: doctorId, date } })
  return response.data
}