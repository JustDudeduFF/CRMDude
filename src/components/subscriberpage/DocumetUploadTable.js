import React, { useEffect, useState } from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'
import { onValue, ref, remove, set } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { getStorage, ref as dbRef, deleteObject } from "firebase/storage";


export default function DocumetUploadTable() {
  const username = localStorage.getItem('susbsUserid');

  const [arraydocument, setArrayDocument] = useState([]);

  const extractFilePathFromUrl = (url) => {
    const decodedUrl = decodeURIComponent(url); // Decode URL-encoded characters
    const match = decodedUrl.match(/\/o\/(.*?)\?/); // Extract the file path
    return match ? match[1] : null;
  };

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
            const key = childs.val().key;
            docsArray.push({source, date, modifiedby, documentname, url, key});
          });
          setArrayDocument(docsArray);
        }
      }))

      fetchdocs();
    }, []);


    const deleteFileFromUrl = async (downloadUrl, key) => {
      const storage = getStorage();
  
      // Extract file path from the download URL
      const filePath = extractFilePathFromUrl(downloadUrl);
      if (!filePath) {
          console.error("Invalid download URL. Unable to extract file path.");
          return;
      }
  
      // Create a reference to the file
      const fileRef = dbRef(storage, filePath);
      const deleteRef = ref(db, `Subscriber/${username}/documents/${key}`);
      try {
          await remove(deleteRef);
          await deleteObject(fileRef).then(async() => {
            const logRef = ref(db, `Subscriber/${username}/logs/${key}`);

            const logData = {
              date: new Date().toISOString().split('T')[0],
              modifiedby: localStorage.getItem('contact'),
              description: `Document Deleted`
            }

            await set(logRef, logData);
            alert('Document Deleted Successfully');
          });


          
      } catch (error) {
          console.error("Error deleting file:", error);
      }
    };

  

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
                      arraydocument.map(({source, date, modifiedby, documentname, url, key}, index) => (
                        <tr key={index}>
                          <td>{source}</td>
                          <td>{documentname}</td>
                          <td>{date}</td>
                          <td>{modifiedby}</td>
                          <td><a href={url} target='_blank' rel="noreferrer">
                          <img className='me-5' src={ExpandIcon} alt='delete' style={{width:'30px', cursor:'pointer'}}></img>
                          </a>  <img onClick={() => deleteFileFromUrl(url, key)} src={DeleteIcon} alt='delete' style={{width:'30px', cursor:'pointer'}}></img></td>
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
