import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import PatientDashboard from '../pages/PatientDashboard';
import MedicalHistory from '../pages/MedicalHistory';
import EmergencyContacts from '../pages/EmergencyContacts';
import AppointmentHistory from '../pages/AppointmentHistory';
import BookAppointment from '../pages/BookAppointment';
import PatientProfile from '../pages/PatientProfile';
import LogInPage from '../pages/auth/LogInPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PatientDashboard /> },
      { path: 'dashboard', element: <PatientDashboard /> },
      { path: 'medical-history', element: <MedicalHistory /> },
      { path: 'emergency-contacts', element: <EmergencyContacts /> },
      { path: 'appointments', element: <AppointmentHistory /> },
      { path: 'book-appointment', element: <BookAppointment /> },
      { path: 'profile', element: <PatientProfile /> },
    ],
  },
  { path: '/login', element: <LogInPage /> },
]);

export default router;