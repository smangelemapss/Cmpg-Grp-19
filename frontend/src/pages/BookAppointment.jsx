import { useState } from 'react'

const doctors = [
  { id: 1, name: "Dr. D. Sithole", specialization: "General Practice", available: true },
  { id: 2, name: "Dr. M. Khumalo", specialization: "Mental Health", available: true },
  { id: 3, name: "Dr. Nkosi", specialization: "General Practice", available: true },
  { id: 4, name: "Dr. Patel", specialization: "Mental Health", available: false },
]

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

function BookAppointment() {
  const [step, setStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [reasonForVisit, setReasonForVisit] = useState('')
  const [visitType, setVisitType] = useState('in-person')

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setStep(2)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setStep(3)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setStep(4)
  }

  const handleSubmit = () => {
    const booking = {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      reason: reasonForVisit,
      type: visitType
    }
    console.log('Appointment booked:', booking)
    alert(`✅ Appointment booked with ${selectedDoctor.name} on ${selectedDate} at ${selectedTime}`)
    // Reset
    setStep(1)
    setSelectedDoctor(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setReasonForVisit('')
  }

  const currentMonth = "May 2026"
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dates = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px" }}>Book An Appointment</h1>
      
      {/* Progress Steps */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "32px",
        position: "relative"
      }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: step >= s ? "#1b3a6b" : "#e5e4e7",
              color: step >= s ? "white" : "#8a8fa8",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 8px",
              fontWeight: "bold"
            }}>
              {s}
            </div>
            <div style={{ fontSize: "12px", color: step >= s ? "#1a1a2e" : "#8a8fa8" }}>
              {s === 1 && "Select Doctor"}
              {s === 2 && "Choose Date"}
              {s === 3 && "Select Time"}
              {s === 4 && "Reason"}
              {s === 5 && "Confirm"}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1 - Select Doctor */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Specialization</label>
            <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e4e7" }}>
              <option>All Specializations</option>
              <option>General Practice</option>
              <option>Mental Health</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Visit Type</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setVisitType('in-person')}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: visitType === 'in-person' ? "#1b3a6b" : "white",
                  color: visitType === 'in-person' ? "white" : "#1a1a2e",
                  border: "1px solid #e5e4e7",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                🏥 In Person
              </button>
              <button 
                onClick={() => setVisitType('virtual')}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: visitType === 'virtual' ? "#1b3a6b" : "white",
                  color: visitType === 'virtual' ? "white" : "#1a1a2e",
                  border: "1px solid #e5e4e7",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                💻 Virtual
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: "16px" }}>Select Doctor</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {doctors.filter(d => d.available).map(doctor => (
              <div key={doctor.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                border: "1px solid #e5e4e7",
                borderRadius: "12px",
                background: "white"
              }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{doctor.name}</div>
                  <div style={{ fontSize: "14px", color: "#8a8fa8" }}>{doctor.specialization}</div>
                </div>
                <button 
                  onClick={() => handleDoctorSelect(doctor)}
                  style={{
                    background: "#1b3a6b",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 - Select Date */}
      {step === 2 && (
        <div>
          <div style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e5e4e7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>←</button>
              <h3>{currentMonth}</h3>
              <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>→</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "10px" }}>
              {days.map(day => <div key={day} style={{ fontWeight: "bold", padding: "8px" }}>{day}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  style={{
                    padding: "10px",
                    background: selectedDate === date ? "#1b3a6b" : "transparent",
                    color: selectedDate === date ? "white" : "#1a1a2e",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 - Select Time */}
      {step === 3 && (
        <div>
          <h3 style={{ marginBottom: "16px" }}>Available Slots - {currentMonth} {selectedDate}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {timeSlots.map(slot => (
              <button
                key={slot}
                onClick={() => handleTimeSelect(slot)}
                style={{
                  padding: "12px",
                  background: selectedTime === slot ? "#1b3a6b" : "white",
                  color: selectedTime === slot ? "white" : "#1a1a2e",
                  border: "1px solid #e5e4e7",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 - Reason for Visit */}
      {step === 4 && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Reason For Visit</label>
            <textarea
              rows={5}
              placeholder="Describe your symptoms or reason for visit..."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e4e7",
                fontFamily: "inherit"
              }}
            />
          </div>
          <button 
            onClick={handleSubmit}
            style={{
              background: "#1b3a6b",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Confirm Appointment
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      {step > 1 && step < 4 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e4e7" }}>
          <button 
            onClick={() => setStep(step - 1)}
            style={{
              background: "transparent",
              border: "1px solid #e5e4e7",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Back
          </button>
          <button 
            onClick={() => setStep(step + 1)}
            style={{
              background: "#1b3a6b",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export default BookAppointment