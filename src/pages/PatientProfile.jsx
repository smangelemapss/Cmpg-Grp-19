const patient = {
  name: "Sarah Dlamini",
  dob: "2003-04-12",
  student_id: "STU2021045",
  gender: "Female",
  email: "sarah@university.ac.za"
}

function PatientProfile() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Patient Profile</h2>
      <p><strong>Name:</strong> {patient.name}</p>
      <p><strong>Date of Birth:</strong> {patient.dob}</p>
      <p><strong>Student ID:</strong> {patient.student_id}</p>
      <p><strong>Gender:</strong> {patient.gender}</p>
      <p><strong>Email:</strong> {patient.email}</p>
    </div>
  )
}

export default PatientProfile