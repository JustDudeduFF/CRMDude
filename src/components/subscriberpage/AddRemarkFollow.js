
import { get, ref, set } from 'firebase/database';
import React, {useEffect, useState} from 'react'
import { db } from '../../FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddRemarkFollow(props) {
    const {mode} = props
    const username = localStorage.getItem('susbsUserid');
    const empid = localStorage.getItem('contact');
    const navigate = useNavigate();

    const [ArrayConcern, setArrayConcern] = useState([]);
    const [description, setDescription] = useState('');
    const [remarkparticular, setRemarkParticular] = useState('');

    useEffect(() => {
      const fetchconcerns = async() => {
        try{
          const concernResponse = await axios.get('https://api.justdude.in/master/RMConcern');

          if(concernResponse.status !== 200 ){
            console.log(concernResponse.status);
            return;
          }

          const concernData = concernResponse.data;
          if(concernData){
            const array = [];
            Object.keys(concernData).forEach((key) => {
              const concern = concernData[key];
              const concernname = concern.ticketname;
              array.push(concernname);
            });
            setArrayConcern(array);
          }
        }catch(e){
          console.log(e);
        }
      }

      return () => fetchconcerns();
    }, [])

    const savedata = async() => {
      const remarkno = Date.now();
      const remarkRef = ref(db, `Subscriber/${username}/Remarks/${remarkno}`);
      const myfollowRef = ref(db, `users/${empid}/MyFollows/${remarkno}`);
      const type = mode === 'follow' ? 'Follow Up' : 'Remarks';

      if(remarkparticular === ''){
        alert('Select Concern of Follow up or Remark');
      }else{
        if(mode === 'follow'){
          const followdata = {
            particular:remarkparticular,
            remarkno: remarkno,
            type: type,
            date: new Date().toISOString().split('T')[0],
            description: description,
            modifiedby: localStorage.getItem('Name'),
            modifiedon: new Date().toISOString().split('T')[0],
            status: "pending"
          }
  
          const userdata = {
            followupno: remarkno,
            date: new Date().toISOString().split('T')[0],
            particular:remarkparticular,
            description: description,
            status: 'pending',
            userid: localStorage.getItem("susbsUserid")
          }
  
          try{
            await set(remarkRef, followdata);
            await set(myfollowRef, userdata);
            navigate(-1);
          }catch(error){
            alert(`Failed: ${error}`);
          }
        }else{
          const remarkdata = {
            particular:remarkparticular,
            remarkno: remarkno,
            type: type,
            date: new Date().toISOString().split('T')[0],
            description: description,
            modifiedby: localStorage.getItem('Name'),
            modifiedon: new Date().toISOString().split('T')[0],
            followupdate: ''
          }
  
          try{
            await set(remarkRef, remarkdata);
            navigate(-1);
          }catch(error){
            alert(`Failed: ${error}`)
          }
        }
      }

    }

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', padding:'10px', border:mode === 'remark'? '1px solid skyblue' :'1px solid blue' , borderRadius:'5px', boxShadow:mode === 'remark' ? '0 0 10px skyblue' : '0 0 10px blue'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label className="form-label">Action ID</label>
            <input type="email" className="form-control" value='Auto' readOnly></input>
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Action Type</label>
            <input type="text" className="form-control" value={`${mode === 'remark' ? 'Remark' : 'Follow Up'} `} readOnly></input>
          </div>
          
          <div className="col-md-2">
          <label className="form-label">
            Action Date
          </label>
          <input className='form-control' type='date' value={new Date().toISOString().split('T')[0]}></input>
        </div>

          <div className='col-md-2'>
            <label className='form-label'>{mode === 'follow' ? 'Follow Up Particular' : 'Remark Particular'}</label>
            <select onChange={(e) => setRemarkParticular(e.target.value)} className="form-select">
              <option value=''>Choose...</option>
              {
                ArrayConcern.map((concern, index) => (
                  <option key={index} value={concern}>{concern}</option>
                ))
              }
              
            </select>
          </div>
          
        

        <div className="col-md-8">
            <label className="form-label">Description</label>
            <input onChange={(e) => setDescription(e.target.value)} type="text" className="form-control"></input>
          </div>
          
         
          <div className="col-8">
            <button onClick={savedata} type="button" className={`btn ${mode === 'remark' ? 'btn-outline-info' : 'btn-outline-primary'}`}>{`${mode === 'remark'? 'Add Remark' : 'Add Follow Up'}`}</button>
          </div>
        </form>

      </div>

    </div>  


  )
}
