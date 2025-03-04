import React, { useEffect, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db, api } from '../../FirebaseConfig';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from '../PermissionProvider';

export default function InventorysTable() {
  const username = localStorage.getItem('susbsUserid');
  const {hasPermission} = usePermissions();
  const [arrayinventry, setArrayInventry] = useState([]);
  const [selectData, setSelectData] = useState({
    mac:'',
    amount:0,
    key:'',
    status:'',
    date:''
  })
  const [modify, setModify] = useState(false);
  const [info, setinfo] = useState({
    amount:0,
    status:'',
  });

  const [dueAmount, setDueAmount] = useState(0);

  useEffect(() => {

    const fetchInventoryData = async() => {
      const response = await axios.get(api+`/subscriber/${username}?data=inventory`);

      if(response.status !== 200) return;

      const data = response.data;
      if(data){
        setDueAmount(data.dueAmount);
        setArrayInventry(data.inventArray);
      }

    }

    fetchInventoryData();
  }, []);

  const updateDevice = async() => {
    const inventoryRef = ref(db, `Subscriber/${username}/Inventory/${selectData.key}`);
    const maininvtRef = ref(db, `Inventory/${selectData.mac}`);

    if(info.amount === selectData.amount && info.status === selectData.status){
      toast.error('Please Update Details', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });          
      return;
    }

    if (Number(info.amount) !== Number(selectData.amount)) {
      const deviceAmount = Number(info.amount);
      const newDueAmount = (Number(info.amount) - Number(selectData.amount)) + Number(dueAmount);
    
      const newDue = { dueAmount: newDueAmount };
      const invtAmount = { amount: deviceAmount };

      const ledgerData = {
        creditamount:0,
        date:selectData.date,
        debitamount:deviceAmount,
        particular:'Device Security',
        type:'Inventory'
      }
    
      console.log(newDue);
    
      try {
        await Promise.all([
          update(inventoryRef, invtAmount),
          update(ref(db, `Subscriber/${username}/connectionDetails`), newDue),
          update(ref(db, `Subscriber/${username}/ledger/${selectData.key}`), ledgerData)
        ]);
    
        setSelectData(prev => ({
          ...prev,
          amount: deviceAmount,
          dueAmount: newDueAmount
        }));
    
        toast.success('Device Amount Updated', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
    
      } catch (error) {
        toast.error('Failed To Update Amount', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
    
        console.error('Error updating amount:', error);
      }
    }
    
    if(info.status !== selectData.status){
      const newStatus = {
        status:info.status
      }

      try{

        await update(inventoryRef, newStatus);
        await update(maininvtRef, newStatus);

        toast.success('Device Status Updated', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });  

      }catch(e){
        toast.error('Failed To Update Status', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });  
        console.log(e);
      }

      
    }

  }

  return (
    <div>
      <ToastContainer/>
      <div style={{ overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }} className="table">
          <thead>
            <tr>
              <th style={{ width: '120px' }} scope="col">Product Code</th>
              <th style={{ width: '120px' }} scope="col">Date</th>
              <th style={{ width: '160px' }} scope="col">Product Name</th>
              <th style={{ width: '160px' }} scope="col">Product Serial No.</th>
              <th style={{ width: '90px' }} scope="col">Amount</th>
              <th style={{ width: '120px' }}>Remarks</th>
              <th style={{ width: '130px' }}>Modified By</th>
              <th style={{ width: '90px' }}>Status</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arrayinventry.length > 0 ? (
              arrayinventry.map(({ ledgerkey, amount, date, deviceSerialNumber, devicename, modifiedby, remarks, status, macaddress }, index) => (
                <tr key={index}>
                  <td
                    style={{ color: 'green', cursor: 'pointer' }}
                    onClick={() => {

                      if(!hasPermission("CHANGE_DEVICE_STATUS")){
                        toast.error('Permission Denied', {
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                        });
                        return;
                      }

                      if(status !== "Activated"){
                        toast.error('Device is Not Active', {
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                        });
                        return;
                      }

                      setSelectData({
                        mac:macaddress,
                        amount:amount,
                        key:ledgerkey,
                        status:status,
                        date:date
                      });
                      setinfo({
                        amount:amount,
                        status:status
                      });
                      setModify(true);
                    }}
                  >
                    {ledgerkey}
                  </td>
                  <td>{date}</td>
                  <td>{devicename}</td>
                  <td>{deviceSerialNumber}</td>
                  <td>{`${amount}.00`}</td>
                  <td>{remarks}</td>
                  <td>{modifiedby}</td>
                  <td style={{ color: status === 'Activated' ? 'green' : 'red' }}>{status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No Inventory data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal show={modify} onHide={() => setModify(false)}>
        <Modal.Header>
          <Modal.Title>
            Modify Device
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className='container d-flex flex-column'>
              <div className='col-md'>
                <label className='form-label'>Device Amount</label>
                <input onChange={(e) => setinfo({
                  ...info,
                  amount:e.target.value
                })} defaultValue={selectData.amount} className='form-control' type='number'></input>
              </div>

              <div className='col-md mt-3'>
                <label className='form-label'>Device Status</label>
                <select onChange={(e) => setinfo({
                  ...info,
                  status:e.target.value
                })} className="form-select">
                  <option value='Activated'>Activated</option>
                  <option value='damaged' >Damaged</option>
                  <option value='repair'>On Repair</option>
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={updateDevice} className='btn btn-primary'>Update</button>
            <button onClick={() => setModify(false)} className='btn btn-outline-secondary'>Close</button>
          </Modal.Footer>
      </Modal>
    </div>
  );
}
