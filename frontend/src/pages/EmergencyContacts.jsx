import { useState } from 'react'

const initialContacts = [
  { id: 1, name: "Thabo Dlamini", relationship: "Father", phone: "071 234 5678", label: "Emergency" },
  { id: 2, name: "Nomsa Dlamini", relationship: "Mother", phone: "082 987 6543", label: "Home" },
]

function EmergencyContacts() {
  const [contacts, setContacts] = useState(initialContacts)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    label: 'Emergency'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      label: 'Emergency'
    })
    setIsAdding(false)
    setIsEditing(null)
  }

  const handleAdd = () => {
    if (!formData.name || !formData.relationship || !formData.phone) {
      alert('Please fill in all fields')
      return
    }
    const newContact = {
      id: Date.now(),
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      label: formData.label
    }
    setContacts([...contacts, newContact])
    resetForm()
  }

  const handleEdit = (contact) => {
    setIsEditing(contact.id)
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      label: contact.label || 'Emergency'
    })
  }

  const handleSaveEdit = () => {
    if (!formData.name || !formData.relationship || !formData.phone) {
      alert('Please fill in all fields')
      return
    }
    setContacts(contacts.map(contact =>
      contact.id === isEditing
        ? {
            ...contact,
            name: formData.name,
            relationship: formData.relationship,
            phone: formData.phone,
            label: formData.label
          }
        : contact
    ))
    resetForm()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id))
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, color: "#1a1a2e" }}>Emergency Contacts</h1>
        {!isAdding && !isEditing && (
          <button 
            onClick={() => setIsAdding(true)}
            style={{ background: "#1b3a6b", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
          >
            + Add New Contact
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          border: "1px solid #e5e4e7"
        }}>
          <h3 style={{ marginBottom: "16px", color: "#1a1a2e" }}>{isAdding ? "Add New Contact" : "Edit Contact"}</h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#1a1a2e" }}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Thabo Dlamini"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e4e7", color: "#1a1a2e" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#1a1a2e" }}>Relationship *</label>
            <input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              placeholder="e.g., Father, Mother, Sister"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e4e7", color: "#1a1a2e" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#1a1a2e" }}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 071 234 5678"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e4e7", color: "#1a1a2e" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#1a1a2e" }}>Contact Label</label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e5e4e7", color: "#1a1a2e" }}
            >
              <option value="Emergency">🚨 Emergency</option>
              <option value="Home">🏠 Home</option>
              <option value="Work">💼 Work</option>
              <option value="Other">📱 Other</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={resetForm}
              style={{ padding: "10px 20px", background: "transparent", border: "1px solid #e5e4e7", borderRadius: "8px", cursor: "pointer", color: "#1a1a2e" }}
            >
              Cancel
            </button>
            <button
              onClick={isAdding ? handleAdd : handleSaveEdit}
              style={{ padding: "10px 20px", background: "#1b3a6b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              {isAdding ? "Add Contact" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: "12px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f2f5", borderBottom: "1px solid #e5e4e7" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Name</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Relationship</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Phone</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Label</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#1a1a2e", fontWeight: "600" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#6a6a8a" }}>
                  No emergency contacts added yet. Click "Add New Contact" to get started.
                </td>
              </tr>
            ) : (
              contacts.map(contact => (
                <tr key={contact.id} style={{ borderBottom: "1px solid #e5e4e7" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "500", color: "#1a1a2e" }}>{contact.name}</td>
                  <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>{contact.relationship}</td>
                  <td style={{ padding: "12px 16px", color: "#1a1a2e" }}>
                    <a href={`tel:${contact.phone}`} style={{ color: "#1b3a6b", textDecoration: "none" }}>
                      {contact.phone}
                    </a>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: contact.label === "Emergency" ? "rgba(198, 40, 40, 0.1)" : "rgba(27, 58, 107, 0.1)",
                      color: contact.label === "Emergency" ? "#c62828" : "#1b3a6b"
                    }}>
                      {contact.label === "Emergency" ? "🚨 " : ""}{contact.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(contact)}
                        style={{ padding: "6px 12px", background: "#1b3a6b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        style={{ padding: "6px 12px", background: "#c62828", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "16px", background: "rgba(27, 58, 107, 0.05)", borderRadius: "8px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#3a3a5a" }}>
          💡 <strong>Tip:</strong> Add at least 2 emergency contacts. These will be visible to clinic staff in case of emergency.
        </p>
      </div>
    </div>
  )
}

export default EmergencyContacts