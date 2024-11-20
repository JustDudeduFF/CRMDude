import React, { useState, useEffect } from 'react';
import axios from 'axios';
import linked from './whatappdrawable/linked.png'
import unlinked from './whatappdrawable/link.png'

const LoginWhatsapp = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await axios.post('https://7f7c-103-87-49-95.ngrok-free.app/qr');
                console.log('QR Response:', response.data.qr);
                if(!response.data.qr === "Whatsapp Clien is ready!"){
                    setQrCode(linked);
                    console.log(response.data.qr)
                }else{
                    setQrCode(response.data.qr);
                    console.log(response.data.qr)
                }
                
            } catch (error) {
                console.error('Error fetching QR code:', error);
                setQrCode(null);
                setQrCode(unlinked)
            } finally {
                setLoading(false);
            }
        };

        const fetchStatus = async () => {
            const response = await axios.post('https://7f7c-103-87-49-95.ngrok-free.app/status');
            if(response.data.status === "Whatsapp Clien is ready!"){
                setQrCode(linked)
            }else{
                fetchQrCode(); // Initial fetch
                setQrCode(unlinked)
            }
            console.log('Status Response:', response.data.status);
        }
    
        


        const intervalIdStatus = setInterval(fetchStatus, 15000);    // Fetch every 20 seconds

        return () => {

            clearInterval(intervalIdStatus);
        }; // Cleanup on unmount
    }, []);

    return (
        <div style={{marginTop:'4.5%'}}>
            <h1>WhatsApp Bot</h1>
            {loading ? (
                <p>Loading QR code...</p>
            ) : qrCode ? (
                <div>
                    <p>Scan this QR code with WhatsApp to connect:</p>
                    <img style={{width:'200px', height:'200px'}} src={qrCode} alt="QR Code" />
                </div>
            ) : (
                <p>Failed to load QR code.</p>
            )}
        </div>
    );
};

export default LoginWhatsapp;
