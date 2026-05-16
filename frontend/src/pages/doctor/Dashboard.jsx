import React, { useState, useEffect } from 'react';
import DoctorCalendar from '../../components/doctor/DoctorCalendar';
import TimeslotManager from '../../components/doctor/TimeslotManager';
import BookingForm from '../../components/doctor/BookingForm';
import QRDisplay from '../../components/doctor/QRDisplay';
import QueueBoard from '../../components/doctor/QueueBoard';
import { getDoctorAppointments, getQueueEntries } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../layouts/MainLayout';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [appointments, setAppointments] = useState([]);
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const doctorInfo = {
    id: user?.id || 1,
    name: user?.name || 'Dr. John Doe',
    specialization: user?.specialization || 'General Practitioner',
    room: user?.room || 'Room 101'
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const appointmentsData = await getDoctorAppointments(doctorInfo.id);
        const queueData = await getQueueEntries(doctorInfo.id);
        setAppointments(appointmentsData);
        setQueueEntries(queueData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [doctorInfo.id]);

  const tabs = [
    { id: 'calendar', label: '📅 Calendar' },
    { id: 'timeslots', label: '⏰ Manage Timeslots' },
    { id: 'booking', label: '📝 Book Appointment' },
    { id: 'qr', label: '📱 QR Display' },
    { id: 'queue', label: '👥 Queue Board' }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-600">
                  {doctorInfo.name} • {doctorInfo.specialization} • {doctorInfo.room}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'calendar' && (
            <DoctorCalendar appointments={appointments} />
          )}
          {activeTab === 'timeslots' && (
            <TimeslotManager doctorId={doctorInfo.id} appointments={appointments} />
          )}
          {activeTab === 'booking' && (
            <BookingForm 
              doctorId={doctorInfo.id}
              onBookingSuccess={() => {
                getDoctorAppointments(doctorInfo.id).then(setAppointments);
              }}
            />
          )}
          {activeTab === 'qr' && (
            <QRDisplay doctorId={doctorInfo.id} doctorName={doctorInfo.name} />
          )}
          {activeTab === 'queue' && (
            <QueueBoard 
              queueEntries={queueEntries}
              doctorId={doctorInfo.id}
              onStatusUpdate={() => {
                getQueueEntries(doctorInfo.id).then(setQueueEntries);
              }}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;