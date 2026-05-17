import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/dashboard">CBS Clinic</Link>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/medical-history">Medical History</Link>
          <Link to="/emergency-contacts">Emergency Contacts</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/book-appointment">Book Appointment</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout