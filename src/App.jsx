import { useState } from 'react'
import Layout from './components/Layout'
import PatientDashboard from './pages/PatientDashboard'
import BookAppointment from './pages/BookAppointment'
import MedicalHistory from './pages/MedicalHistory'
import AppointmentHistory from './pages/AppointmentHistory'
import EmergencyContacts from './pages/EmergencyContacts'

const TAB_COMPONENTS = {
  dashboard: <PatientDashboard />,
  book: <BookAppointment />,
  records: <MedicalHistory />,
  emergency: <EmergencyContacts />,
  notifications: <AppointmentHistory />,
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {TAB_COMPONENTS[activeTab] ?? <PatientDashboard />}
    </Layout>
  )
}

export default App