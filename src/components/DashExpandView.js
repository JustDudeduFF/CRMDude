import { useEffect, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { API } from '../FirebaseConfig';
import { Download, X, ChevronLeft, ChevronRight, Filter, User, MapPin, CreditCard } from 'lucide-react';

const DashExpandView = ({ show, datatype, modalShow }) => {
    const navigate = useNavigate();
    const partnerId = localStorage.getItem('partnerId');
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [companyArray, setCompanyArray] = useState([]);
    const [selectCompany, setSelectCompany] = useState('All');
    const [filteredArray, setFilteredArray] = useState([]);

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
                response = await API.get(`/dashboard-data/chart?date=${date}&partnerId=${partnerId}`);
            } else if (dataFor === 'Due') {
                const type = datatype.split(' ')[1];
                response = await API.get(`/dashboard-data/due?dataFor=${type}&partnerId=${partnerId}`);
            }

            if (response.status !== 200) return toast.error('Failed to Load Data');

            const data = response.data.data;
            const companys = [...new Set(data.map((d) => d.company))];

            setCompanyArray(companys);
            setArrayData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoader(false);
        }
    }

    const fetchExpandData = useCallback(() => {
        setHeading(datatype);
        fetchData();
        setCurrentPage(1);
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
        setCurrentPage(1);
    }, [selectCompany, arrayData]);

    if (!show) return null;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredArray.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArray.length / itemsPerPage);

    return (
        <div className={`expanded-view-overlay ${show ? 'active' : ''}`}>
            <ToastContainer />
            <div className="expanded-view-container">
                {/* Header Section */}
                <header className="ev-header">
                    <div className="ev-title-section">
                        <h2>{heading}</h2>
                        <span className="badge-count">{filteredArray.length} Records</span>
                    </div>

                    <div className="ev-controls">
                        <div className="filter-box">
                            <Filter size={16} />
                            <select onChange={(e) => setSelectCompany(e.target.value)} value={selectCompany}>
                                <option value='All'>All Companies</option>
                                {companyArray.map((data, index) => (
                                    <option key={index} value={data}>{data}</option>
                                ))}
                            </select>
                        </div>
                        
                        <button className="ev-icon-btn excel" onClick={downloadExcel} title="Download Excel">
                            <Download size={20} />
                        </button>

                        <button className="ev-icon-btn close" onClick={() => { setSelectCompany('All'); modalShow() }}>
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <main className="ev-content">
                    {loader ? (
                        <div className="ev-loader">
                            <div className="spinner"></div>
                            <p>Analyzing Data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="ev-table-wrapper desktop-only">
                                <table className="ev-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer Details</th>
                                            <th>Contact</th>
                                            <th>Address</th>
                                            <th>Plan</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{indexOfFirstItem + index + 1}</td>
                                                    <td>
                                                        <div className="td-user">
                                                            <strong>{item.fullName}</strong>
                                                            <span>{item.username}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.mobile}</td>
                                                    <td className="td-truncate">{item.installationAddress}</td>
                                                    <td>{item.planName}</td>
                                                    <td className="text-bold">₹{heading.split(' ')[0] === 'Expiring' ? item.planAmount : item.dueAmount}</td>
                                                    <td>{new Date(heading.split(' ')[0] === 'Expiring' ? item.expiryDate : item.activationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td>
                                                        <button onClick={() => {
                                                            localStorage.setItem("susbsUserid", item._id)
                                                            navigate('/dashboard/subscriber');
                                                        }} className='ev-btn-action'>
                                                            {heading.split(' ')[0] === 'Expiring' ? 'Renew' : 'Collect'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={8} className="no-data">No subscribers found for this filter.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="ev-mobile-list mobile-only">
                                {currentItems.map((item, index) => (
                                    <div className="ev-card" key={index}>
                                        <div className="ev-card-header">
                                            <User size={16} />
                                            <strong>{item.fullName}</strong>
                                            <span className="ev-card-id">{item.username}</span>
                                        </div>
                                        <div className="ev-card-body">
                                            <p><MapPin size={14} /> {item.installationAddress}</p>
                                            <div className="ev-card-row">
                                                <span><CreditCard size={14} /> {item.planName}</span>
                                                <span className="price-tag">₹{heading.split(' ')[0] === 'Expiring' ? item.planAmount : item.dueAmount}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => {
                                            localStorage.setItem("susbsUserid", item._id)
                                            navigate('/dashboard/subscriber');
                                        }} className="ev-mobile-btn">
                                            {heading.split(' ')[0] === 'Expiring' ? 'Renew Plan' : 'Collect Payment'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Pagination */}
                            {totalPages > 1 && (
                                <footer className="ev-pagination">
                                    <button className="pag-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="pag-info">
                                        Page <strong>{currentPage}</strong> of {totalPages}
                                    </div>
                                    <button className="pag-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                                        <ChevronRight size={18} />
                                    </button>
                                </footer>
                            )}
                        </>
                    )}
                </main>
            </div>

            <style>{`
                .expanded-view-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: 0.3s; pointer-events: none;
                }
                .expanded-view-overlay.active { opacity: 1; pointer-events: auto; }

                .expanded-view-container {
                    background: #fff;
                    width: 95%; height: 90%;
                    max-width: 1400px;
                    border-radius: 16px;
                    display: flex; flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    overflow: hidden;
                    animation: slideUp 0.4s ease-out;
                }

                @keyframes slideUp { from { transform: translateY(50px); } to { transform: translateY(0); } }

                .ev-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #eee;
                    display: flex; justify-content: space-between; align-items: center;
                    background: #fcfcfc;
                }

                .ev-title-section h2 { margin: 0; font-size: 1.4rem; color: #1a1a1a; font-weight: 700; }
                .badge-count { font-size: 0.8rem; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 20px; font-weight: 600; }

                .ev-controls { display: flex; gap: 1rem; align-items: center; }
                
                .filter-box {
                    display: flex; align-items: center; gap: 8px;
                    background: #f1f3f4; padding: 6px 12px; border-radius: 8px;
                }
                .filter-box select { border: none; background: transparent; font-size: 0.9rem; outline: none; font-weight: 500; }

                .ev-icon-btn {
                    border: none; background: #fff; width: 40px; height: 40px;
                    border-radius: 10px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .ev-icon-btn.close:hover { background: #fee2e2; color: #ef4444; }
                .ev-icon-btn.excel:hover { background: #e8f5e9; color: #2e7d32; }

                .ev-content { flex: 1; overflow-y: auto; padding: 1rem 2rem; background: #fdfdfd; }

                /* Table Styling */
                .ev-table-wrapper { border-radius: 12px; border: 1px solid #eee; overflow: hidden; background: #fff; }
                .ev-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
                .ev-table th { background: #f8f9fa; padding: 1rem; font-weight: 600; color: #555; }
                .ev-table td { padding: 1rem; border-top: 1px solid #f1f1f1; vertical-align: middle; }
                .td-user { display: flex; flex-direction: column; }
                .td-user span { font-size: 0.8rem; color: #888; }
                .td-truncate { max-width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
                .text-bold { font-weight: 700; color: #1a1a1a; }
                
                .ev-btn-action {
                    background: #2e7d32; color: white; border: none; padding: 8px 16px;
                    border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;
                }

                /* Mobile Card View */
                .mobile-only { display: none; }
                .ev-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
                .ev-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; border-bottom: 1px solid #f5f5f5; padding-bottom: 8px; }
                .ev-card-id { margin-left: auto; font-size: 0.75rem; color: #999; }
                .ev-card-body p { font-size: 0.85rem; color: #666; margin: 4px 0; }
                .ev-card-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
                .price-tag { font-weight: 700; color: #2e7d32; font-size: 1.1rem; }
                .ev-mobile-btn { width: 100%; margin-top: 12px; padding: 10px; background: #2e7d32; color: #fff; border: none; border-radius: 8px; }

                /* Pagination */
                .ev-pagination {
                    display: flex; justify-content: center; align-items: center; gap: 1.5rem;
                    padding: 1.5rem; border-top: 1px solid #eee; background: #fff;
                }
                .pag-btn { background: #f1f3f4; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; }
                .pag-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                .ev-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; }
                .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2e7d32; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .desktop-only { display: none; }
                    .mobile-only { display: block; }
                    .ev-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
                    .ev-controls { width: 100%; justify-content: space-between; }
                    .ev-content { padding: 1rem; }
                    .expanded-view-container { height: 100%; width: 100%; border-radius: 0; }
                }
            `}</style>
        </div>
    );
};

export default DashExpandView;