import React, { useState, useEffect } from 'react'
import CompanynModal from './CompanyModal';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';

export default function Company() {

    const [showModal, setShowModal] = useState(false);
    const [showGlobalCompany, setShowGlobalCompany] = useState(false);
    const {hasPermission} = usePermissions();

    const [companyDetails, setCompanyDetails] = useState({
        companyname: '',
        companyaddress: '',
        companymobile: '',
        companygmail: '',
        companycity: '',
        companypincode: '',
        companycode: 'global',
        companyGSTIN: '',
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyDetails({ ...companyDetails, [name]: value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        

        set(ref(db, 'Master/companys/' + companyDetails.companycode), companyDetails);
        setShowGlobalCompany(false);
    }

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
            <button onClick={() => setShowGlobalCompany(true)} className='btn btn-outline-primary me-2'>Global Company</button>
            <button onClick={() => hasPermission("ADD_COMPANY") ? setShowModal(true) : alert("Permission Denied")} className='btn btn-outline-success'>Add New company</button>

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
        
        <Modal show={showGlobalCompany} onHide={() => setShowGlobalCompany(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Global Company</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formCompanyName">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="companyname"
                            value={companyDetails.companyname}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCompanyAddress">
                        <Form.Label>Company Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="companyaddress"
                            value={companyDetails.companyaddress}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCompanyMobile">
                        <Form.Label>Mobile</Form.Label>
                        <Form.Control
                            type="text"
                            name="companymobile"
                            value={companyDetails.companymobile}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCompanyGmail">
                        <Form.Label>Gmail</Form.Label>
                        <Form.Control
                            type="email"
                            name="companygmail"
                            value={companyDetails.companygmail}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCompanyCity">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="companycity"
                            value={companyDetails.companycity}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCompanyPincode">
                        <Form.Label>Pincode</Form.Label>
                        <Form.Control
                            type="text"
                            name="companypincode"
                            value={companyDetails.companypincode}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCompanyCode">
                        <Form.Label>Company GSTIN</Form.Label>
                        <Form.Control
                            type="text"
                            name="companyGSTIN"
                            value={companyDetails.companyGSTIN}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Button className='mt-3' variant="primary" type="submit">
                        Add Company
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>

    </div>
  )
}
