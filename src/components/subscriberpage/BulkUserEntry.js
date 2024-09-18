import { ref, set } from 'firebase/database';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../FirebaseConfig';

// Helper function to remove undefined values from an object
const removeUndefinedValues = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      removeUndefinedValues(obj[key]); // Recursively remove undefined values in nested objects
    } else if (obj[key] === undefined) {
      obj[key] = null; // Replace undefined with null (or you can set an empty string '')
    }
  });
  return obj;
};

export default function BulkUserEntry() {
  const [fileData, setFileData] = useState([]);

  // Function to handle file upload and parse Excel
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setFileData(jsonData); // Parsed Excel data as JSON
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Upload parsed data to Firebase Realtime Database
  const uploadToFirebase = (event) => {
    event.preventDefault(); // Prevent page reload

    fileData.forEach((row) => {
      // Map each row of Excel data to the userData structure
      const userData = {
        company: row.COMPANYNAME,
        fullName: row.FULLNAME,
        username: row.BBUSERNAME, // Correct field for username
        mobileNo: row.MOBILE,
        alternatNo: row.LANDLINENO,
        email: row.EMAIL,
        installationAddress: row.FULLADDRESSINST,
        colonyName: row.COLONYNAME,
        state: row.state,
        pinCode: row.pinCode,
        connectionDetails: {
          isp: row.ISP,
          planName: row.PRODUCTNAME,
          planAmount: row.PLANAMOUNT,
          securityDeposit: row.securityDeposit,
          refundableAmount: row.refundableAmount,
          activationDate: row.STARTDATE,
          expiryDate: row.ENDDATE,
          conectiontyp: row.conectiontyp,
          dueAmount: row.BALANCENUMERIC,
        },
        inventoryDeviceDetails: {
          deviceMaker: row.deviceMaker,
          deviceSerialNumber: row.deviceSerialNumber,
          connectionPowerInfo: row.connectionPowerInfo,
        },
        fieldFiberDetails: {
          connectedFMS: row.connectedFMS,
          connectedPortNo: row.connectedPortNo,
          uniqueJCNo: row.uniqueJCNo,
          fiberCoreNo: row.fiberCoreNo,
        },
        documents: {
          addressProof: {
            source: 'Manual',
            date: new Date().toISOString().split('T')[0],
            modifiedby: localStorage.getItem('Name'),
            documentname: 'Address Proof',
            url: row.addressProofURL,
          },
          cafDocuments: {
            source: 'Manual',
            date: new Date().toISOString().split('T')[0],
            modifiedby: localStorage.getItem('Name'),
            documentname: 'Caf Proof',
            url: row.cafDocumentsURL,
          },
          identityProof: {
            source: 'Manual',
            date: new Date().toISOString().split('T')[0],
            modifiedby: localStorage.getItem('Name'),
            documentname: 'Identity Proof',
            url: row.identityProofURL,
          },
        },
        createdAt: row.REGDATE,
      };

      // Remove undefined values before sending data to Firebase
      const cleanedUserData = removeUndefinedValues(userData);

      // Store user under their username
      const userRef = ref(db, 'Subscriber/' + row.BBUSERNAME);
      set(userRef, cleanedUserData)
        .then(() => {
          console.log(`Data for ${row.BBUSERNAME} uploaded successfully!`);
        })
        .catch((error) => {
          console.error(`Error uploading data for ${row.BBUSERNAME}: `, error);
        });
    });
  };

  return (
    <div style={{ marginTop: '6%' }} className="ms-3">
      <form className="column g-3" onSubmit={uploadToFirebase}>
        <label className="form-lable">Select Excel File of Users</label>
        <input
          className="form-control"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        ></input>
        <button type="submit" className="btn btn-success">
          Upload Data
        </button>
      </form>
    </div>
  );
}
    