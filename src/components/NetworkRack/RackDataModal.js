import React, { useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';

export default function RackDataModal({show, RackRef}) {
  const [rackName, setRackName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [devices, setDevices] = useState([]);

  const officename = RackRef[0].officename;
  const roomname = RackRef[0].roomname;


  

  const addDevice = () => {
    setDevices([
      ...devices,
      {
        device_type: '',
        serial_no: '',
        model: '',
        ip_address: '',
        pon_port_range: '',
        ports: []
      }
    ]);
  };

  const handleDeviceChange = (index, field, value) => {
    const newDevices = [...devices];
    newDevices[index][field] = value;

    // Automatically generate ports based on PON port range
    if (field === 'pon_port_range' && value.includes('-')) {
      const [start, end] = value.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        const newPorts = [];
        for (let i = start; i <= end; i++) {
          newPorts.push({
            port_no: i,
            pon: true,
            connected_to: '',
            connected_port: ''
          });
        }
        newDevices[index].ports = newPorts;
      }
    }

    setDevices(newDevices);
  };


  const handleSubmit = () => {
    const db = getDatabase();
    const rackId = `rack_${Date.now()}`;

    // Write rack data to Firebase
    set(ref(db, `Rack Info/${officename}/${roomname}/` + rackId), {
      rack_name: rackName,
      location: location,
      description: description,
      devices: devices
    });

    alert('Rack data saved successfully!');
  };

  if (!show) return null

  return (
    <div style={{position:'fixed', right:'30%', left:'30%', top:'10%', background:'white', padding:'10px', border:'1px solid gray', borderRadius:'10px', maxHeight:'75vh', overflow:'hidden', overflowY:'auto', scrollbarWidth:'thin'}}>
      <h2>Add Rack Details</h2>

      <div className="form-group">
        <label className="form-label mt-2">Rack Name:</label>
        <input
          type="text"
          className="form-control"
          value={rackName}
          onChange={(e) => setRackName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label mt-2">Location:</label>
        <input
          type="text"
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label mt-2">Description:</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <h3 className='mt-4'>Add Devices</h3>
      {devices.map((device, deviceIndex) => (
        <div key={deviceIndex} className="device-form">
          <h5>Device {deviceIndex + 1}</h5>
          <div className="form-group">
            <label className="form-label mt-2">Device Type:</label>
            <select
              className="form-control"
              value={device.device_type}
              onChange={(e) => handleDeviceChange(deviceIndex, 'device_type', e.target.value)}
            >
              <option value="">Select Device Type</option>
              <option value="OLT">OLT</option>
              <option value="Switch">Switch</option>
              <option value="FMS">FMS</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label mt-2">Serial Number:</label>
            <input
              type="text"
              className="form-control"
              value={device.serial_no}
              onChange={(e) => handleDeviceChange(deviceIndex, 'serial_no', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label mt-2">Model:</label>
            <input
              type="text"
              className="form-control"
              value={device.model}
              onChange={(e) => handleDeviceChange(deviceIndex, 'model', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label mt-2">IP Address:</label>
            <input
              type="text"
              className="form-control"
              value={device.ip_address}
              onChange={(e) => handleDeviceChange(deviceIndex, 'ip_address', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label mt-2">Device Maker:</label>
            <input
              type="text"
              className="form-control"
              value={device.device_maker}
              onChange={(e) => handleDeviceChange(deviceIndex, 'device_maker', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label mt-2">PON Port Range:</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., 1-4"
              value={device.pon_port_range}
              onChange={(e) => handleDeviceChange(deviceIndex, 'pon_port_range', e.target.value)}
            />
          </div>

          <h4 className='mt-4'>Add Ports</h4>
          {device.ports.map((port, portIndex) => (
            <div key={portIndex} className="port-form">
              <div className="form-group">
                <label className="form-label mt-2">PON Number:</label>
                <input
                  type="number"
                  className="form-control"
                  value={port.port_no}
                  readOnly
                />
              </div>

            </div>
          ))}
        </div>
      ))}

      <button className="btn btn-secondary" onClick={addDevice}>
        + Add Device
      </button>

      <button className="btn btn-primary" onClick={handleSubmit}>
        Save Rack
      </button>
    </div>
  );
}
