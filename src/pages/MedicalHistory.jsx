import { useState } from 'react'

const records = [
  { id: 1, date: "2025-04-10", doctor: "Dr. Nkosi", diagnosis: "Transition headache", department: "General", prescription: "Rest and hydration", symptoms: "Tight band-like pressure around forehead" },
  { id: 2, date: "2025-03-22", doctor: "Dr. Patel", diagnosis: "Mild anxiety", department: "Mental Health", prescription: "Counselling referral", symptoms: "Feeling overwhelmed, difficulty sleeping" },
  { id: 3, date: "2025-02-05", doctor: "Dr. Nkosi", diagnosis: "Flu", department: "General", prescription: "Antiviral medication", symptoms: "Fever, cough, body aches" },
]

function MedicalHistory() {
  const [selectedRecord, setSelectedRecord] = useState(null)

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "24px", color: "#1a1a2e" }}>Medical History</h1>
      
      <div style={{ overflowX: "auto", borderRadius: "12px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f2f5", borderBottom: "1px solid #e5e4e7" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Date</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Doctor</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Diagnosis</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Department</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}></th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id} style={{ borderBottom: "1px solid #e5e4e7" }}>
                <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{record.date}</td>
                <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{record.doctor}</td>
                <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{record.diagnosis}</td>
                <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{record.department}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button 
                    onClick={() => setSelectedRecord(record)}
                    style={{
                      background: "#1b3a6b",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setSelectedRecord(null)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, color: "#1a1a2e" }}>Visit Details</h2>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6a6a8a"
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <p style={{ marginBottom: "8px", color: "#1a1a2e" }}><strong>Date:</strong> {selectedRecord.date}</p>
              <p style={{ marginBottom: "8px", color: "#1a1a2e" }}><strong>Doctor:</strong> {selectedRecord.doctor}</p>
              <p style={{ marginBottom: "8px", color: "#1a1a2e" }}><strong>Department:</strong> {selectedRecord.department}</p>
              <p style={{ marginBottom: "8px", color: "#1a1a2e" }}><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
              <p style={{ marginBottom: "8px", color: "#1a1a2e" }}><strong>Symptoms:</strong> {selectedRecord.symptoms}</p>
              <p style={{ marginBottom: "8px", color: "#1a1a2e" }}><strong>Prescription:</strong> {selectedRecord.prescription}</p>
            </div>
            
            <button 
              onClick={() => setSelectedRecord(null)}
              style={{
                background: "#1b3a6b",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalHistory