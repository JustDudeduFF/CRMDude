import React, { useState, useEffect } from 'react'
import { db } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';

export default function DashSecDiv() {

  const currentYear = new Date().getFullYear();
  const years = [];
  for(let i = 0; i < 5; i++){
    years.push(currentYear - i);
  }

  const [year, setYear] = useState(currentYear);
  const [userData, setUserData] = useState({});
  const [collectionData, setCollectionData] = useState([]);
  const [installationData, setInstallationData] = useState([]);
  const [ticketNatureData, setTicketNatureData] = useState({});

  
  

  useEffect(() => {
    // Create a hashmap of user data
    const userRef = ref(db, 'users');
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = {};
        snapshot.forEach((doc) => {
          const data = doc.val();
          users[doc.key] = data.FULLNAME; // Changed to fullname based on your data
        });
        setUserData(users);
      }
    });

    // Fetch collection data
    const collectionRef = ref(db, `Subscriber`);
    onValue(collectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const collections = [];
        snapshot.forEach((doc) => {
          const data = doc.child("payments");
          data.forEach((item) => {
            collections.push({
              userId: doc.key,
              ...item.val()
            });
          });
        });
        setCollectionData(collections);
      }
    });

    // Fetch installation data
    
    onValue(collectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const installations = [];
        snapshot.forEach((doc) => {
          installations.push(doc.val());
        });
        setInstallationData(installations);
      }
    });

    const ticketConcerns = ref(db, `Master/Tickets`);
    const globalTickets = ref(db, `Global Tickets`);
    
    onValue(ticketConcerns, (snapshot) => {
      if (snapshot.exists()) {
        const tickets = {};
        // Get all ticket concerns from Master
        snapshot.forEach((doc) => {
          tickets[doc.key] = 0; // Initialize count for each concern
        });

        // Count tickets from Global Tickets
        onValue(globalTickets, (snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((doc) => {
              const ticketData = doc.val();
              if (ticketData.ticketconcern && ticketData.assigndate) {
                const ticketDate = new Date(ticketData.assigndate);
                if (ticketDate.getFullYear() === parseInt(year)) {
                  if (tickets.hasOwnProperty(ticketData.ticketconcern)) {
                    tickets[ticketData.ticketconcern]++;
                  }
                }
              }
            });
            setTicketNatureData(tickets);
          }
        });
      }
    });
  }, [year]); // Add year as dependency

  // Calculate monthly totals for each user
  const getUserMonthlyData = (userId) => {
    const monthlyData = {
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
    };

    const userCollections = collectionData.filter(item => 
      item.collectedBy === userId && 
      item.receiptDate?.includes(year) // Filter by selected year
    );

    userCollections.forEach(collection => {
      if (collection.receiptDate && collection.amount) {
        const date = new Date(collection.receiptDate);
        const month = date.getMonth(); // 0-11
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        monthlyData[monthNames[month]] += Number(collection.amount);
      }

      
    });

    
    
    

    return monthlyData;
  };

  const getMonthlyInstallations = () => {
    const monthlyData = {
      'January': 0, 'February': 0, 'March': 0, 'April': 0,
      'May': 0, 'June': 0, 'July': 0, 'August': 0,
      'September': 0, 'October': 0, 'November': 0, 'December': 0
    };

    installationData.forEach(installation => {
      if (installation.createdAt) {
        const date = new Date(installation.createdAt);
        if (date.getFullYear() === parseInt(year)) {
          const monthName = date.toLocaleString('default', { month: 'long' });
          monthlyData[monthName]++;
        }
      }
    });

    return monthlyData;
  };

  return (
    <div className='d-flex flex-column mt-4'>
        <div className='mb-4'>
          
          <div className='d-flex flex-row justify-content-between'>
            <h4 className='fw-bold'>Employee Collection</h4>
            <label className='form-label fw-bold'>Select Year</label>
            <select className='form-select w-25 mb-2' value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className='table-responsive'>
            <table className="table table-bordered table-striped table-hover align-middle text-center">
              <thead className='table-success'>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Employee Name</th>
                  <th scope="col">Jan</th>
                  <th scope="col">Feb</th>
                  <th scope="col">Mar</th>
                  <th scope="col">Apr</th>
                  <th scope="col">May</th>
                  <th scope="col">Jun</th>
                  <th scope="col">Jul</th>
                  <th scope="col">Aug</th>
                  <th scope="col">Sep</th>
                  <th scope="col">Oct</th>
                  <th scope="col">Nov</th>
                  <th scope="col">Dec</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(userData).map(([userId, name], index) => {
                  const monthlyData = getUserMonthlyData(userId);
                  const total = Object.values(monthlyData).reduce((a, b) => a + b, 0);
                  
                  return (
                    <tr key={userId}>
                      <td>{index + 1}</td>
                      <td className='text-start'>{name}</td>
                      <td>₹ {monthlyData.jan.toLocaleString()}</td>
                      <td>₹ {monthlyData.feb.toLocaleString()}</td>
                      <td>₹ {monthlyData.mar.toLocaleString()}</td>
                      <td>₹ {monthlyData.apr.toLocaleString()}</td>
                      <td>₹ {monthlyData.may.toLocaleString()}</td>
                      <td>₹ {monthlyData.jun.toLocaleString()}</td>
                      <td>₹ {monthlyData.jul.toLocaleString()}</td>
                      <td>₹ {monthlyData.aug.toLocaleString()}</td>
                      <td>₹ {monthlyData.sep.toLocaleString()}</td>
                      <td>₹ {monthlyData.oct.toLocaleString()}</td>
                      <td>₹ {monthlyData.nov.toLocaleString()}</td>
                      <td>₹ {monthlyData.dec.toLocaleString()}</td>
                      <td className='fw-bold'>₹ {total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className='container mb-4'>
          <div className='d-flex flex-row justify-content-between'>
            <h4 className='fw-bold'>Installation Trend</h4>
            <label className='form-label fw-bold'>Select Year</label>
            <select className='form-select w-25 mb-2' value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className='table-responsive'>
            <table className="table table-bordered table-striped table-hover align-middle text-center">
              <thead className='table-primary'>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Month</th>
                  <th scope="col">Installation</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getMonthlyInstallations()).map(([month, count], index) => (
                  <tr key={month}>
                    <td>{index + 1}</td>
                    <td>{month}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='mb-4'>
          <div className='d-flex flex-row justify-content-between'>
            <h4 className='fw-bold'>Ticket Nature</h4>
            <label className='form-label fw-bold'>Select Year</label>
            <select className='form-select w-25 mb-2' value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className='table-responsive'>
            <table className="table table-bordered table-striped table-hover align-middle text-center">
              <thead className='table-danger'>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">Ticket Nature</th>
                  <th scope="col">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ticketNatureData).map(([concern, count], index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{concern}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  )
}
