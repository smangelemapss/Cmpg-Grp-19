import { useState, useEffect } from 'react'
import { 
  getEmergencyContacts, 
  createEmergencyContact, 
  updateEmergencyContact, 
  deleteEmergencyContact 
} from '../services/api'

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    label: 'Emergency'
  })

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await getEmergencyContacts()
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingContact) {
        await updateEmergencyContact(editingContact.id, formData)
      } else {
        await createEmergencyContact(formData)
      }
      setShowForm(false)
      setEditingContact(null)
      setFormData({ name: '', relationship: '', phone: '', label: 'Emergency' })
      loadContacts()
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      label: contact.label || 'Emergency'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteEmergencyContact(id)
        loadContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContact(null)
    setFormData({ name: '', relationship: '', phone: '', label: 'Emergency' })
  }

  if (loading) {
    return <div>Loading emergency contacts...</div>
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Emergency Contacts</h1>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>
          + Add Contact
        </button>
      </div>
      <p style={styles.subtitle}>These contacts will be notified in case of emergency</p>

      {contacts.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No emergency contacts added yet.</p>
          <button style={styles.emptyBtn} onClick={() => setShowForm(true)}>
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div style={styles.contactsList}>
          {contacts.map((contact) => (
            <div key={contact.id} style={styles.contactCard}>
              <div style={styles.contactHeader}>
                <div>
                  <h3 style={styles.contactName}>{contact.name}</h3>
                  <p style={styles.contactRelationship}>{contact.relationship}</p>
                </div>
                <div style={styles.contactBadge}>
                  {contact.label}
                </div>
              </div>
              <div style={styles.contactInfo}>
                <p><strong>Phone:</strong> {contact.phone}</p>
              </div>
              <div style={styles.contactActions}>
                <button style={styles.editBtn} onClick={() => handleEdit(contact)}>
                  Edit
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(contact.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={styles.modalOverlay} onClick={handleCancel}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingContact ? 'Edit Contact' : 'Add Emergency Contact'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Relationship *</label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Father, Mother, Spouse"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 071 234 5678"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Label</label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingContact ? 'Update' : 'Save'} Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: '28px',
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  subtitle: {
    color: '#666',
    marginBottom: '30px',
  },
  contactsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  contactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  contactName: {
    fontSize: '18px',
    marginBottom: '5px',
  },
  contactRelationship: {
    color: '#666',
    fontSize: '14px',
  },
  contactBadge: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  contactInfo: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    marginBottom: '15px',
  },
  contactActions: {
    display: 'flex',
    gap: '10px',
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  emptyBtn: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '5px',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

export default EmergencyContacts