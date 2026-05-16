import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const DoctorCalendar = ({ appointments }) => {
  const [view, setView] = useState('week');

  const events = appointments?.map(app => ({
    id: app.id,
    title: `${app.patient_name} - ${app.reason || 'Consultation'}`,
    start: new Date(`${app.date}T${app.start_time}`),
    end: new Date(`${app.date}T${app.end_time}`),
    status: app.status,
    priority: app.priority
  })) || [];

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3B82F6';
    if (event.status === 'CONFIRMED') backgroundColor = '#10B981';
    if (event.status === 'IN_PROGRESS') backgroundColor = '#F59E0B';
    if (event.status === 'COMPLETED') backgroundColor = '#6B7280';
    if (event.status === 'CANCELLED') backgroundColor = '#EF4444';
    if (event.priority === 'URGENT') backgroundColor = '#DC2626';
    
    return {
      style: { backgroundColor, borderRadius: '6px', border: 'none', color: 'white', fontSize: '12px', padding: '2px 4px' }
    };
  };

  const handleSelectEvent = (event) => {
    const appointment = appointments?.find(a => a.id === event.id);
    alert(`Appointment Details:\nPatient: ${event.title}\nTime: ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}\nStatus: ${event.status}\nPriority: ${event.priority || 'Normal'}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Appointment Schedule</h2>
        <div className="flex space-x-2">
          <button onClick={() => setView('day')} className={`px-3 py-1 text-sm rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Day</button>
          <button onClick={() => setView('week')} className={`px-3 py-1 text-sm rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Week</button>
          <button onClick={() => setView('month')} className={`px-3 py-1 text-sm rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Month</button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded mr-1"></div><span>Scheduled</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-1"></div><span>Confirmed</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div><span>In Progress</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-gray-500 rounded mr-1"></div><span>Completed</span></div>
        <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-1"></div><span>Urgent</span></div>
      </div>
      <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 600 }} view={view} onView={setView} onSelectEvent={handleSelectEvent} eventPropGetter={eventStyleGetter} />
    </div>
  );
};

export default DoctorCalendar;