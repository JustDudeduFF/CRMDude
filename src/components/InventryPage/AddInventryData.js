import React, { useEffect, useState } from 'react'
import '../Modal.css'
import axios from 'axios';


const AddInventryData = ({show, AddDevice, TypeDevice, DeviceSerial, makerName, DeviceMac, modalshow, devicetype, company}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isVisible2, setIsVisible2] = useState(false);
    const [note, setNote] = useState('Please Confirm Company');
    const [buttontext, setButtonText] = useState('Add Device');
    const [arraymakerm, setArrayMaker] = useState([]);
    const [companyArray, setCompanyArray] = useState([]);

    const fetchmakername = async() => {
        const response = await axios.get('https://api.justdude.in/master/dMakers');
        

        const [makerResponse, companyResponse] = await Promise.all([
            await axios.get('https://api.justdude.in/master/dMakers'),
            await axios.get('https://api.justdude.in/master/companys')
        ]);

        if(makerResponse.status !== 200 || companyResponse.status !== 200) {
            console.log("One or More API Failed");
            return;
        }

        const data = makerResponse.data;
        const companyData = companyResponse.data;


        if(data){
            const array = [];
            Object.keys(data).forEach((key) => {
                array.push(key);
            });
            setArrayMaker(array);
        }

        if(companyData){
            const array = [];
            Object.keys(companyData).forEach((key) => {
                if(key !== "global"){
                    array.push(key);
                }
            });
            setCompanyArray(array);
        }

      }



    useEffect(() => {
          return () => {
            fetchmakername();
          }
    }, [])

    

    
    if(!show) return null;

    const handleChange = (event) => {
        const Target = event.target.value;

        if(Target === 'Individual'){
            setNote('Please Confirm Company')
            setIsVisible(true);
            setIsVisible2(false);
            setButtonText('Add Device');

        }else{
            setNote('First Download Sample File')
            setIsVisible(false);
            setIsVisible2(true);
            setButtonText('Upload Data');
        }

    }
    return(
       <div className='modal-overlay1'>
        <div className='modal-content1 d-flex flex-column'>
            <div className='d-flex flex-row bg-info rounded'>
                <div className='m-2 d-flex flex-column col-md-2'>
                    <span className='ms-2'>
                        Device Type
                    </span>
                    <select onChange={devicetype} className='form-select'>
                        <option value=''>Choose...</option>
                        <option value='ONT'>ONT</option>
                        <option value='ONU'>ONU</option>
                        <option value='Router'>Router</option>


                    </select>
                </div>

                <div className='m-2 d-flex flex-column col-md-3'>
                    <span className='ms-2'>Device Added For</span>
                    <select onChange={TypeDevice} className='form-select'>
                        <option value=''>Choose</option>
                        <option value='free'>New Stock</option>
                        <option value='damaged'>Damaged Devices</option>
                        <option value='repair'>Device on Repair</option>
                    </select>
                </div>

                <div className='m-2 d-flex flex-column col-md-3'>
                    <span className='ms-2'>Entry Type</span>
                    <select onChange={handleChange} className='form-select'>
                        <option>Choose...</option>
                        <option>Individual</option>
                        <option>Bulk</option>
                    </select>
                </div>

                <div className='m-2 d-flex flex-column col-md-3'>
                    <span className='ms-2'>Select Company</span>
                    <select onChange={company} className='form-select'>
                        <option value=''>Choose...</option>
                        {
                            companyArray.length > 0 ? (
                                companyArray.map((company, index) => (
                                    <option key={index} value={company}>{company}</option>
                                ))
                            ) : (
                                <option value='' >No Data Availabale!</option>
                            )
                        }
                    </select>
                </div>
            </div>

            

            <div className='d-flex flex-column'>
                <span>{`Note :- ${note}`}</span>
                <div>
                    {isVisible &&
                                <form className='row g-3 mt-2 mb-3'>
                                <div className='col-md-4'>
                                    <label className='form-label ms-1'>Device Maker Name</label>
                                    <select onChange={makerName} className='form-select'>
                                        <option value=''>Choose...</option>
                                        {
                                            arraymakerm.length > 0 ? (
                                                arraymakerm.map((makername, index) => (
                                                    <option key={index} value={makername}>{makername}</option>
                                                ))
                                            ) : (
                                                <option value=''>No Maker Availabale</option>
                                            )
                                        }
                                    </select>
                            </div>

                                <div className='col-md-4'>
                                    <label className='form-label ms-1'>Device Serial No.</label>
                                    <input onChange={DeviceSerial} className='form-control'></input>
                                </div>

                                <div className='col-md-4'>
                                    <label className='form-label ms-1'>Device mac No.</label>
                                    <input onChange={DeviceMac} className='form-control'></input>
                                </div>

                            </form>
                    }

                    {
                        isVisible2 &&

                        
                    <form className='row g-3 mt-2'>
                    <div className='col'>
                        <label className='form-label'>Select Excel File</label>
                        <div class="input-group mb-3">
                        <input type="file" class="form-control" id="inputGroupFile02"></input>
                        </div>
                    </div>

                </form>
                    }
                    

                </div>
            </div>

            <div className='d-flex flex-row'>
            <button style={{flex:'1'}} onClick={AddDevice} className='btn btn-outline-primary'>{`${buttontext}`}</button>
            <button onClick={modalshow} style={{flex:'1'}} className='btn btn-outline-secondary ms-2'>Cancel</button>
            </div>
            
            

        </div>
        
       </div> 
    );
};


export default  AddInventryData;