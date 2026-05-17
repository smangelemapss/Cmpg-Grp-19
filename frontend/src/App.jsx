import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import PatientDashboard from './pages/PatientDashboard'
import MedicalHistory from './pages/MedicalHistory'
import EmergencyContacts from './pages/EmergencyContacts'
import AppointmentHistory from './pages/AppointmentHistory'
import BookAppointment from './pages/BookAppointment'
import PatientProfile from './pages/PatientProfile'
import LoginPage from './pages/LoginPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<PatientDashboard />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="emergency-contacts" element={<EmergencyContacts />} />
        <Route path="appointments" element={<AppointmentHistory />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>
    </Routes>
  )
}

export default App