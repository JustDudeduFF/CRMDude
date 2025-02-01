import React from 'react'
import Lottie from 'lottie-react'
import DashAnimate from './reportanimation.json'

export default function ReportDash() {
  return (
    <div>
      <Lottie style={{height:'69vh'}} animationData={DashAnimate}/>
    </div>
  )
}
