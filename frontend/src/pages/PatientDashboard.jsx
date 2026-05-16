import { useState } from 'react'
import './PatientDashboard.css'

// Mock data - replace with API calls later
const mockAppointments = [
  { id: 1, date: "Mon 5 May", time: "08:30", doctor: "Dr. D. Sithole", type: "General", status: "upcoming" },
  { id: 2, date: "Thur 9 May", time: "09:30", doctor: "Dr. M. Khumalo", type: "Mental Health", status: "upcoming" },
  { id: 3, date: "Frid 9 May", time: "10:30", doctor: "Dr. Nkosi", type: "Toothache", status: "upcoming" },
]

const mockPastVisits = [
  { id: 4, date: "2026-04-10", doctor: "Dr. Nkosi", diagnosis: "Tension headache", status: "completed" },
  { id: 5, date: "2026-03-22", doctor: "Dr. Patel", diagnosis: "Mild anxiety", status: "completed" },
  { id: 6, date: "2026-03-15", doctor: "Dr. Nkosi", diagnosis: "Flu", status: "completed" },
  { id: 7, date: "2026-03-01", doctor: "Dr. Mokoena", diagnosis: "Cold", status: "completed" },
  { id: 8, date: "2026-02-20", doctor: "Dr. Patel", diagnosis: "Follow-up", status: "completed" },
  { id: 9, date: "2026-02-10", doctor: "Dr. Nkosi", diagnosis: "Headache", status: "completed" },
  { id: 10, date: "2026-01-28", doctor: "Dr. Sithole", diagnosis: "Checkup", status: "completed" },
  { id: 11, date: "2026-01-15", doctor: "Dr. Khumalo", diagnosis: "Anxiety", status: "completed" },
]

const mockPendingResults = [
  { id: 12, date: "2026-05-01", test: "Blood Work", status: "pending" },
]

const mockCancelled = []

function PatientDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = {
    upcoming: mockAppointments.length,
    pastVisits: mockPastVisits.length,
    pendingResults: mockPendingResults.length,
    cancelled: mockCancelled.length
  }

  const filteredAppointments = mockAppointments.filter(apt =>
    apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="patient-dashboard">
      {/* Header with Search */}
      <div className="dashboard-header">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search appointments, doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards - F1 Design */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.upcoming}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pastVisits}</div>
          <div className="stat-label">Past Visits</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pendingResults}</div>
          <div className="stat-label">Pending Results</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="sub-tabs">
        <button 
          className={`sub-tab ${activeSubTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`sub-tab ${activeSubTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('past')}
        >
          Past Visits
        </button>
        <button 
          className={`sub-tab ${activeSubTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pending')}
        >
          Pending Results
        </button>
        <button 
          className={`sub-tab ${activeSubTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {/* Main Content Area - 2 Column Layout */}
      <div className="dashboard-grid">
        
        {/* Left Column - Appointments */}
        <div className="appointments-section">
          {activeSubTab === 'upcoming' && (
            <>
              <h2>Upcoming Appointments</h2>
              <div className="appointments-list">
                {filteredAppointments.map(apt => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-time">
                      <span className="date">{apt.date}</span>
                      <span className="time">{apt.time}</span>
                    </div>
                    <div className="appointment-details">
                      <span className="doctor-name">{apt.doctor}</span>
                      <span className="appointment-type">{apt.type}</span>
                    </div>
                    <div className="appointment-status">
                      <span className={`badge badge-${apt.status}`}>
                        {apt.status === 'upcoming' ? 'Upcoming' : apt.status}
                      </span>
                    </div>
                    <div className="appointment-actions">
                      <button className="btn btn-secondary btn-sm">Edit</button>
                      <button className="btn btn-danger btn-sm">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSubTab === 'past' && (
            <>
              <h2>Past Visits</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPastVisits.map(visit => (
                      <tr key={visit.id}>
                        <td>{visit.date}</td>
                        <td>{visit.doctor}</td>
                        <td>{visit.diagnosis}</td>
                        <td>
                          <span className="badge badge-completed">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSubTab === 'pending' && (
            <>
              <h2>Pending Results</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Test</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPendingResults.map(result => (
                      <tr key={result.id}>
                        <td>{result.date}</td>
                        <td>{result.test}</td>
                        <td>
                          <span className="badge badge-pending">Pending</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSubTab === 'cancelled' && (
            <>
              <h2>Cancelled Appointments</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCancelled.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#6a6a8a" }}>
                          No cancelled appointments
                        </td>
                      </tr>
                    ) : (
                      mockCancelled.map(apt => (
                        <tr key={apt.id}>
                          <td>{apt.date}</td>
                          <td>{apt.doctor}</td>
                          <td>{apt.type}</td>
                          <td>
                            <span className="badge badge-cancelled">Cancelled</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn btn-primary">
              📅 Book Appointment
            </button>
            <button className="btn btn-secondary">
              📋 View Records
            </button>
            <button className="btn btn-secondary">
              📱 Download QR
            </button>
          </div>
        </div>

        {/* Right Column - Notifications */}
        <div className="notifications-section">
          <div className="card">
            <h3>Notifications</h3>
            <div className="notifications-list">
              <div className="notification-item">
                <span className="notification-dot"></span>
                <div className="notification-content">
                  <p className="notification-title">Appointment Reminder</p>
                  <p className="notification-text">You have an appointment with Dr. Sithole tomorrow at 08:30</p>
                  <span className="notification-time">2 hours ago</span>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-dot read"></span>
                <div className="notification-content">
                  <p className="notification-title">Lab Results Ready</p>
                  <p className="notification-text">Your recent lab results are available to view</p>
                  <span className="notification-time">Yesterday</span>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-dot"></span>
                <div className="notification-content">
                  <p className="notification-title">Prescription Refill</p>
                  <p className="notification-text">Your prescription is ready for pickup at the pharmacy</p>
                  <span className="notification-time">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard