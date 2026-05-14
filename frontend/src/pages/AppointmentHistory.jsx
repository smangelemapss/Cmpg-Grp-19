const appointments = [
  { id: 1, date: "2026-04-10", time: "09:00", doctor: "Dr. Nkosi", department: "General", status: "Completed" },
  { id: 2, date: "2026-03-22", time: "11:30", doctor: "Dr. Patel", department: "Mental Health", status: "Completed" },
  { id: 3, date: "2026-05-15", time: "10:00", doctor: "Dr. Nkosi", department: "General", status: "Upcoming" },
  { id: 4, date: "2026-02-01", time: "08:30", doctor: "Dr. Mokoena", department: "Pharmacy", status: "Cancelled" },
]

const statusStyle = {
  Completed: {
    color: "#2e7d32",
    bg: "rgba(46, 125, 50, 0.1)",
    label: "Completed"
  },
  Upcoming: {
    color: "#1b3a6b",
    bg: "rgba(27, 58, 107, 0.1)",
    label: "Upcoming"
  },
  Cancelled: {
    color: "#c62828",
    bg: "rgba(198, 40, 40, 0.1)",
    label: "Cancelled"
  },
}

function AppointmentHistory() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#1a1a2e", marginBottom: "24px" }}>Appointment History</h1>
      
      <div style={{ overflowX: "auto", borderRadius: "12px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f2f5", borderBottom: "1px solid #e5e4e7" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Date</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Time</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Doctor</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Department</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => {
              const status = statusStyle[a.status] || statusStyle.Upcoming
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #e5e4e7" }}>
                  <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{a.date}</td>
                  <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{a.time}</td>
                  <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{a.doctor}</td>
                  <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{a.department}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span 
                      style={{
                        backgroundColor: status.bg,
                        color: status.color,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "inline-block"
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AppointmentHistory