// Mock data for Phase 3 - Set USE_MOCK = false when backend is ready
const USE_MOCK = true;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ============ MOCK DATA ============
const MOCK_APPOINTMENTS = [
  { id: 1, patient_name: 'Alice Nkosi', patient_id: 101, student_number: '2024123456', patient_phone: '0712345678', date: new Date().toISOString().split('T')[0], start_time: '09:00', end_time: '09:30', status: 'CONFIRMED', reason: 'Fever and cough', appointment_type: 'SICK', priority: 'URGENT' },
  { id: 2, patient_name: 'Bob Mkhize', patient_id: 102, student_number: '2024876543', patient_phone: '0787654321', date: new Date().toISOString().split('T')[0], start_time: '10:00', end_time: '10:30', status: 'SCHEDULED', reason: 'Follow-up', appointment_type: 'FOLLOW_UP', priority: 'NORMAL' },
  { id: 3, patient_name: 'Carol Dlamini', patient_id: 103, student_number: '2024112233', patient_phone: '0799988877', date: new Date().toISOString().split('T')[0], start_time: '11:00', end_time: '11:30', status: 'SCHEDULED', reason: 'Blood pressure check', appointment_type: 'CHECKUP', priority: 'NORMAL' },
  { id: 4, patient_name: 'David Smith', patient_id: 104, student_number: '2024443322', patient_phone: '0722334455', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], start_time: '09:30', end_time: '10:00', status: 'SCHEDULED', reason: 'Chest pain', appointment_type: 'SICK', priority: 'URGENT' },
];

const MOCK_QUEUE = [
  { id: 1, patient_name: 'Bob Mkhize', student_number: '2024876543', check_in_time: new Date().toISOString(), status: 'IN_PROGRESS', priority: 'NORMAL', reason: 'Follow-up', room_number: '101' },
  { id: 2, patient_name: 'Eve Ndlovu', student_number: '2024556677', check_in_time: new Date(Date.now() - 900000).toISOString(), status: 'WAITING', priority: 'URGENT', reason: 'Severe headache', room_number: null },
  { id: 3, patient_name: 'Frank Zulu', student_number: '2024998877', check_in_time: new Date(Date.now() - 1800000).toISOString(), status: 'WAITING', priority: 'NORMAL', reason: 'Vaccination', room_number: null },
];

const MOCK_TIMESLOTS = [
  { id: 1, start_time: '09:00', end_time: '09:30', is_available: true, max_patients: 2, booked_count: 1 },
  { id: 2, start_time: '09:30', end_time: '10:00', is_available: true, max_patients: 2, booked_count: 0 },
  { id: 3, start_time: '10:00', end_time: '10:30', is_available: true, max_patients: 2, booked_count: 1 },
  { id: 4, start_time: '11:00', end_time: '11:30', is_available: false, max_patients: 2, booked_count: 0 },
  { id: 5, start_time: '14:00', end_time: '14:30', is_available: true, max_patients: 2, booked_count: 0 },
  { id: 6, start_time: '14:30', end_time: '15:00', is_available: true, max_patients: 2, booked_count: 0 },
  { id: 7, start_time: '15:00', end_time: '15:30', is_available: true, max_patients: 2, booked_count: 0 },
];

// ============ API Functions ============
export const getDoctorAppointments = async (doctorId, date = null) => {
  if (USE_MOCK) {
    if (date) {
      return MOCK_APPOINTMENTS.filter(app => app.date === date);
    }
    return MOCK_APPOINTMENTS;
  }
  const url = date ? `/appointments/doctor/${doctorId}/?date=${date}` : `/appointments/doctor/${doctorId}/`;
  const response = await fetch(`${API_BASE_URL}${url}`);
  return response.json();
};

export const getAvailableTimeslots = async (doctorId, date) => {
  if (USE_MOCK) {
    return MOCK_TIMESLOTS;
  }
  const response = await fetch(`${API_BASE_URL}/timeslots/available/?doctor_id=${doctorId}&date=${date}`);
  return response.json();
};

export const updateTimeslot = async (slotId, data) => {
  if (USE_MOCK) {
    console.log('Mock update timeslot:', slotId, data);
    return { success: true };
  }
  const response = await fetch(`${API_BASE_URL}/timeslots/${slotId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const addTimeslot = async (data) => {
  if (USE_MOCK) {
    console.log('Mock add timeslot:', data);
    return { success: true, id: Date.now() };
  }
  const response = await fetch(`${API_BASE_URL}/timeslots/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const searchPatient = async (query) => {
  if (USE_MOCK) {
    return [
      { id: 101, student_number: '2024123456', first_name: 'Alice', last_name: 'Nkosi', phone: '0712345678', email: 'alice@student.ac.za' },
      { id: 102, student_number: '2024876543', first_name: 'Bob', last_name: 'Mkhize', phone: '0787654321', email: 'bob@student.ac.za' },
      { id: 103, student_number: '2024112233', first_name: 'Carol', last_name: 'Dlamini', phone: '0799988877', email: 'carol@student.ac.za' },
    ].filter(p => 
      p.student_number.includes(query) || 
      p.first_name.toLowerCase().includes(query.toLowerCase()) ||
      p.last_name.toLowerCase().includes(query.toLowerCase())
    );
  }
  const response = await fetch(`${API_BASE_URL}/patients/search/?q=${encodeURIComponent(query)}`);
  return response.json();
};

export const createAppointment = async (data) => {
  if (USE_MOCK) {
    console.log('Mock create appointment:', data);
    return { success: true, id: Date.now() };
  }
  const response = await fetch(`${API_BASE_URL}/appointments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const getQueueEntries = async (doctorId) => {
  if (USE_MOCK) {
    return MOCK_QUEUE;
  }
  const response = await fetch(`${API_BASE_URL}/queue/doctor/${doctorId}/`);
  return response.json();
};

export const updateQueueStatus = async (entryId, data) => {
  if (USE_MOCK) {
    console.log('Mock update queue status:', entryId, data);
    return { success: true };
  }
  const response = await fetch(`${API_BASE_URL}/queue/${entryId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
