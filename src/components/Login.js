import React from 'react'
import './Login.css'
import Animationlogin from './Animationlogin'
import Loginlayout from './Loginlayout'

export default function Login() {
  return (
   <>
   <div style={{float: "left"}}>
    <Animationlogin/>
   </div>
   <div style={{float: 'right'}}>
    <Loginlayout/>
   </div>
   </>
  )
}
