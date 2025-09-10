import React, { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import { onValue, ref, set, update, get } from 'firebase/database';
import * as XLSX from 'xlsx';
import { api2, db } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png'
import WhatsappIcon from './subscriberpage/drawables/whatsapp.png'
import { data, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { ProgressBar } from 'react-loader-spinner';
import axios from 'axios';
import { usePermissions } from './PermissionProvider';

const DashExpandView = ({ show, datatype, modalShow }) => {
    const navigate = useNavigate();
    const partnerId = localStorage.getItem('partnerId')
    const {hasPermission} = usePermissions();
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [arrayplan, setArrayPlan] = useState([]);
    const [loader, setLoader] = useState(false);
    const [companyArray, setCompanyArray] = useState([]);
    const [selectCompany, setSelectCompany] = useState('All');
    const [filteredArray, setFilteredArray] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    //Download All Data to Excel File

    const downloadExcel =()=> {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);

        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    }

    function convertExcelDateSerial(input) {
        const excelDateSerialPattern = /^\d+$/; // Matches only digits (Excel date serial number)
        if (excelDateSerialPattern.test(input)) {
            const excelDateSerial = parseInt(input, 10);
            const baseDate = new Date("1900-01-01"); // Correct Excel base date
            const adjustedSerial = excelDateSerial - 1; // Adjust for Excel's leap year bug
            const date = new Date(baseDate.getTime() + adjustedSerial * 86400000);
            return date;
        } else {
            return new Date(input); // Return original input as Date object if it's not a valid Excel date serial number
        }
    }

    function isSameISOWeek(dueDate, currentDate) {
        const dueWeek = getISOWeek(dueDate);
        const currentWeek = getISOWeek(currentDate);
        return dueWeek === currentWeek && dueDate.getFullYear() === currentDate.getFullYear();
    }

    function getISOWeek(date) {
        const tempDate = new Date(date);
        tempDate.setHours(0, 0, 0, 0);
        tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7)); // ISO week starts on Monday
        const yearStart = new Date(tempDate.getFullYear(), 0, 1);
        return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
    }

    function isTomorrowDay(dueDate, currentDate) {
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1); // Set to tomorrow
        return dueDate.toDateString() === tomorrow.toDateString();
    }

    function isSameDay(dueDate, currentDate) {
        return dueDate.toDateString() === currentDate.toDateString();
    }

    const fetchData = async() => {
        setLoader(true)
        const dataFor = datatype.split(' ')[0];
        const dataArray = [];
        if(dataFor === 'Expiring'){
            const date = datatype.split(' ')[1];
            try{
                const response = await axios.get(api2+`/dashboard-data/chart?date=${date}&partnerId=${partnerId}`);

                if(response.status !== 200) return toast.error('Failed to LoadData', {autoClose:2000});
                
                const data = response.data.data;
                const companys = [...new Set(data.map((data) => data.company))];

                setCompanyArray(companys);
                setArrayData(data);




            }catch(e){
                console.log(e);
            }finally{setLoader(false)}
        }

        if(dataFor === 'Due'){
            const type = datatype.split(' ')[1];
            
            try{
                const response = await axios.get(api2+`/dashboard-data/due?dataFor=${type}&partnerId=${partnerId}`);

                if(response.status !== 200) return toast.error('Failed to LoadData', {autoClose:2000});

                const data = response.data.data;


                const companys = [...new Set(data.map((data) => data.company))];

                setCompanyArray(companys);
                setArrayData(data);

            }catch(e){
                console.log(e);
            }finally{setLoader(false)}
        }

    }

    const fetchExpandData = useCallback(() => {
        setHeading(datatype)

        fetchData();
    }, [datatype]);

    const fetchPlans = useCallback(() => {
        const planRef = ref(db, `Master/Broadband Plan`);
        onValue(planRef, (planSnap) => {
            const planArray = [];
            planSnap.forEach((childSnap) => {
                const {planname, planamount, planperiod, periodtime} = childSnap.val();
                planArray.push({
                    planname, planamount, planperiod, periodtime
                });
            });
            setArrayPlan(planArray);
        });
    }, []);

    useEffect(() => {
        if (show) {
            fetchExpandData();
            fetchPlans();
        }
    }, [show, fetchExpandData, fetchPlans]); // Dependency on `show` and `fetchExpandData`

    useEffect(() => {
        let filterArray = arrayData;

        if(selectCompany !== 'All'){
            filterArray = filterArray.filter((data) => data.company === selectCompany);
        }

        setFilteredArray(filterArray);
    }, [selectCompany, arrayData])

        

    if (!show) return null;

    return (
            <div className="expand-modal">
                <div className="expand-modal-content">
                    <div className="expand-modal-header">
                        <h4 className='modal-title me-5'>{heading}</h4>
                        <div className='col-md-2'>
                        <label className='form-label'>Select Company</label>
                        <select onChange={(e) => setSelectCompany(e.target.value)} className='form-select'>
                            <option value='All'>All</option>
                            {
                                companyArray.map((data, index) => (
                                    <option key={index} value={data}>{data}</option>
                                ))
                            }
                        </select>
                        </div>
                        <div className='modal-actions'>
                            
                            <img onClick={downloadExcel} src={ExcelIcon} alt='excel' className='excel-download-icon ms-auto'></img>
                        </div>
                        <button style={{right:'5%'}} className="btn-close" onClick={() => {setSelectCompany('All'); modalShow()}}></button>

                            
                    </div>
                    <div className='table-container'>
                        {loader ? 
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading data...</p>
                        </div> : 
                                                <table className="dashboard-table">
                                                <thead>
                                                    <tr>
                                                        <th>S. No.</th>
                                                        <th>Customer Name</th>
                                                        <th>UserName</th>
                                                        <th>Mobile No.</th>
                                                        <th>Installation Address</th>
                                                        <th>Plan Name</th>
                                                        <th>{heading.split(' ')[0] === 'Expiring' ? 'Plan Amount' : 'Due Amount'}</th>
                                                        <th>{heading.split(' ')[0] === 'Expiring' ? 'Expiry Date' : 'Activate Date'}</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredArray.length > 0 ? (
                                                        filteredArray.map(({ username, expiryDate, fullName, mobile, installationAddress, planAmount, planName, company, activationDate, dueAmount , _id}, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td style={{maxWidth:'900px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{fullName}</td>
                                                                <td>{username}</td>
                                                                <td>{mobile}</td>
                                                                <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{installationAddress}</td>
                    
                                                                <td style={{maxWidth:'180px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{planName}</td>
                                                                <td>{heading.split(' ')[0] === 'Expiring' ? planAmount : dueAmount}</td>
                                                                <td>{new Date(heading.split(' ')[0] === 'Expiring' ? expiryDate : activationDate).toLocaleDateString('en-GB', {
                                                                    day:'2-digit',
                                                                    month:'short',
                                                                    year:'numeric'
                                                                }).replace(',','')}</td>
                                                                <td>
                                                                    <button onClick={() => {
                                                                        localStorage.setItem("susbsUserid", _id)
                                                                        navigate('/dashboard/subscriber');
                                                                    }} className='btn btn-outline-success'>{heading.split(' ')[0] === 'Expiring' ? 'Renew' : 'Collect'}</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={8} style={{ textAlign: 'center' }}>
                                                                No Data Available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                        }

                    </div>
                </div>
            </div>
            
    );
};

export default DashExpandView;
