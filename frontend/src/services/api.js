// frontend/src/services/api.js
import axiosInstance from '../api/axios/Instance';

// ==================== MOCK DATA (for development without backend) ====================
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock appointments data
const MOCK_APPOINTMENTS = [
  { id: 1, date: "2026-05-15", time: "09:00", doctor: "Dr. J. Sithole", doctor_id: 1, type: "in-person", status: "upcoming", department: "General Practice" },
  { id: 2, date: "2026-05-15", time: "10:30", doctor: "Dr. J. Sithole", doctor_id: 1, type: "virtual", status: "upcoming", department: "General Practice" },
  { id: 3, date: "2026-05-16", time: "11:00", doctor: "Dr. J. Sithole", doctor_id: 1, type: "in-person", status: "upcoming", department: "General Practice" },
  { id: 4, date: "2026-05-14", time: "14:00", doctor: "Dr. J. Sithole", doctor_id: 1, type: "in-person", status: "completed", department: "General Practice" },
];

// Mock doctors
const MOCK_DOCTORS = [
  { id: 1, name: "Dr. J. Sithole", specialization: "General Practitioner", available: true },
  { id: 2, name: "Dr. M. Khumalo", specialization: "Mental Health", available: true },
  { id: 3, name: "Dr. N. Patel", specialization: "Dentist", available: false },
];

// Mock queue entries
const MOCK_QUEUE = [
  { id: 1, patient_name: "Thabo Dlamini", student_number: "STU001", check_in_time: "2026-05-15T08:30:00Z", status: "WAITING", priority: "URGENT", reason: "Severe headache" },
  { id: 2, patient_name: "Nomsa Nkosi", student_number: "STU002", check_in_time: "2026-05-15T08:45:00Z", status: "WAITING", priority: "NORMAL", reason: "Chest pain" },
  { id: 3, patient_name: "Sipho Dube", student_number: "STU003", check_in_time: "2026-05-15T09:00:00Z", status: "IN_PROGRESS", priority: "URGENT", reason: "Allergic reaction" },
  { id: 4, patient_name: "Lerato Molefe", student_number: "STU004", check_in_time: "2026-05-15T09:15:00Z", status: "WAITING", priority: "NORMAL", reason: "Follow-up" },
];

// Mock available timeslots
const MOCK_TIMESLOTS = [
  { id: 1, time: "08:00", is_available: true },
  { id: 2, time: "08:30", is_available: true },
  { id: 3, time: "09:00", is_available: false },
  { id: 4, time: "09:30", is_available: true },
  { id: 5, time: "10:00", is_available: true },
  { id: 6, time: "10:30", is_available: false },
  { id: 7, time: "11:00", is_available: true },
  { id: 8, time: "11:30", is_available: true },
  { id: 9, time: "13:00", is_available: true },
  { id: 10, time: "13:30", is_available: true },
  { id: 11, time: "14:00", is_available: false },
  { id: 12, time: "14:30", is_available: true },
];

// Mock patient search results
const MOCK_PATIENTS = [
  { id: 1, student_number: "STU001", first_name: "Thabo", last_name: "Dlamini", email: "thabo@student.ac.za" },
  { id: 2, student_number: "STU002", first_name: "Nomsa", last_name: "Nkosi", email: "nomsa@student.ac.za" },
  { id: 3, student_number: "STU003", first_name: "Sipho", last_name: "Dube", email: "sipho@student.ac.za" },
  { id: 4, student_number: "STU004", first_name: "Lerato", last_name: "Molefe", email: "lerato@student.ac.za" },
];

// Mock notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, title: "New Appointment", text: "Thabo Dlamini booked an appointment for today at 09:00", time: "2026-05-15T08:00:00Z", read: false },
  { id: 2, title: "Lab Results", text: "Blood work results for Nomsa Nkosi are ready", time: "2026-05-14T15:30:00Z", read: false },
  { id: 3, title: "Schedule Update", text: "Your schedule for next week has been updated", time: "2026-05-14T10:00:00Z", read: true },
];

// ==================== APPOINTMENTS ====================

export const getDoctorAppointments = async () => {
  if (USE_MOCK) return MOCK_APPOINTMENTS;
  const response = await axiosInstance.get('/api/v1/appointments/upcoming/');
  return response.data;
};

export const getAppointmentsByDate = async (doctorId, date) => {
  if (USE_MOCK) return MOCK_APPOINTMENTS.filter(a => a.date === date);
  const response = await axiosInstance.get('/api/v1/appointments/', {
    params: { doctor_id: doctorId, date }
  });
  return response.data;
};

// ==================== TIMESLOTS ====================

export const getAvailableTimeslots = async (doctorId, date) => {
  if (USE_MOCK) return MOCK_TIMESLOTS;
  const response = await axiosInstance.get('/api/v1/timeslots/', {
    params: { doctor_id: doctorId, date }
  });
  return response.data;
};

export const addTimeslot = async (doctorId, date, time) => {
  if (USE_MOCK) {
    const newId = MOCK_TIMESLOTS.length + 1;
    return { id: newId, time, is_available: true };
  }
  const response = await axiosInstance.post('/api/v1/timeslots/', {
    doctor_id: doctorId,
    date,
    time
  });
  return response.data;
};

export const removeTimeslot = async (timeslotId) => {
  if (USE_MOCK) return { success: true };
  const response = await axiosInstance.delete(`/api/v1/timeslots/${timeslotId}/`);
  return response.data;
};

// ==================== DOCTORS ====================

export const getDoctors = async () => {
  if (USE_MOCK) return MOCK_DOCTORS;
  const response = await axiosInstance.get('/api/v1/doctors/');
  return response.data;
};

export const getDoctorById = async (doctorId) => {
  if (USE_MOCK) return MOCK_DOCTORS.find(d => d.id === doctorId);
  const response = await axiosInstance.get(`/api/v1/doctors/${doctorId}/`);
  return response.data;
};

// ==================== PATIENT SEARCH ====================

export const searchPatient = async (query) => {
  if (USE_MOCK) {
    return MOCK_PATIENTS.filter(p =>
      p.first_name.toLowerCase().includes(query.toLowerCase()) ||
      p.last_name.toLowerCase().includes(query.toLowerCase()) ||
      p.student_number.toLowerCase().includes(query.toLowerCase())
    );
  }
  const response = await axiosInstance.get('/api/v1/patients/search/', {
    params: { q: query }
  });
  return response.data;
};

// ==================== APPOINTMENT BOOKING ====================

export const createAppointment = async (data) => {
  if (USE_MOCK) {
    const newAppointment = {
      id: Date.now(),
      appointment_date: data.date,
      time: data.time_slot,
      doctor_name: `Dr. ${data.doctor_id}`,
      status: "confirmed",
      qr_code_token: `QR-${Date.now()}`
    };
    return newAppointment;
  }
  const response = await axiosInstance.post('/api/v1/appointments/book/', data);
  return response.data;
};

// ==================== QUEUE MANAGEMENT ====================

export const getQueueEntries = async (doctorId) => {
  if (USE_MOCK) return MOCK_QUEUE;
  const response = await axiosInstance.get(`/api/v1/queue/doctor/${doctorId}/`);
  return response.data;
};

export const updateQueueStatus = async (entryId, data) => {
  if (USE_MOCK) return { success: true };
  const response = await axiosInstance.patch(`/api/v1/queue/${entryId}/`, data);
  return response.data;
};

export const callNextPatient = async (doctorId) => {
  if (USE_MOCK) return { success: true };
  const response = await axiosInstance.post(`/api/v1/queue/doctor/${doctorId}/call-next/`);
  return response.data;
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async () => {
  if (USE_MOCK) return MOCK_NOTIFICATIONS;
  const response = await axiosInstance.get('/api/v1/notifications/');
  return response.data;
};

export const markNotificationRead = async (id) => {
  if (USE_MOCK) return { success: true };
  const response = await axiosInstance.patch(`/api/v1/notifications/${id}/read/`, { read: true });
  return response.data;
};

export const getUnreadCount = async () => {
  if (USE_MOCK) {
    const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
    return { count: unread };
  }
  const response = await axiosInstance.get('/api/v1/notifications/unread/');
  return response.data;
};