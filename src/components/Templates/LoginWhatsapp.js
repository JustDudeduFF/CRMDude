import React, { useState, useEffect } from 'react';
import axios from 'axios';
import linked from './whatappdrawable/linked.png'
import unlinked from './whatappdrawable/link.png'

const LoginWhatsapp = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [header, setHeader] = useState('');


    const [qrCode2, setQrCode2] = useState(null);
    const [loading2, setLoading2] = useState(true);
    const [header2, setHeader2] = useState('');

    const [qrCode3, setQrCode3] = useState(null);
    const [loading3, setLoading3] = useState(true);
    const [header3, setHeader3] = useState('');




    
    



    const sendBulkMessage = async() => {
        //   for (let i = 0; i < 300; i++) {
        //         try {
        //         await axios.post('https://api.justdude.in/personal/send-message?number=918368665327&message=bhuuukkk lgg rhi ha mujheeee')
        //         console.log(`POST Call ${i + 1} done`);
        //         } catch (error) {
        //         console.error(`POST Call ${i + 1} failed:`, error);
        //         }
        //     }

    }


    // const handlePayment = async () => {
    //     try {
    //       // Create order on backend
    //       const { data } = await axios.post('https://finer-chimp-heavily.ngrok-free.app/create-order', {
    //         amount: 500, // Amount in INR
    //       });
    
    //       const options = {
    //         key: 'rzp_test_5tAkkRIcyGgC0k', // Replace with your Razorpay Key ID
    //         amount: data.amount,
    //         currency: data.currency,
    //         name: 'JustDude',
    //         description: 'Test Transaction',
    //         order_id: data.orderId,
    //         handler: async (response) => {
    //             console.log(response);
    //           // Send response to backend for verification
    //           const verifyResponse = await axios.post('https://finer-chimp-heavily.ngrok-free.app/verify-payment', {
    //             razorpay_order_id: response.razorpay_order_id,
    //             razorpay_payment_id: response.razorpay_payment_id,
    //             razorpay_signature: response.razorpay_signature,
    //           });


    //           console.log(verifyResponse.data);
    
    //           if (verifyResponse.data.success) {
    //             alert('Payment Successful and Verified!');
    //           } else {
    //             alert('Payment Verification Failed!');
    //           }
    //         },
    //         prefill: {
    //           name: 'John Doe',
    //           email: 'john.doe@example.com',
    //           contact: '9999999999',
    //         },
    //         theme: {
    //           color: '#3399cc',
    //         },
    //       };
    
    //       const rzp = new window.Razorpay(options);
    //       rzp.open();
    //     } catch (error) {
    //       console.error('Error during payment:', error);
    //     }
    // }

    return (
        <div className='d-flex flex-row align-item-center justify-content-center'>

        <div className='me-5' style={{marginTop:'4.5%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <h1>WhatsApp Bot Noida</h1>
            {loading2 ? (
                <p style={{marginTop:'10%'}}>Loading QR code...</p>
            ) : qrCode2 ? (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop:'10%'}}>
                    <p>{header2}</p>
                    <img style={{width:'200px', height:'200px', padding:'10px'}} src={qrCode2} alt="QR Code" />
                </div>

                
            ) : (
                <p>Failed to load QR code.</p>
            )}
        </div>

        <div className='ms-5' style={{marginTop:'4.5%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <h1>WhatsApp Bot Shahdara</h1>
            {loading ? (
                <p style={{marginTop:'10%'}}>Loading QR code...</p>
            ) : qrCode ? (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop:'10%'}}>
                    <p>{header}</p>
                    <img style={{width:'200px', height:'200px', padding:'10px'}} src={qrCode} alt="QR Code" />
                </div>

                
            ) : (
                <p>Failed to load QR code.</p>
            )}
        </div>

        <div className='ms-5' style={{marginTop:'4.5%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <h1>WhatsApp Bot Personal</h1>
            {loading ? (
                <p style={{marginTop:'10%'}}>Loading QR code...</p>
            ) : qrCode ? (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop:'10%'}}>
                    <p>{header3}</p>
                    <img style={{width:'200px', height:'200px', padding:'10px'}} src={qrCode3} alt="QR Code" />
                </div>

                
            ) : (
                <p>Failed to load QR code.</p>
            )}

            <button onClick={sendBulkMessage} className='btn-success'>Send Message</button>
        </div>

        </div>
    );
};

export default LoginWhatsapp;
