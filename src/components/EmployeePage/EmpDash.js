import Lottie from 'lottie-react'
import React from 'react'
import EmpDashAnimaiton from './EMPdraw/EmpDashAnimation.json'

export default function EmpDash() {
  return (
    <div >
        <Lottie style={{height:'69vh'}} animationData={EmpDashAnimaiton}></Lottie>
    </div>
  )
}
