import React, { useState, useEffect } from 'react'
import CompanynModal from './CompanyModal';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';

export default function Company() {

    const [showModal, setShowModal] = useState(false);

    const [arraycompany, setArraycompany] = useState([]);
    const companyRef = ref(db, 'Master/companys')


    useEffect(() => {
        const unsubscribecompany = onValue(companyRef, (companynap) => {
            if (companynap.exists()) {
                const companyArray = [];
                companynap.forEach(childcompany => {
                    const companyname = childcompany.key;
                    const companyaddress = childcompany.val().companyaddress;
                    const companymobile = childcompany.val().companymobile;
                    const companygmail = childcompany.val().companygmail;
                    const companycity = childcompany.val().companycity;
                    const companypincode = childcompany.val().companypincode;
                    const companycode = childcompany.val().companycode;  
    
                    companyArray.push({ companyname, companyaddress, companymobile, companycity, companygmail, companypincode, companycode });
                });
                setArraycompany(companyArray);
                
            } else {
                toast.error('No Data Found!', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
            }
        });
    
        return () => unsubscribecompany(); // Correct cleanup
    }, []);
    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Company company Location and Address</h5>
            <button onClick={() => setShowModal(true)} className='btn btn-outline-success justify-content-right'>Add New company</button>

        </div>
        <ToastContainer/>
        <CompanynModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Company Code</th>
                    <th scope='col'>Company Name</th>
                    <th scope='col'>Company Address</th>
                    <th scope='col'>Gmail</th>
                    <th scope='col'>Mobile</th>
                    <th scope='col'>Pincode</th>
                    <th scope='col'>City</th>
                    

                    

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                {arraycompany.map(({companyname, companyaddress, companymobile, companycity, companygmail, companypincode, companycode}, index) => (
                    <tr key={companyname}>
                        <td>{index + 1}</td>
                        <td>{companycode}</td>
                        <td>{companyname}</td>
                        <td>{companyaddress}</td>
                        <td>{companygmail}</td>
                        <td>{companymobile}</td>
                        <td>{companypincode}</td>
                        <td>{companycity}</td>
                    </tr>
                ))

                }

            </tbody>

        </table>

    </div>
  )
}
