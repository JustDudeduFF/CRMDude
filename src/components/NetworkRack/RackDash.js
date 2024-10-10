import React, { useState } from 'react'
import Lottie from 'lottie-react'
import ServerAnimation from './rackanimate.json'


export default function RackDash() {

    


  return (
    <div>
        <Lottie style={{height:'69vh'}} animationData={ServerAnimation}></Lottie>
    </div>
    

  )
}
