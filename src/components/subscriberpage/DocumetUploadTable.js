import React, { useEffect, useState } from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'
import { onValue, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';


export default function DocumetUploadTable() {
  const username = localStorage.getItem('susbsUserid');

  const [arraydocument, setArrayDocument] = useState([]);






  const docRef = ref(db, `Subscriber/${username}/documents`);

    useEffect(() => {
      const fetchdocs = onValue(docRef, (docSnap => {
        if(docSnap.exists()){
          const docsArray = [];
          docSnap.forEach(childs => {
            const source = childs.val().source;
            const date = childs.val().date;
            const modifiedby = childs.val().modifiedby;
            const documentname = childs.val().documentname;
            const url = childs.val().url;

            docsArray.push({source, date, modifiedby, documentname, url});
          });
          setArrayDocument(docsArray);
        }
      }))

      fetchdocs();
    }, []);

  

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
                    arraydocument.length > 0 ? (
                      arraydocument.map(({source, date, modifiedby, documentname, url}, index) => (
                        <tr key={index}>
                          <td>{source}</td>
                          <td>{documentname}</td>
                          <td>{date}</td>
                          <td>{modifiedby}</td>
                          <td><a href={url} target='_blank' rel="noreferrer">
                          <img className='me-5' src={ExpandIcon} alt='delete' style={{width:'30px', cursor:'pointer'}}></img>
                          </a>  <img src={DeleteIcon} alt='delete' style={{width:'30px', cursor:'pointer'}}></img></td>
                        </tr>
                      ))
                    ) : (
                      <tr></tr>
                    )
                  }
                
                </tbody>

                </table>

    </div>
  )
}
