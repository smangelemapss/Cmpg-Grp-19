import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

const QRDisplay = ({ doctorId, doctorName }) => {
  const [qrValue, setQrValue] = useState('');
  const [selectedType, setSelectedType] = useState('checkin');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    generateQRValue();
    const interval = setInterval(() => { generateQRValue(); setLastRefresh(new Date()); }, 300000);
    return () => clearInterval(interval);
  }, [selectedType, doctorId]);

  const generateQRValue = () => {
    const baseUrl = window.location.origin;
    const values = { checkin: `${baseUrl}/patient/checkin?doctor=${doctorId}&t=${Date.now()}`, booking: `${baseUrl}/patient/book?doctor=${doctorId}&t=${Date.now()}`, queue: `${baseUrl}/patient/queue?doctor=${doctorId}&t=${Date.now()}` };
    setQrValue(values[selectedType]);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `doctor_${doctorId}_${selectedType}_qr.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold">QR Code Display</h2><div className="text-sm text-gray-500">Last refreshed: {lastRefresh.toLocaleTimeString()}</div></div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center"><div className="bg-white p-6 rounded-xl shadow-lg border"><QRCode id="qr-code-canvas" value={qrValue} size={280} level="H" includeMargin={true} renderAs="canvas" /></div><div className="mt-6 flex space-x-3"><button onClick={downloadQR} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Download QR</button></div></div>
        <div className="space-y-6">
          <div><label className="block text-sm font-medium mb-2">Select QR Type</label><div className="grid grid-cols-3 gap-3">{['checkin', 'booking', 'queue'].map(type => (<button key={type} onClick={() => setSelectedType(type)} className={`p-3 border rounded-lg text-center transition ${selectedType === type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}><div className="font-medium capitalize">{type}</div><div className="text-xs text-gray-500">{type === 'checkin' ? 'Patient check-in' : type === 'booking' ? 'New appointment' : 'Queue status'}</div></button>))}</div></div>
          <div className="bg-blue-50 p-4 rounded-lg"><h3 className="font-medium text-blue-900 mb-2">How to use:</h3><ul className="text-sm text-blue-800 space-y-1"><li>1. Place QR code at consultation room entrance</li><li>2. Patients scan with phone camera</li><li>3. QR auto-refreshes every 5 minutes</li></ul></div>
          <div className="border-t pt-4"><label className="block text-sm font-medium mb-2">Direct URL:</label><div className="flex"><input type="text" value={qrValue} readOnly className="flex-1 px-3 py-2 border rounded-l-lg bg-gray-50 text-sm" /><button onClick={() => { navigator.clipboard.writeText(qrValue); alert('Copied!'); }} className="px-3 py-2 bg-gray-600 text-white rounded-r-lg">Copy</button></div></div>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;