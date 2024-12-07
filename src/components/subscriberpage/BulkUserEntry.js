import { ref, set, remove, update } from 'firebase/database';
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


const deleteRef = async() => {
  const reference = ref(db, 'Rack Info');
  await remove(reference);
  
  
}
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


  const uploadPlansData = (event) => {
    event.preventDefault();

    fileData.forEach((row) => {
      const planData = {
        planname: row.PLANNAME,
        planamount: row.AMOUNT,
        planperiod: row.PERIOD,
        periodtime: row.TIME

      }

      const planRef = ref(db , `Master/Broadband Plan/${Date.now()}`);
      
        set(planRef, planData).then(() => {
          console.log('Plan Uploaded')
        }).catch((error) => {
          console.log(`Failed Upload: ${error}`);
        });
      
    });

    
  }

  // Upload parsed data to Firebase Realtime Database
  const uploadToFirebase = (event) => {
    event.preventDefault(); // Prevent page reload
    console.log("function Run")
    const ledgerkey = Date.now();
    fileData.forEach(async(row) => {
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

      const ledgerdata = {
        type:'Migration',
        date: new Date().toISOString().split('T')[0],
        particular: `Migration Due Amount`,
        debitamount: row.BALANCENUMERIC,
        creditamount: 0
      }

      // Remove undefined values before sending data to Firebase
      const cleanedUserData = removeUndefinedValues(userData);

      // Store user under their username
      const userRef = ref(db, 'Subscriber/' + row.BBUSERNAME);
      const ledgerRef = ref(db, `Subscriber/${row.BBUSERNAME}/ledger/${ledgerkey}` );
      await set(userRef, cleanedUserData)
        .then(async() => {
          await update(ledgerRef, ledgerdata);
          console.log(`Data for ${row.BBUSERNAME} uploaded successfully!`);
        })
        .catch((error) => {
          console.error(`Error uploading data for ${row.BBUSERNAME}: `, error);
        });
    });
  };

  return (
    <div style={{ marginTop: '6%' }} className="ms-3">
      <form className="column g-3">
        <label className="form-lable">Select Excel File of Users</label>
        <input
          className="form-control"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        ></input>
        <button onClick={uploadToFirebase} className="btn btn-success">
          Upload Subscriber
        </button>

        <button onClick={uploadPlansData} className="btn btn-success">
          Upload Plans
        </button>
        <button className='btn btn-danger' onClick={deleteRef}>Delete all Subscriber</button>
      </form>
    </div>
  );
}
    