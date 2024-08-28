import React from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'

export default function DocumetUploadTable() {
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
