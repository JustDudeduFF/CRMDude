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
  const reference = ref(db, 'Subscriber');
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
    fileData.forEach(async(row) => {
      const ledgerkey = Date.now();
      // Map each row of Excel data to the userData structure
      // const planData = {
      //   bandwidth:row.BANDWIDTH,
      //   periodtime:row.Months,
      //   planamount:row.PLANAMOUNT,
      //   planname:row.Plan,
      //   planperiod:row.Period
      // }

      
      const userData = {
        company: row.COMPANYNAME,
        fullName: row.FULLNAME,
        username: String(row.BBUSERNAME), // Correct field for username
        mobileNo: String(row.MOBILE),
        alternatNo: row.LANDLINENO,
        email: row.EMAIL,
        installationAddress: row.FULLADDRESSINST,
        colonyName: row.COLONYNAME,
        state: row.STATE,
        pinCode: row.PINCODE,
        connectionDetails: {
          isp: row.ISP,
          planName: row.PRODUCTNAME,
          planAmount: parseInt(row.PLANAMOUNT),
          securityDeposit: row.securityDeposit,
          refundableAmount: row.refundableAmount,
          activationDate: row.STARTDATE,
          expiryDate: row.ENDDATE,
          conectiontyp: row.CONNECTIONTYP,
          dueAmount: row.BALANCENUMERIC,
          bandwidth: row.BANDWIDTH
        },
        inventoryDeviceDetails: {
          deviceMaker: row.deviceMaker,
          deviceSerialNumber: row.deviceSerialNumber,
          connectionPowerInfo: row.connectionPowerInfo,
        },


        createdAt: row.REGDATE,
      };

      

      const ledgerdata = {
        type:'Migration',
        date: new Date().toISOString().split('T')[0],
        particular: `Migration Due Amount`,
        debitamount: parseInt(row.BALANCENUMERIC),
        creditamount: 0
      }

      // Remove undefined values before sending data to Firebase
      const cleanedUserData = removeUndefinedValues(userData);
      const cleanLedgerData = removeUndefinedValues(ledgerdata);
      

      // Store user under their username
      const userRef = ref(db, 'Subscriber/' + row.BBUSERNAME);
      const ledgerRef = ref(db, `Subscriber/${row.BBUSERNAME}/ledger/${ledgerkey}` );
      await update(userRef, cleanedUserData)
        .then(async() => {
          await update(ledgerRef, cleanLedgerData);
          console.log(`Data for ${row.BBUSERNAME} uploaded successfully!`);
        })
        .catch((error) => {
          console.error(`Error uploading data for ${row.BBUSERNAME}: `, error);
        });

    // await set(ref(db, `Master/Broadband Plan/${row.Code}`), planData).then(() => {
    //   alert('All Plan Added')
    // });
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
    