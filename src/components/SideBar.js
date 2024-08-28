import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'

export default function SideBar() {

    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () =>{
        setIsOpen(!isOpen);
    }

  return (
    <div className={`sidebar ${isOpen ? `open` : 'closed'}`}>
        <button style={{backgroundColor: '#111', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', bottom: '0'}}  className='toggle-btn' onClick={toggleSidebar}>{isOpen ? 'Close' : 'Open'}</button>
        {isOpen && (
            <>
            <h2>SideBar</h2>
            <ul>
                <li><Link style={{textDecoration: 'none', color: 'white', display: 'block' }} to='/dashboard'>Dashboard</Link></li>
                <li><Link style={{textDecoration: 'none', color: 'white', display: 'block' }} to='/'>Reports</Link></li>
                <li><Link style={{textDecoration: 'none', color: 'white', display: 'block' }} to='/dashboard'></Link></li>
                <li><Link style={{textDecoration: 'none', color: 'white', display: 'block' }} to='/dashboard'></Link></li>
            </ul>
            </>
        )}
        
      
    </div>
  )
}
