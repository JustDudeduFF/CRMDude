import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api2, db } from '../../FirebaseConfig';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import './RemarkFollowsTable.css';

export default function () {
  const username = localStorage.getItem('susbsUserid');
  const [arrayremark, setArrayRemark] = useState([]);
  const navigate = useNavigate();


  const fetchData = async() => {
    try{
      const response = await axios.get(api2+'/subscriber/remarksfollow?id='+username);
      if(!response.status == 200) return toast.error('Failed to get Remarks List', {
        autoClose:2000
      });

      const data = response.data;
      setArrayRemark(data);

    }catch(error){
      console.log(error)
    }
  }

  useEffect(() => {


    fetchData();
  }, [username]);
  return (

      
        <div className="remark-follows-wrapper">
          <ToastContainer/>
                <table className="remark-follows-table">
                <thead>
                    <tr>
                        <th scope="col">Action ID</th>
                        <th scope='col'>Action Type</th>
                        <th scope="col">Action Date</th>
                        <th scope="col">Description</th>
                        <th scope="col">Modified By</th>
                        <th scope="col">Modified On</th>
                        
                    </tr>
                </thead>
                <tbody>

                  {arrayremark.length > 0 ? (
                    arrayremark.map(({remarkKey, type, date, description, modifiedon, modifiedBy, status}, index) => (
                      <tr className={status === 'pending' ? 'table-danger' : 'table-success'} key={index}>
                    <td onClick={() => 
                      {if(type === 'Follow Up'){
                        navigate('modremfollow', {state: {remarkno: remarkKey}});
                      }else{
                        toast.error('Remarks Not Modifiable!', {autoClose:2000})
                      }}
                    } className={`remark-follows-action-id ${type === 'Follow Up' ? 'follow-up' : 'non-modifiable'}`}>{remarkKey}</td>
                    <td>{type}</td>
                    <td>{date}</td>
                    <td>{description}</td>
                    <td>{modifiedBy}</td>
                    <td>{modifiedon}</td>
                    
                    
                </tr>
                    ))
                  ) : (
                    <td colSpan='8' className="remark-follows-no-data">No Data Found</td>
                  )
                }
                
                </tbody>

                </table>

        </div>

  )
}
