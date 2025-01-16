import React, { useState } from 'react'
import { db, storage } from '../../FirebaseConfig';
import {  uploadBytes, getDownloadURL, ref as dbRef } from "firebase/storage";
import { ref, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

export default function AddNewDoc() {
  const userid = localStorage.getItem('susbsUserid');
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [btnMode, setBtnMode] = useState(true);
  const maxSizeInMB = 5; // Maximum file size in MB
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the selected file

    setSelectedFile(null);

    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024); // Convert file size to MB

      if (fileSizeInMB > maxSizeInMB) {
        alert(`File size exceeds the maximum limit of ${maxSizeInMB} MB.`);
        setSelectedFile(null);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type. Allowed types are: ${allowedTypes.join(", ")}.`);
        setSelectedFile(null);
        return;
      }

      // If valid, set the file
      setSelectedFile(file);
      setBtnMode(false);
    }
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const storageRef = dbRef(storage, `${folder}/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };      

  const uploadDoc = async() => {
    setBtnMode(true); 
    if(selectedFile !== null && documentType !== null){
      const timestamp = Date.now();
      try{
        const documetUrl = await uploadFile(selectedFile, documentType);

        const documentData = {
          source: 'Manual',
          date: new Date().toISOString().split('T')[0],
          modifiedby: localStorage.getItem('contact'),
          documentname: documentType,
          url: documetUrl,
          key: timestamp               
        }

        await update(ref(db, `Subscriber/${userid}/documents/${timestamp}`), documentData);
        alert(`${documentType} is uploded succesfully`);
        navigate(-1);
        
      }catch(e){
        console.log(e);
      }
    }else{
      alert("Please Add All Details and try again!")
    }
  }



  return (
    
        <div style={{display:'flex', flexDirection:'column'}} className="input-group">
        <div style={{flex:'1'}} className="col-md-4">
            <label className="form-label">Select Document Name</label>
            <select onChange={(e) => setDocumentType(e.target.value)} className="form-select">
              <option value=''>Choose...</option>
              <option value="addressProof">Address Proof</option>
              <option value="identityProof">Identity Proof</option>
              <option value="cafDocuments">CAF Documents</option>

            </select>
            
          </div>

          <div style={{flex:'1', marginTop:'20px'}}>
          <input onChange={handleFileChange} type="file" className="form-control"></input>
          <span className='ms-2 text-danger'>*File is not more than 5mb*</span><br></br>
          <button onClick={uploadDoc} className="btn btn-outline-secondary mt-2" disabled={btnMode}>Upload Document</button>
          </div>

        </div>
  
  )
}
