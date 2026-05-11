import { useState } from 'react'
import './Layout.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'book', label: 'Book Appointment', icon: '📅' },
  { id: 'records', label: 'My Records', icon: '📋' },
  { id: 'emergency', label: 'Emergency Contacts', icon: '📞' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
]

function Layout({ children, activeTab, onTabChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openMenu = () => setIsMobileMenuOpen(true)
  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>

        <div className="sidebar-header">
          <div className="logo">
            <img 
              src="/ubuntulogo.jpeg" 
              alt="Ubuntu Clinic" 
              className="logo-image"
            />
            <span className="logo-text">Ubuntu Clinic</span>
          </div>
          <button className="mobile-close" onClick={closeMenu}>✕</button>
        </div>

        <div className="user-greeting">
          <div className="avatar">AM</div>
          <div className="user-info">
            <span className="greeting">Good Morning,</span>
            <span className="user-name">Angel M.</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => onTabChange(id)}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* Mobile menu trigger */}
      <button className="mobile-menu-btn" onClick={openMenu}>☰</button>

      {/* Main content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

    </div>
  )
}

export default Layout