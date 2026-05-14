import React, { useState, useEffect } from 'react';
import { getAvailableTimeslots, updateTimeslot, addTimeslot } from '../../services/api';

const TimeslotManager = ({ doctorId, appointments }) => {
  const [timeslots, setTimeslots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimeslot, setNewTimeslot] = useState({ start_time: '09:00', end_time: '09:30', max_patients: 2 });

  useEffect(() => {
    loadTimeslots();
  }, [selectedDate, doctorId]);

  const loadTimeslots = async () => {
    const data = await getAvailableTimeslots(doctorId, selectedDate);
    setTimeslots(data);
  };

  const handleToggleAvailability = async (slotId, currentStatus) => {
    await updateTimeslot(slotId, { is_available: !currentStatus });
    loadTimeslots();
  };

  const handleAddTimeslot = async (e) => {
    e.preventDefault();
    await addTimeslot({ doctor_id: doctorId, date: selectedDate, ...newTimeslot });
    setShowAddForm(false);
    setNewTimeslot({ start_time: '09:00', end_time: '09:30', max_patients: 2 });
    loadTimeslots();
  };

  const getBookedCount = (startTime) => {
    return appointments?.filter(app => app.date === selectedDate && app.start_time === startTime && app.status !== 'CANCELLED').length || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Timeslots</h2>
        <div className="flex space-x-4">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Timeslot</button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Timeslot</h3>
            <form onSubmit={handleAddTimeslot}>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Start Time</label><input type="time" value={newTimeslot.start_time} onChange={(e) => setNewTimeslot({...newTimeslot, start_time: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium mb-1">End Time</label><input type="time" value={newTimeslot.end_time} onChange={(e) => setNewTimeslot({...newTimeslot, end_time: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium mb-1">Max Patients</label><input type="number" min="1" max="5" value={newTimeslot.max_patients} onChange={(e) => setNewTimeslot({...newTimeslot, max_patients: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {timeslots.length === 0 ? (<div className="text-center py-12 text-gray-500">No timeslots configured for this date.</div>) : (
          timeslots.map((slot) => {
            const bookedCount = getBookedCount(slot.start_time);
            const isFull = bookedCount >= slot.max_patients;
            return (
              <div key={slot.id} className={`border rounded-lg p-4 flex justify-between items-center ${!slot.is_available ? 'bg-gray-100' : isFull ? 'bg-red-50' : 'bg-white'}`}>
                <div><div className="flex items-center space-x-4"><span className="font-medium">{slot.start_time} - {slot.end_time}</span><span className={`px-2 py-1 text-xs rounded-full ${slot.is_available && !isFull ? 'bg-green-100 text-green-800' : isFull ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{!slot.is_available ? 'Unavailable' : isFull ? 'Fully Booked' : `Available (${bookedCount}/${slot.max_patients})`}</span></div></div>
                <button onClick={() => handleToggleAvailability(slot.id, slot.is_available)} className={`px-3 py-1 text-sm rounded ${slot.is_available ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{slot.is_available ? 'Mark Unavailable' : 'Mark Available'}</button>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t">
        <h3 className="font-medium mb-2">Daily Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg"><div className="text-sm text-blue-600">Total Timeslots</div><div className="text-2xl font-bold text-blue-900">{timeslots.length}</div></div>
          <div className="bg-green-50 p-3 rounded-lg"><div className="text-sm text-green-600">Available</div><div className="text-2xl font-bold text-green-900">{timeslots.filter(s => s.is_available).length}</div></div>
          <div className="bg-yellow-50 p-3 rounded-lg"><div className="text-sm text-yellow-600">Booked</div><div className="text-2xl font-bold text-yellow-900">{appointments?.filter(a => a.date === selectedDate && a.status !== 'CANCELLED').length || 0}</div></div>
        </div>
      </div>
    </div>
  );
};

export default TimeslotManager;