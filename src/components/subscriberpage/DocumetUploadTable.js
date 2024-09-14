import React, { useEffect, useState } from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'
import { get, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';

export default function DocumetUploadTable() {
  const username = localStorage.getItem('susbsUserid');

  const [address, setAddress] = useState('');
  const [identity, setIdentity] = useState('');
  const [caf, setCaf] = useState('');

  const docRef = ref(db, `Subscriber/${username}/documents`);

  useEffect(() => {
    const fetchdocs = async() => {
      const docSnap = await get(docRef);
      if(docSnap.exists){
        const proofs = docSnap.val();
        setAddress(proofs.addressProofURL);
        setCaf(proofs.cafDocumentsURL);
        setIdentity(proofs.identityProofURL);
      }else{
        alert('There is No Any Document');
      }
    }

    fetchdocs();
  }, [docRef]);

  

  return (
    <div>
        <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                      <td scope='col'>Source</td>
                      <td scope='col'>Documents Name</td>
                      <td scope='col'>Uploaded On Date</td>
                      <td scope='col'>Uploaded By</td>
                      <td scope='col'></td>
                      

                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>
                <tr>
                    <td>Manual</td>
                    <td style={{fontWeight:'bold'}}>Aadhar Card</td>
                    <td>01-Jan-2024 </td>
                    <td>Shivam Chauhan</td>
                    <td><div><img className='img_hover' src={DeleteIcon}></img><img className='img_hover' src={ExpandIcon}></img></div></td>
                    
                    
                    
                </tr>
                </tbody>

                </table>

    </div>
  )
}
