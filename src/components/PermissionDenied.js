import React from 'react'
import { Modal } from 'react-bootstrap'
import Denied from './subscriberpage/drawables/permissionAnimate.json'
import Lottie from 'lottie-react';
function PermissionDenied({setshow, setonHide}) {

    if(!setshow) return null;
  return (
    <Modal show={setshow} onHide={setonHide} centered>
        <div className='d-flex flex-column container justify-content-center align-items-center p-3'>
            <h3 className='fw-bold text-danger'>Permission Denied</h3>
            <Lottie className='w-50' animationData={Denied}></Lottie>
            <span>Please Contact Admin!</span>
        </div>
    </Modal>
  )
}

export default PermissionDenied
