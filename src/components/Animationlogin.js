import React from 'react'
import Lottie from 'lottie-react';
import animationData from './frontanimation.json'
import './Login.css'

export default function Animation_login() {
  return (
    <>
    <h1 style={{marginLeft:"30px", marginTop:"10px", color:"blue"}}>CRM Dude</h1>
    <div style={{ marginLeft: '30px', marginTop: '50px', width: '700px', height: '700px' }}> {/* Adjust size as needed */}
      <Lottie animationData={animationData} />
    </div>
    </>
  )
}
