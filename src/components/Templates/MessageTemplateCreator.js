import React, { useState } from 'react';

export default function BsonToJsonConverter() {
  const [status, setStatus] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const convertBsonData = async () => {
    try {
      setStatus('Processing BSON file...');
      
      // Read the BSON file
      const bsonData = await window.fs.readFile('employees.bson');
      const textContent = new TextDecoder('utf-8').decode(bsonData);
      
      const employees = [];
      
      // Split by FULLNAME to get individual employee records
      const parts = textContent.split('FULLNAME');
      
      for (let i = 1; i < parts.length; i++) {
        const part = 'FULLNAME' + parts[i];
        const employee = parseEmployeeData(part);
        if (employee.fullname) {
          employees.push(employee);
        }
      }
      
      setJsonData(employees);
      setStatus(`Conversion complete! Found ${employees.length} employees.`);
      setShowPreview(true);
      
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const parseEmployeeData = (text) => {
    const employee = {};
    
    // Helper function to extract data between patterns
    const extract = (start, end) => {
      const startIndex = text.indexOf(start);
      if (startIndex === -1) return '';
      
      const endIndex = text.indexOf(end, startIndex + start.length);
      if (endIndex === -1) return '';
      
      const result = text.substring(startIndex + start.length, endIndex);
      return result.replace(/[^\x20-\x7E]/g, '').trim();
    };
    
    // Extract basic information
    employee.fullname = extract('FULLNAME', 'MOBILE');
    employee.mobile = extract('MOBILE', 'GMAIL');
    employee.email = extract('GMAIL', 'ADDRESS');
    employee.address = extract('ADDRESS', 'DESIGNATION');
    employee.designation = extract('DESIGNATION', 'USERTYPE');
    employee.usertype = extract('USERTYPE', 'MARKING_OFFICE');
    employee.marking_office = extract('MARKING_OFFICE', 'INTIME_H');
    
    // Extract time data
    const intimeH = text.match(/INTIME_H(\d+)/);
    const intimeM = text.match(/INTIME_M(\d+)/);
    const outtimeH = text.match(/OUTTIME_H(\d+)/);
    const outtimeM = text.match(/OUTTIME_M(\d+)/);
    
    if (intimeH && intimeM) {
      employee.in_time = `${intimeH[1]}:${intimeM[1].padStart(2, '0')}`;
    }
    if (outtimeH && outtimeM) {
      employee.out_time = `${outtimeH[1]}:${outtimeM[1].padStart(2, '0')}`;
    }
    
    // Extract identification
    const aadhar = text.match(/AADHAR(\d+)/);
    if (aadhar && aadhar[1]) employee.aadhar = aadhar[1];
    
    const pan = extract('PAN', 'DRIVING');
    if (pan) employee.pan = pan;
    
    const driving = extract('DRIVING', 'BANKNAME');
    if (driving) employee.driving_license = driving;
    
    // Extract banking info
    const bankDetails = {};
    const bankname = extract('BANKNAME', 'ACCOUNTNAME');
    if (bankname) bankDetails.bank_name = bankname;
    
    const accountname = extract('ACCOUNTNAME', 'ACCOUNTNO');
    if (accountname) bankDetails.account_name = accountname;
    
    const accountno = extract('ACCOUNTNO', 'IFSC');
    if (accountno) bankDetails.account_no = accountno;
    
    const ifsc = extract('IFSC', 'UPI');
    if (ifsc) bankDetails.ifsc = ifsc;
    
    const upi = extract('UPI', 'pass');
    if (upi) bankDetails.upi = upi;
    
    if (Object.keys(bankDetails).length > 0) {
      employee.bank_details = bankDetails;
    }
    
    // Extract password and status
    const pass = text.match(/pass(\w+)/);
    if (pass) employee.password = pass[1];
    
    const status = text.match(/status(\w+)/);
    if (status) employee.status = status[1];
    
    // Extract permissions
    const permissions = {};
    const permTypes = [
      { name: 'attendance', pattern: /attendencepermission([^_]*?)_id/ },
      { name: 'customer', pattern: /customerpermission([^_]*?)_id/ },
      { name: 'employee', pattern: /employeepermission([^_]*?)_id/ },
      { name: 'inventory', pattern: /inventorypermission([^_]*?)_id/ },
      { name: 'lead', pattern: /leadpermission([^_]*?)_id/ },
      { name: 'master', pattern: /masterpermission([^_]*?)_id/ },
      { name: 'message', pattern: /messagepermission([^_]*?)_id/ },
      { name: 'network', pattern: /networkpermission([^_]*?)_id/ },
      { name: 'payment', pattern: /paymentpermission([^_]*?)_id/ },
      { name: 'payout', pattern: /payoutpermission([^_]*?)_id/ }
    ];
    
    for (let permType of permTypes) {
      const match = text.match(permType.pattern);
      if (match && match[1]) {
        let perms = match[1].replace(/[^\x20-\x7EA-Z_]/g, '');
        const permArray = perms.match(/[A-Z][A-Z_]*(?=[A-Z]|$)/g) || [];
        permissions[permType.name] = permArray.filter(p => p.length > 1);
      }
    }
    
    if (Object.keys(permissions).length > 0) {
      employee.permissions = permissions;
    }
    
    return employee;
  };

  const downloadJson = () => {
    if (!jsonData) return;
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{marginTop:'5%'}} className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">BSON to JSON Converter</h1>
      <p className="mb-6 text-gray-600">Convert your employee BSON data to JSON format.</p>
      
      <div className="space-x-4 mb-6">
        <button 
          onClick={convertBsonData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Convert BSON to JSON
        </button>
        
        {jsonData && (
          <button 
            onClick={downloadJson}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Download JSON File
          </button>
        )}
      </div>
      
      {status && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800">{status}</p>
        </div>
      )}
      
      {showPreview && jsonData && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">JSON Preview</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto max-h-96 text-sm">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}