import { ref, set, remove, update } from 'firebase/database';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../FirebaseConfig';
import './BulkUserEntry.css';

const sampleSubscriberRow = {
  COMPANYNAME: 'Demo Company',
  FULLNAME: 'Rahul Sharma',
  BBUSERNAME: 'rahul123',
  MOBILE: '9876543210',
  LANDLINENO: '',
  EMAIL: 'rahul@example.com',
  FULLADDRESSINST: 'House No. 12, Main Road',
  COLONYNAME: 'Green Colony',
  STATE: 'Delhi',
  PINCODE: '110001',
  ISP: 'Demo ISP',
  PRODUCTNAME: '50 Mbps Unlimited',
  PLANAMOUNT: 599,
  STARTDATE: '2026-05-01',
  ENDDATE: '2026-06-01',
  CONNECTIONTYP: 'Fiber',
  BALANCENUMERIC: 0,
  BANDWIDTH: '50 Mbps',
  REGDATE: '2026-05-01',
  securityDeposit: 0,
  refundableAmount: 0,
  deviceMaker: 'ONU Maker',
  deviceSerialNumber: 'SN123456',
  connectionPowerInfo: '-20 dBm',
};

const samplePlanRow = {
  PLANNAME: '50 Mbps Unlimited',
  AMOUNT: 599,
  PERIOD: 'Monthly',
  TIME: 1,
};

const removeUndefinedValues = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      removeUndefinedValues(obj[key]);
    } else if (obj[key] === undefined) {
      obj[key] = null;
    }
  });

  return obj;
};

function convertExcelDateSerial(input) {
  if (!input) return '';

  if (input instanceof Date) {
    return input.toISOString().split('T')[0];
  }

  const value = String(input).trim();

  if (/^\d+$/.test(value)) {
    const excelDateSerial = parseInt(value, 10);
    const baseDate = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(baseDate.getTime() + excelDateSerial * 86400000);

    return date.toISOString().split('T')[0];
  }

  return value;
}

export default function BulkUserEntry() {
  const [fileData, setFileData] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setFileData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadPredefinedSheet = () => {
    const workbook = XLSX.utils.book_new();

    const subscriberSheet = XLSX.utils.json_to_sheet([sampleSubscriberRow]);
    const planSheet = XLSX.utils.json_to_sheet([samplePlanRow]);

    XLSX.utils.book_append_sheet(workbook, subscriberSheet, 'Subscribers');
    XLSX.utils.book_append_sheet(workbook, planSheet, 'Plans');

    XLSX.writeFile(workbook, 'bulk-upload-template.xlsx');
  };

  const deleteRef = async (event) => {
    event.preventDefault();

    if (!window.confirm('Are you sure you want to delete all subscribers?')) {
      return;
    }

    const reference = ref(db, 'Subscriber');
    await remove(reference);
    alert('All subscribers deleted');
  };

  const uploadPlansData = (event) => {
    event.preventDefault();

    fileData.forEach((row) => {
      const planData = {
        planname: row.PLANNAME,
        planamount: row.AMOUNT,
        planperiod: row.PERIOD,
        periodtime: row.TIME,
      };

      const planRef = ref(db, `Master/Broadband Plan/${Date.now()}`);

      set(planRef, removeUndefinedValues(planData))
        .then(() => {
          console.log('Plan Uploaded');
        })
        .catch((error) => {
          console.log(`Failed Upload: ${error}`);
        });
    });
  };

  const uploadToFirebase = (event) => {
    event.preventDefault();

    fileData.forEach(async (row, index) => {
      const ledgerkey = Date.now() + index;

      const userData = {
        company: row.COMPANYNAME,
        fullName: row.FULLNAME,
        username: String(row.BBUSERNAME || ''),
        mobileNo: String(row.MOBILE || ''),
        alternatNo: row.LANDLINENO,
        email: row.EMAIL,
        installationAddress: row.FULLADDRESSINST,
        colonyName: row.COLONYNAME,
        state: row.STATE,
        pinCode: row.PINCODE,
        connectionDetails: {
          isp: row.ISP,
          planName: row.PRODUCTNAME,
          planAmount: Number(row.PLANAMOUNT || 0),
          securityDeposit: row.securityDeposit,
          refundableAmount: row.refundableAmount,
          activationDate: convertExcelDateSerial(row.STARTDATE),
          expiryDate: convertExcelDateSerial(row.ENDDATE),
          conectiontyp: row.CONNECTIONTYP,
          dueAmount: row.BALANCENUMERIC,
          bandwidth: row.BANDWIDTH,
        },
        inventoryDeviceDetails: {
          deviceMaker: row.deviceMaker,
          deviceSerialNumber: row.deviceSerialNumber,
          connectionPowerInfo: row.connectionPowerInfo,
        },
        createdAt: convertExcelDateSerial(row.REGDATE),
      };

      const ledgerdata = {
        type: 'Migration',
        date: new Date().toISOString().split('T')[0],
        particular: 'Migration Due Amount',
        debitamount: parseInt(row.BALANCENUMERIC || 0),
        creditamount: 0,
      };

      const cleanedUserData = removeUndefinedValues(userData);
      const cleanLedgerData = removeUndefinedValues(ledgerdata);

      const userRef = ref(db, `Subscriber/${row.MOBILE}${ledgerkey}`);
      const ledgerRef = ref(db, `Subscriber/${row.MOBILE}${ledgerkey}/ledger/${ledgerkey}`);

      await update(userRef, cleanedUserData)
        .then(async () => {
          await update(ledgerRef, cleanLedgerData);
          console.log(`Data for ${row.BBUSERNAME} uploaded successfully!`);
        })
        .catch((error) => {
          console.error(`Error uploading data for ${row.BBUSERNAME}: `, error);
        });
    });
  };

  return (
    <div className="bulk-user-page">
      <div className="bulk-user-header">
        <div>
          <p className="bulk-user-eyebrow">Excel Import</p>
          <h2>Bulk User Entry</h2>
          <p>Upload subscribers or broadband plans directly from an Excel sheet.</p>
        </div>

        <button
          type="button"
          className="bulk-btn bulk-btn-outline"
          onClick={downloadPredefinedSheet}
        >
          Download Predefined Sheet
        </button>
      </div>

      <form className="bulk-upload-panel">
        <div className="bulk-upload-box">
          <label htmlFor="bulkFile" className="bulk-file-label">
            Select Excel File
          </label>

          <input
            id="bulkFile"
            className="bulk-file-input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />

          <div className="bulk-file-info">
            <strong>{fileName || 'No file selected'}</strong>
            <span>{fileData.length} rows ready to upload</span>
          </div>
        </div>

        <div className="bulk-actions">
          <button
            onClick={uploadToFirebase}
            className="bulk-btn bulk-btn-success"
            disabled={!fileData.length}
          >
            Upload Subscriber
          </button>

          <button
            onClick={uploadPlansData}
            className="bulk-btn bulk-btn-primary"
            disabled={!fileData.length}
          >
            Upload Plans
          </button>

          <button className="bulk-btn bulk-btn-danger" onClick={deleteRef}>
            Delete All Subscribers
          </button>
        </div>
      </form>
    </div>
  );
}
