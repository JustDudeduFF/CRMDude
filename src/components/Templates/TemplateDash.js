import React, { useState, useEffect, useRef } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../../FirebaseConfig';


export default function TemplateDash() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [templateType, setTemplateType] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templatePreview, setTemplatePreview] = useState('');

  const inputRefs = useRef([]);

  const handleDragStart = (event, value) => {
    event.dataTransfer.setData('text/plain', value);
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    const value = event.dataTransfer.getData('text/plain');
    inputRefs.current[index].value += (inputRefs.current[index].value ? ', ' : '') + value;
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default to allow drop
  };

  const uploadTemplate = () => {
    const templateRef = ref(db, `MessagingTemplates/${templateName}`);
    set(templateRef, {
      templateType: templateType,
      templateName: templateName,
      templatePreview: templatePreview
    });
  }

  useEffect(() => {
    onValue(ref(db, `MessagingTemplates`), (snapshot) => {
      if(snapshot.exists()){
        const templateName = snapshot.child("3").val().templateName;
        const templatePreview = snapshot.child("3").val().templatePreview;
        const templateType = snapshot.child("3").val().templateType;

        setTemplateName(templateName);
        setTemplatePreview(templatePreview);
        setTemplateType(templateType);
        console.log(templateName);
      }
    });
  }, []);

  return (
    <div className='d-flex flex-column' style={{marginTop:'4.5%', padding:'10px'}}>
        <h4>Create Messaging Templates</h4>
        <div className='d-flex flex-row'>
            <div style={{flex:'1'}} className='d-flex flex-column'>
            <h5 className='text-decoration-underline ms-3'>Whatsapp Templates</h5>
            <div style={{ overflow:'hidden', overflowY:'auto', scrollbarWidth:'none', height:'30vh'}} className='d-flex flex-column rounded   shadow'>
                
            <ul className="list-group list-group-flush rounded m-2">


            <li className="list-group-item shadow">Renewal Message</li>

            <li className="list-group-item shadow">Ticket Created</li>

            <li className="list-group-item shadow">Ticket Closed</li>


            
            </ul>
            </div>


            <h5 className='text-decoration-underline ms-3 mt-3'>Mail Templates</h5>
            <div style={{ overflow:'hidden', overflowY:'auto', scrollbarWidth:'none', height:'30vh'}} className='d-flex flex-column rounded   shadow'>
                
                <ul className="list-group list-group-flush rounded m-2">
    
    
                <li className="list-group-item shadow">Ticket Created</li>
    
                <li className="list-group-item shadow">Ticket Assigned</li>
    
                <li className="list-group-item shadow">Ticket Closed</li>
    
    
                
                </ul>
                </div>
            </div>

            <div style={{flex:'7'}}>
              <div className='d-flex flex-column ms-3'>
                <div className='d-flex flex-row'>
                  <h5 style={{flex:'1'}}>Template List</h5>
                  <button className='btn btn-outline-success' onClick={handleShow}>Create Template</button>
                </div>

                <div className='d-flex flex-column'>
                  <div className='d-flex flex-row'>
                    <h6>{templateName}</h6>
                    <p>{templatePreview}</p>
                  </div>
                </div>

              </div>
                
            </div>

        </div>

        <Modal show={show} onHide={handleClose} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Create Template</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <Form.Group className='mb-3 d-flex flex-row'>
                <Form.Group className='m-3'>
                    <Form.Label>Template Type</Form.Label>
                    <Form.Select value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
                      <option value=''>Select Template Type</option>
                      <option value='1'>Whatsapp Template</option>
                      <option value='2'>Mail Template</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className='m-3'>
                    <Form.Label>Template Name</Form.Label>
                    <Form.Select value={templateName} onChange={(e) => setTemplateName(e.target.value)}>
                      <option value=''>Select Template</option>
                      <option value='1'>Renewal Message</option>
                      <option value='2'>Ticket Created</option>
                      <option value='3'>Ticket Closed</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className='m-3 '>
                  <Form.Label className='ms-2 text-decoration-underline'>Event Selection</Form.Label><br/>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'customer_name')}
                  >
                    Name
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'customer_email')}
                  >
                    Email
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'customer_phone')}
                  >
                    Phone
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'expiry_date')}
                  >
                    Expiry Date
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'activation_date')}
                  >
                    Activation Date
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'ticket_id')}
                  >
                    Ticket ID
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'ticket_concern')}
                  >
                    Ticket Concern
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, 'ticket_status')}
                  >
                    Ticket Status
                  </Form.Label>
                </Form.Group>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Enter Template Data</Form.Label>
                {Array.from({ length: 7 }).map((_, index) => (
                  <Form.Control 
                    key={index} 
                    type='text' 
                    className='mb-2' 
                    ref={el => inputRefs.current[index] = el} 
                    onDrop={(e) => handleDrop(e, index)} 
                    onDragOver={handleDragOver} 
                  />
                ))}
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Template Preview</Form.Label>
                <Form.Control as='textarea' rows={5} value={templatePreview} onChange={(e) => setTemplatePreview(e.target.value)} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-outline-success' onClick={uploadTemplate}>Upload Template</button>
          </Modal.Footer>

        </Modal>
    </div>
  )
}
