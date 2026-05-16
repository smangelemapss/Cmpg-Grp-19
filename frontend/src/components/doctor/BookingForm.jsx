import React, { useState, useEffect } from 'react';
import { getAvailableTimeslots, searchPatient, createAppointment } from '../../services/api';

const BookingForm = ({ doctorId, onBookingSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({ reason: '', appointment_type: 'SICK', priority: 'NORMAL' });

  useEffect(() => {
    if (selectedDate && doctorId) {
      loadAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const loadAvailableSlots = async () => {
    const slots = await getAvailableTimeslots(doctorId, selectedDate);
    setAvailableSlots(slots.filter(slot => slot.is_available));
  };

  const handlePatientSearch = async () => {
    if (patientSearch.length < 2) return;
    const results = await searchPatient(patientSearch);
    setSearchResults(results);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAppointment({
        doctor_id: doctorId,
        patient_id: selectedPatient.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        ...appointmentDetails
      });
      alert('Appointment booked successfully!');
      setStep(1);
      setSelectedDate('');
      setSelectedSlot(null);
      setSelectedPatient(null);
      setPatientSearch('');
      setAppointmentDetails({ reason: '', appointment_type: 'SICK', priority: 'NORMAL' });
      if (onBookingSuccess) onBookingSuccess();
    } catch (error) {
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Book New Appointment</h2>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[{ num: 1, label: 'Date & Time' }, { num: 2, label: 'Patient' }, { num: 3, label: 'Details' }].map((stepItem) => (
            <div key={stepItem.num} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepItem.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{stepItem.num}</div>
              {stepItem.num < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > stepItem.num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCreateAppointment}>
        {step === 1 && (
          <div className="space-y-6">
            <div><label className="block text-sm font-medium mb-2">Select Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg" required /></div>
            {selectedDate && (<div><label className="block text-sm font-medium mb-2">Available Time Slots</label><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{availableSlots.map((slot, idx) => (<button key={idx} type="button" onClick={() => setSelectedSlot(slot)} className={`p-3 border rounded-lg text-center transition ${selectedSlot === slot ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}><div className="font-medium">{slot.start_time}</div><div className="text-xs text-gray-500">to {slot.end_time}</div></button>))}</div></div>)}
            <div className="flex justify-end"><button type="button" onClick={() => setStep(2)} disabled={!selectedSlot} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Next</button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div><label className="block text-sm font-medium mb-2">Search Patient</label><div className="flex space-x-2"><input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Enter student number or name" className="flex-1 px-3 py-2 border rounded-lg" /><button type="button" onClick={handlePatientSearch} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Search</button></div>
            {searchResults.length > 0 && (<div className="mt-3 space-y-2">{searchResults.map(patient => (<div key={patient.id} onClick={() => setSelectedPatient(patient)} className={`p-3 border rounded-lg cursor-pointer ${selectedPatient?.id === patient.id ? 'border-blue-600 bg-blue-50' : 'hover:border-blue-300'}`}><div className="font-medium">{patient.first_name} {patient.last_name}</div><div className="text-sm text-gray-600">Student: {patient.student_number} | Phone: {patient.phone}</div></div>))}</div>)}</div>
            <div className="flex justify-between"><button type="button" onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg">Back</button><button type="button" onClick={() => setStep(3)} disabled={!selectedPatient} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Next</button></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div><label className="block text-sm font-medium mb-2">Reason for Visit</label><textarea value={appointmentDetails.reason} onChange={(e) => setAppointmentDetails({...appointmentDetails, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" required /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2">Type</label><select value={appointmentDetails.appointment_type} onChange={(e) => setAppointmentDetails({...appointmentDetails, appointment_type: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="SICK">Sick Visit</option><option value="FOLLOW_UP">Follow-up</option><option value="CHECKUP">Checkup</option></select></div><div><label className="block text-sm font-medium mb-2">Priority</label><select value={appointmentDetails.priority} onChange={(e) => setAppointmentDetails({...appointmentDetails, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="NORMAL">Normal</option><option value="URGENT">Urgent</option></select></div></div>
            <div className="bg-gray-50 p-4 rounded-lg"><h3 className="font-medium mb-2">Summary</h3><p><span className="text-gray-600">Date:</span> {selectedDate}</p><p><span className="text-gray-600">Time:</span> {selectedSlot?.start_time} - {selectedSlot?.end_time}</p><p><span className="text-gray-600">Patient:</span> {selectedPatient?.first_name} {selectedPatient?.last_name}</p></div>
            <div className="flex justify-between"><button type="button" onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg">Back</button><button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">{loading ? 'Booking...' : 'Confirm Appointment'}</button></div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;