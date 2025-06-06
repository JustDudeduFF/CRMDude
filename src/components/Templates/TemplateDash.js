import React, { useState, useEffect, useRef } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../../FirebaseConfig';
import IPhone11 from '../Iphone11';


export default function TemplateDash() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);


  const [templateType, setTemplateType] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templatePreview, setTemplatePreview] = useState(``);
  const [eventShow, setEventShow] = useState({
    c_name:false,
    c_email:false,
    c_phone:false,
    expiry_date:false,
    activate_date:false,
    ticket_id:false,
    ticket_concern:false,
    ticket_status:false,
    ticet_creation_date:false,
    happy_code:false,
    company_number:false,
    ticket_assign_emp:false,
    ticket_assign_emp_mobile:false
  });

  const handleShow = (text) => {
    if(text==='ticket_created'){
      setEventShow({
        ...eventShow,
        c_email:true,
        c_phone:true,
        expiry_date:true,
        activate_date:true,

      })
    }
    setShow(true);
  }

  const whatsappTemplate = {
    body: templatePreview
  };

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
        
        <div className='d-flex flex-row'>
            <div style={{flex:'1'}} className='d-flex flex-column'>
            <h5 className='text-decoration-underline ms-3'>Whatsapp Templates</h5>
            <div style={{ overflow:'hidden', overflowY:'auto', scrollbarWidth:'none', height:'30vh'}} className='d-flex flex-column rounded   shadow'>
                
            <ul className="list-group list-group-flush rounded m-2">


            <li className="list-group-item shadow">Renewal Message <span className='ms-3 badge text-bg-success'>+ Add</span></li>

            <li className="list-group-item shadow">Ticket Created <span onClick={() => handleShow('ticket_created')} className='ms-3 badge text-bg-success'>+ Add</span></li>

            <li className="list-group-item shadow">Ticket Closed <span className='ms-3 badge text-bg-success'>+ Add</span></li>


            
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
                  <h5 style={{flex:'1'}}>Template Preview</h5>
                  
                </div>

                <div className='d-flex flex-column'>
                  <div className='align-items-center'>
                    <IPhone11 template={whatsappTemplate}/>
                    
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
            <div className='d-flex flex-row'>
            <Form>
              <Form.Group className='mb-3 d-flex flex-row'>

                <Form.Group className='m-3 '>
                  <Form.Label className='ms-2 text-decoration-underline'>Event Selection</Form.Label><br/>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${fullName}')}
                    visuallyHidden={eventShow.c_name}
                  >
                    Customer Name
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${customer_email}')}
                    visuallyHidden={eventShow.c_email}
                  >
                    Customer Email
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${customer_phone}')}
                    visuallyHidden={eventShow.c_phone}
                  >
                    Customer Phone
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${expiry_date}')}
                    visuallyHidden={eventShow.expiry_date}
                  >
                    Expiry Date
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${activation_date}')}
                    visuallyHidden={eventShow.activate_date}
                  >
                    Activation Date
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${ticket_id}')}
                    visuallyHidden={eventShow.ticket_id}
                  >
                    Ticket ID
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${ticket_concern}')}
                    visuallyHidden={eventShow.ticket_concern}
                  >
                    Ticket Concern
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${ticket_status}')}
                    visuallyHidden={eventShow.ticket_status}
                  >
                    Ticket Status
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${ticket_create_date}')}
                    visuallyHidden={eventShow.ticet_creation_date}
                  >
                    Ticket Create Date
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${happy_code}')}
                    visuallyHidden={eventShow.happy_code}
                  >
                    Happy Code
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${company_contact_number}')}
                    visuallyHidden={eventShow.company_number}
                  >
                    Company Contact Number
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${ticket_assignempemp}')}
                    visuallyHidden={eventShow.ticket_assign_emp}
                  >
                    Ticket Assign Emp Name
                  </Form.Label>
                  <Form.Label 
                    className='ms-2 p-2 bg-light rounded pointer' 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, '${ticket_assignempmobile}')}
                    visuallyHidden={eventShow.ticket_assign_emp_mobile}
                  >
                    Ticket Assign Emp Mobile
                  </Form.Label>
                </Form.Group>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Template Preview</Form.Label>
                <Form.Control as='textarea' rows={15} value={templatePreview} onChange={(e) => setTemplatePreview(e.target.value)} />
              </Form.Group>
            </Form>
            <IPhone11 
              template={whatsappTemplate}
            />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-outline-success' onClick={uploadTemplate}>Upload Template</button>
          </Modal.Footer>

        </Modal>
    </div>
  )
}