import React, { useEffect, useState } from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'
import axios from 'axios';
import { api2 } from '../../FirebaseConfig';
import './DocumetUploadTable.css';



export default function DocumetUploadTable() {
  const username = localStorage.getItem('susbsUserid');

  const [arraydocument, setArrayDocument] = useState([]);


  const fetchdocs = async () => {
    const response = await axios.get(`${api2}/subscriber/documents/${username}`);
    setArrayDocument(response.data);
  }

    useEffect(() => {

      fetchdocs();
    }, []);


    const deleteFileFromUrl = async (documentname, key) => {
      const deleteData = {
        _id: key,
        modifiedby: localStorage.getItem('contact'),
        documentname: documentname,
      };
    
      try {
        await axios.delete(`${api2}/subscriber/documents/${username}`, {
          data: deleteData,
        });
        fetchdocs();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    };
    


  

  return (

      <div className="document-upload-table-wrapper">
        <table className="document-upload-table">
                <thead>
                    <tr>
                      <th scope='col'>Source</th>
                      <th scope='col'>Documents Name</th>
                      <th scope='col'>Uploaded On Date</th>
                      <th scope='col'>Uploaded By</th>
                      <th scope='col'></th>
                      

                        
                    </tr>
                </thead>
                <tbody>

                  {
                    arraydocument.length > 0 ? (
                      arraydocument.map(({source, date, modifiedby, documentname, url, _id}, index) => (
                        <tr key={index}>
                          <td>{source}</td>
                          <td>{documentname}</td>
                          <td>{date}</td>
                          <td>{modifiedby}</td>
                          <td>
                            <a href={url.includes('documentsCRM') ? `https://api.justdude.in:5000${url}` : url} target='_blank' rel="noreferrer">
                              <img className='document-upload-action-icon document-upload-expand-icon' src={ExpandIcon} alt='expand' />
                            </a>
                            <img onClick={() => deleteFileFromUrl(documentname, _id)} src={DeleteIcon} alt='delete' className='document-upload-action-icon document-upload-delete-icon' />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="document-upload-no-data">No documents found</td>
                      </tr>
                    )
                  }
                
                </tbody>

        </table>
      </div>

  )
}
