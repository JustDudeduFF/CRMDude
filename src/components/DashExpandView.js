import { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import * as XLSX from 'xlsx';
import { api2 } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import axios from 'axios';

const DashExpandView = ({ show, datatype, modalShow }) => {
    const navigate = useNavigate();
    const partnerId = localStorage.getItem('partnerId');
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [companyArray, setCompanyArray] = useState([]);
    const [selectCompany, setSelectCompany] = useState('All');
    const [filteredArray, setFilteredArray] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);
        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    }

    const fetchData = async () => {
        setLoader(true);
        const dataFor = datatype.split(' ')[0];

        try {
            let response;
            if (dataFor === 'Expiring') {
                const date = datatype.split(' ')[1];
                response = await axios.get(`${api2}/dashboard-data/chart?date=${date}&partnerId=${partnerId}`);
            } else if (dataFor === 'Due') {
                const type = datatype.split(' ')[1];
                response = await axios.get(`${api2}/dashboard-data/due?dataFor=${type}&partnerId=${partnerId}`);
            }

            if (response.status !== 200) return toast.error('Failed to LoadData', { autoClose: 2000 });

            const data = response.data.data;
            const companys = [...new Set(data.map((data) => data.company))];

            setCompanyArray(companys);
            setArrayData(data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoader(false);
        }
    }

    const fetchExpandData = useCallback(() => {
        setHeading(datatype);
        fetchData();
        setCurrentPage(1); // Reset to first page when data changes
    }, [datatype]);

    useEffect(() => {
        if (show) fetchExpandData();
    }, [show, fetchExpandData]);

    useEffect(() => {
        let filterArray = arrayData;
        if (selectCompany !== 'All') {
            filterArray = filterArray.filter((data) => data.company === selectCompany);
        }
        setFilteredArray(filterArray);
        setCurrentPage(1); // Reset page on filter change
    }, [selectCompany, arrayData]);

    if (!show) return null;

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredArray.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArray.length / itemsPerPage);

    return (
        <div className="expand-modal">
            <ToastContainer />
            <div className="expand-modal-content">
                <div className="expand-modal-header">
                    <h4 className='modal-title me-5'>{heading}</h4>
                    <div className='col-md-2'>
                        <label className='form-label'>Select Company</label>
                        <select onChange={(e) => setSelectCompany(e.target.value)} className='form-select'>
                            <option value='All'>All</option>
                            {companyArray.map((data, index) => (
                                <option key={index} value={data}>{data}</option>
                            ))}
                        </select>
                    </div>
                    <div className='modal-actions'>
                        <img onClick={downloadExcel} src={ExcelIcon} alt='excel' className='excel-download-icon ms-auto'></img>
                    </div>
                    <button style={{ right: '5%' }} className="btn-close" onClick={() => { setSelectCompany('All'); modalShow() }}></button>
                </div>
                <div className='table-container'>
                    {loader ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading data...</p>
                        </div>
                    ) : (
                        <>
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
                                    {currentItems.length > 0 ? (
                                        currentItems.map(({ username, expiryDate, fullName, mobile, installationAddress, planAmount, planName, company, activationDate, dueAmount, _id }, index) => (
                                            <tr key={index}>
                                                <td>{indexOfFirstItem + index + 1}</td>
                                                <td style={{ maxWidth: '900px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{fullName}</td>
                                                <td>{username}</td>
                                                <td>{mobile}</td>
                                                <td style={{ maxWidth: '250px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{installationAddress}</td>
                                                <td style={{ maxWidth: '180px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{planName}</td>
                                                <td>{heading.split(' ')[0] === 'Expiring' ? planAmount : dueAmount}</td>
                                                <td>{new Date(heading.split(' ')[0] === 'Expiring' ? expiryDate : activationDate).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }).replace(',', '')}</td>
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
                                            <td colSpan={9} style={{ textAlign: 'center' }}>No Data Available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination-container">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashExpandView;
