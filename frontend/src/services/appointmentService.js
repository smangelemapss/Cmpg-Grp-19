// F4 — Appointment Booking Module
// Rule: ALL axios calls live here. Components never call axios directly.

import api from './api';

/**
 * Fetch available timeslots for a given date.
 * GET /api/v1/timeslots/?date=YYYY-MM-DD&available=true
 */
export const getAvailableTimeslots = async (date) => {
  const response = await api.get('/api/v1/timeslots/', {
    params: { date, available: true },
  });
  return response.data;
};

/**
 * Book a new appointment.
 * POST /api/v1/appointments/
 * Body: { slot_id, staff_id, reason_for_visit, booking_type }
 * Returns: { appointment_id, qr_code_token, scheduled_for }
 */
export const bookAppointment = async (payload) => {
  const response = await api.post('/api/v1/appointments/', payload);
  return response.data;
};

/**
 * Get all appointments for the logged-in patient.
 * GET /api/v1/appointments/
 */
export const getMyAppointments = async () => {
  const response = await api.get('/api/v1/appointments/');
  return response.data;
};

/**
 * Get a single appointment by ID (includes QR token).
 * GET /api/v1/appointments/{id}/
 */
export const getAppointmentById = async (id) => {
  const response = await api.get(`/api/v1/appointments/${id}/`);
  return response.data;
};

/**
 * Cancel an appointment.
 * PATCH /api/v1/appointments/{id}/cancel/
 */
export const cancelAppointment = async (id) => {
  const response = await api.patch(`/api/v1/appointments/${id}/cancel/`);
  return response.data;
};