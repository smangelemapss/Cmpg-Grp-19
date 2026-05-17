import axiosInstance from '../api/axios/Instance';

// Mock data flag - set to false to use real API
export const USE_MOCK = false;

// Mock data for development
export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    appointment_date: '2026-05-20',
    time_slot: '09:00',
    doctor_name: 'Dr. D. Sithole',
    type: 'in-person',
    status: 'confirmed',
  },
  {
    id: 2,
    appointment_date: '2026-05-22',
    time_slot: '14:00',
    doctor_name: 'Dr. Nkosi',
    type: 'online',
    status: 'pending',
  },
];

export const MOCK_QUEUE = [
  {
    id: 1,
    patient_name: 'Thabo Dlamini',
    status: 'WAITING',
    position: 1,
    priority: 'NORMAL',
  },
  {
    id: 2,
    patient_name: 'Nomsa Nkosi',
    status: 'IN_PROGRESS',
    position: 2,
    priority: 'URGENT',
  },
];

// ============ APPOINTMENT API CALLS ============

export const getDoctorAppointments = async (doctorId) => {
  if (USE_MOCK) return MOCK_APPOINTMENTS;
  const response = await axiosInstance.get(`/api/v1/appointments/doctor/${doctorId}/`);
  return response.data;
};

export const getAvailableTimeslots = async (doctorId, date) => {
  if (USE_MOCK) return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const response = await axiosInstance.get('/api/v1/timeslots/', {
    params: { doctor_id: doctorId, date },
  });
  return response.data;
};

export const updateTimeslot = async (id, data) => {
  const response = await axiosInstance.patch(`/api/v1/timeslots/${id}/`, data);
  return response.data;
};

export const createTimeslot = async (data) => {
  const response = await axiosInstance.post('/api/v1/timeslots/', data);
  return response.data;
};

export const searchPatients = async (query) => {
  if (USE_MOCK) return [{ id: 1, name: 'Thabo Dlamini', student_number: 'STU001' }];
  const response = await axiosInstance.get('/api/v1/patients/search/', {
    params: { q: query },
  });
  return response.data;
};

export const bookAppointment = async (data) => {
  const response = await axiosInstance.post('/api/v1/appointments/', data);
  return response.data;
};

// ============ QUEUE API CALLS ============

export const getDoctorQueue = async (doctorId) => {
  if (USE_MOCK) return MOCK_QUEUE;
  const response = await axiosInstance.get(`/api/v1/queue/doctor/${doctorId}/`);
  return response.data;
};

export const updateQueueStatus = async (queueId, status) => {
  const response = await axiosInstance.patch(`/api/v1/queue/${queueId}/status/`, { status });
  return response.data;
};

// ============ PATIENT API CALLS ============

export const getPatientDashboard = async () => {
  if (USE_MOCK) {
    return {
      upcomingCount: 2,
      pastVisitsCount: 8,
      pendingResultsCount: 1,
      cancelledCount: 0,
    };
  }
  const response = await axiosInstance.get('/api/v1/patient/dashboard/');
  return response.data;
};

export const getMedicalRecords = async () => {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        date: '2025-04-10',
        doctor: 'Dr. Nkosi',
        diagnosis: 'Tension headache',
        department: 'General',
      },
    ];
  }
  const response = await axiosInstance.get('/api/v1/medical-records/');
  return response.data;
};

export const getMedicalRecordById = async (id) => {
  if (USE_MOCK) {
    return {
      id: 1,
      date: '2025-04-10',
      doctor: 'Dr. Nkosi',
      diagnosis: 'Tension headache',
      symptoms: 'Tight band-like pressure',
      prescription: 'Rest and hydration',
    };
  }
  const response = await axiosInstance.get(`/api/v1/medical-records/${id}/`);
  return response.data;
};

export const getEmergencyContacts = async () => {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        name: 'Thabo Dlamini',
        relationship: 'Father',
        phone: '071 234 5678',
        label: 'Emergency',
      },
    ];
  }
  const response = await axiosInstance.get('/api/v1/emergency-contacts/');
  return response.data;
};

export const createEmergencyContact = async (data) => {
  const response = await axiosInstance.post('/api/v1/emergency-contacts/', data);
  return response.data;
};

export const updateEmergencyContact = async (id, data) => {
  const response = await axiosInstance.put(`/api/v1/emergency-contacts/${id}/`, data);
  return response.data;
};

export const deleteEmergencyContact = async (id) => {
  const response = await axiosInstance.delete(`/api/v1/emergency-contacts/${id}/`);
  return response.data;
};

export const getDoctors = async () => {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        name: 'Dr. D. Sithole',
        specialization: 'General Practice',
        available: true,
      },
    ];
  }
  const response = await axiosInstance.get('/api/v1/doctors/');
  return response.data;
};

export const getUpcomingAppointments = async () => {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        appointment_date: '2026-05-20',
        time_slot: '09:00',
        doctor_name: 'Dr. D. Sithole',
        type: 'General',
        status: 'confirmed',
      },
    ];
  }
  const response = await axiosInstance.get('/api/v1/appointments/upcoming/');
  return response.data;
};

export const getAppointmentHistory = async () => {
  if (USE_MOCK) {
    return [
      {
        id: 2,
        appointment_date: '2026-04-10',
        time_slot: '09:00',
        doctor_name: 'Dr. Nkosi',
        department: 'General',
        status: 'completed',
      },
    ];
  }
  const response = await axiosInstance.get('/api/v1/appointments/history/');
  return response.data;
};