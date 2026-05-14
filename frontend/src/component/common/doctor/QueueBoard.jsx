import React, { useState } from 'react';
import { updateQueueStatus } from '../../services/api';

const QueueBoard = ({ queueEntries, doctorId, onStatusUpdate }) => {
  const [filter, setFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const getStatusBadge = (status) => {
    const badges = { WAITING: 'bg-yellow-100 text-yellow-800', IN_PROGRESS: 'bg-blue-100 text-blue-800', COMPLETED: 'bg-green-100 text-green-800', LEFT_WITHOUT_SEEN: 'bg-red-100 text-red-800' };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateWaitTime = (checkInTime) => {
    const diffMinutes = Math.floor((new Date() - new Date(checkInTime)) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
  };

  const handleUpdateStatus = async (entryId, newStatus) => {
    await updateQueueStatus(entryId, { status: newStatus });
    if (onStatusUpdate) onStatusUpdate();
    setShowUpdateModal(false);
  };

  const filteredEntries = queueEntries.filter(entry => filter === 'all' || entry.status === filter).sort((a, b) => {
    if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
    if (a.priority !== 'URGENT' && b.priority === 'URGENT') return 1;
    return new Date(a.check_in_time) - new Date(b.check_in_time);
  });

  const waitingCount = queueEntries.filter(e => e.status === 'WAITING').length;
  const inProgressCount = queueEntries.filter(e => e.status === 'IN_PROGRESS').length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6"><h2 className="text-xl font-semibold mb-4">Queue Management Board</h2><div className="grid grid-cols-3 gap-4"><div className="bg-blue-50 p-3 rounded-lg"><div className="text-sm text-blue-600">Total</div><div className="text-2xl font-bold text-blue-900">{queueEntries.length}</div></div><div className="bg-yellow-50 p-3 rounded-lg"><div className="text-sm text-yellow-600">Waiting</div><div className="text-2xl font-bold text-yellow-900">{waitingCount}</div></div><div className="bg-green-50 p-3 rounded-lg"><div className="text-sm text-green-600">In Progress</div><div className="text-2xl font-bold text-green-900">{inProgressCount}</div></div></div></div>

      <div className="flex flex-wrap gap-4 mb-6"><div className="flex space-x-2">{['all', 'WAITING', 'IN_PROGRESS', 'COMPLETED'].map(status => (<button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{status === 'all' ? 'All' : status.replace('_', ' ')}</button>))}</div></div>

      <div className="space-y-3">
        {filteredEntries.length === 0 ? (<div className="text-center py-12 text-gray-500">No patients in queue</div>) : (
          filteredEntries.map((entry) => (<div key={entry.id} className="border rounded-lg p-4"><div className="flex justify-between items-start"><div className="flex-1"><div className="flex items-center mb-2"><span className="font-medium">{entry.patient_name}</span>{entry.priority === 'URGENT' && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-200 text-red-800">Urgent</span>}<span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusBadge(entry.status)}`}>{entry.status?.replace('_', ' ') || 'Waiting'}</span></div><div className="grid grid-cols-2 gap-2 text-sm text-gray-600"><div>Student: {entry.student_number}</div><div>Checked in: {calculateWaitTime(entry.check_in_time)}</div>{entry.reason && <div className="col-span-2">Reason: {entry.reason}</div>}</div></div><div className="flex space-x-2">{entry.status === 'WAITING' && (<button onClick={() => { setSelectedEntry(entry); setShowUpdateModal(true); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Start</button>)}{entry.status === 'IN_PROGRESS' && (<button onClick={() => handleUpdateStatus(entry.id, 'COMPLETED')} className="px-3 py-1 text-sm bg-green-600 text-white rounded">Complete</button>)}</div></div></div>))
        )}
      </div>

      {showUpdateModal && selectedEntry && (<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-md w-full"><h3 className="text-lg font-semibold mb-4">Start Consultation</h3><p><strong>Patient:</strong> {selectedEntry.patient_name}</p><p><strong>Student:</strong> {selectedEntry.student_number}</p><p><strong>Checked in:</strong> {new Date(selectedEntry.check_in_time).toLocaleString()}</p><p><strong>Reason:</strong> {selectedEntry.reason}</p><div className="flex justify-end space-x-3 mt-6"><button onClick={() => setShowUpdateModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button onClick={() => handleUpdateStatus(selectedEntry.id, 'IN_PROGRESS')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Start Consultation</button></div></div></div>)}
    </div>
  );
};

export default QueueBoard;