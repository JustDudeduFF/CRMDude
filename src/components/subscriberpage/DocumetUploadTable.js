import React, { useEffect, useState } from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'
import { get, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { add } from 'date-fns';

export default function DocumetUploadTable() {
  const username = localStorage.getItem('susbsUserid');

  const [address, setAddress] = useState('');
  const [identity, setIdentity] = useState('');
  const [caf, setCaf] = useState('');

  const docsArray = [];

  const docRef = ref(db, `Subscriber/${username}/documents`);

    useEffect(() => {
      const fetchdocs = async() => {
        const docSnap = await get(docRef);
        
        if(docSnap.exists){
          const address = docSnap.val().addressProofURL;
          const caf = docSnap.val().cafDocumentsURL;
          const identity = docSnap.val().identityProofURL;
          docsArray.push({address, caf, identity});
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
                      <th scope='col'>Source</th>
                      <th scope='col'>Documents Name</th>
                      <th scope='col'>Uploaded On Date</th>
                      <th scope='col'>Uploaded By</th>
                      <th scope='col'></th>
                      

                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>

                  {
                    docsArray.length > 0 ? (
                      docsArray.map(({caf, address, identity}, index) => (
                        <tr key={index}>
                          <td>{}</td>
                        </tr>
                      ))
                    ) : (
                      <td colSpan={8} style={{textAlign:'center'}}>No Data Found</td>
                    )
                  }
                
                </tbody>

                </table>

    </div>
  )
}
