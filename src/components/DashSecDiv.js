import React, { useState, useEffect } from 'react'
import { api, db } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import axios from 'axios';

export default function DashSecDiv() {

  const currentYear = new Date().getFullYear();
  const years = [];
  for(let i = 0; i < 5; i++){
    years.push(currentYear - i);
  }

  const [year, setYear] = useState(currentYear);
  const [userData, setUserData] = useState([]);
  const [installationData, setInstallationData] = useState([]);
  const [ticketNatureData, setTicketNatureData] = useState({});

  const fetchSecDiv = async() => {

    try{
    // Run all API calls concurrently using Promise.all
        const [revenueCount, installationTrend, ticktenature] = await Promise.all([
          axios.get(api+`/subscriber?data=revenuecountsecdiv&year=${year}`),
          axios.get(api+`/subscriber?data=installationtrend&year=${year}`),
          axios.get(api+`/subscriber?data=ticketnature&year=${year}`),
          
          
      ]);

      // Check for response status once
      if (
        revenueCount.status !== 200 ||
        installationTrend.status !== 200 || 
        ticktenature.status !== 200
      ) {
          console.error('One or more API calls failed.');
          return;
      }                  

      const revenueData = revenueCount.data;
      if(revenueData){
        setUserData(revenueData);
      }

      const installationData = installationTrend.data;
      if(installationData){
        setInstallationData(installationData);
      }

      const ticketeData = ticktenature.data;
      if(ticketeData){
        setTicketNatureData(ticketeData);
      }

    }catch(e){
      console.log(e);
    }

  }

  
  

  useEffect(() => {

    fetchSecDiv();

  }, [year]); // Add year as dependency



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
                  <th className='text-start' scope="col">S.No</th>
                  <th className='text-start' scope="col">Employee Name</th>
                  <th className='text-start' scope="col">Jan</th>
                  <th className='text-start' scope="col">Feb</th>
                  <th className='text-start' scope="col">Mar</th>
                  <th className='text-start' scope="col">Apr</th>
                  <th className='text-start' scope="col">May</th>
                  <th className='text-start' scope="col">Jun</th>
                  <th className='text-start' scope="col">Jul</th>
                  <th className='text-start' scope="col">Aug</th>
                  <th className='text-start' scope="col">Sep</th>
                  <th className='text-start' scope="col">Oct</th>
                  <th className='text-start' scope="col">Nov</th>
                  <th className='text-start' scope="col">Dec</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((user, index) => {
                  const { name, monthlyData, total } = user;

                  return (
                    <tr key={index}>
                      <td className='text-start'>{index + 1}</td>
                      <td className='text-start'>{name}</td>
                      <td className='text-start'>₹ {monthlyData.jan.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.feb.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.mar.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.apr.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.may.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.jun.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.jul.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.aug.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.sep.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.oct.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.nov.toLocaleString()}</td>
                      <td className='text-start'>₹ {monthlyData.dec.toLocaleString()}</td>
                      <td className="fw-bold">₹ {total.toLocaleString()}</td>
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
                {Object.entries(installationData).map(([month, count], index) => (
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
