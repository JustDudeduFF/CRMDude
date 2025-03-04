import React, { useEffect, useState } from 'react'
import { usePermissions } from '../PermissionProvider'
import { Modal } from 'react-bootstrap';
import { ref, update } from 'firebase/database';
import { api, db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

export default function PlanProvider() {
    const {hasPermission} = usePermissions();

    const [showmodal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [providerArray, setProviderArray] = useState([]);

    const fetchData = async() => {
        const array = [];
        try{
            const response = await axios.get(api+'/master/Provider');

            if(response.status !== 200) return;

            const data = response.data;
            if(data){
                Object.keys(data).forEach((key) => {
                    const prov = data[key];

                    const {name, date, modifiedby} = prov;

                    array.push({name, date, modifiedby})
                })
                setProviderArray(array);
            }
        }catch(e){
            console.log(e)
        }
    }

    useEffect(() => {
        fetchData();
    }, [showmodal]);


    const saveProvider = async() => {
        const providerKey = Date.now();

        const data = {
            name:name,
            date:new Date().toISOString().split('T')[0],
            modifiedby:localStorage.getItem('Name')
        }

        try{
            await update(ref(db, `Master/Provider/${providerKey}`), data);

            toast.success('Provider Added', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,        
            });
            

        }catch(e){
            toast.error('Failed To Add Provider', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,        
            });
            console.log(e)
        }
    }
    return (
        <div className='d-flex ms-3 flex-column'>
            <ToastContainer/>
            <div className='d-flex flex-row'>
                <h5 style={{ flex: '1' }}>Plan Providers</h5>
                <button onClick={() => hasPermission("ADD_PLAN") ? setShowModal(true) : alert("Permission Denied")} className='btn btn-outline-success justify-content-end mb-2'>
                    Add New Provider
                </button>
            </div>
            

            <table className='table'>
                <thead>
                    <tr>
                        <th scope='col'>S No.</th>
                        <th scope='col'>Provider Name</th>
                        <th scope='col'>Add Date</th>
                        <th scope='col'>Modified By</th>
                    </tr>
                </thead>
                <tbody>
                    {providerArray.map(({name, date, modifiedby}, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{name}</td>
                            <td>{new Date(date).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'})}</td>
                            <td>{modifiedby}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showmodal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>
                        Add Plan Provider
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='container'>
                        <div className='col-md mt-2'>
                            <label className='form-label'>Provider Name</label>
                            <input onChange={(e) => setName(e.target.value)} className='form-control' type='text'></input>
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={saveProvider} className='btn btn-success'>Add Provider</button>
                    <button onClick={() => setShowModal(false)} className='btn btn-outline-secondary'>Close</button>
                </Modal.Footer>
            </Modal>
        
        </div>
    )
}
