import React from 'react'

export default function Connection_Table() {
  return (
    <div style={{margin: '10px'}}>
        <div style={{float: 'right'}} className="dropdown">
        <a className="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Years
        </a>
        <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#">2024</a></li>
            <li><a className="dropdown-item" href="#">2023</a></li>
            <li><a className="dropdown-item" href="#">2022</a></li>
        </ul>
        </div>
      <table  className="table caption-top">
        <caption style={{fontSize: '20px', color: 'black', fontWeight: 'bold'}}>Connection Reports Yearly</caption>
        
        <thead>
            <tr>
            <th scope="col">S.No.</th>
            <th scope="col">New Connections</th>
            <th scope="col">Disconnected</th>
            <th scope="col">InActive</th>
            <th scope="col">Renewals</th>
            <th scope="col">Month Collection</th>
            <th scope="col">Month Due</th>
            <th scope="col">Rejected Leads</th>
            
            </tr>
        </thead>
        <tbody>
            <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
            </tr>
            <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>
            <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
            </tr>   
        </tbody>
        </table>
    </div>
  )
}
