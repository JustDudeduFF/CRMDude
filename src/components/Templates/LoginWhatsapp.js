import React, { useState, useEffect } from 'react';
import axios from 'axios';
import linked from './whatappdrawable/linked.png'
import unlinked from './whatappdrawable/link.png'

const LoginWhatsapp = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [text, settext] = useState('');

    useEffect(() => {
        const getStatus = async () => {
            try {
                const response = await axios.post('https://7f7c-103-87-49-95.ngrok-free.app/status');
                if (response.status !== 200) {
                    // If status is not 200, call the QR code API
                    await getQRCode();
                    settext('Please Scan Code to Connect with API')
                }else{
                    setLoading(false);
                    settext('You Already Connected with API Service')
                    setQrCode(linked);
                }
            } catch (error) {
                console.error('Error fetching status:', error);
                // Call the QR code API in case of an error
                await getQRCode();
            }
        };

        const getQRCode = async () => {
            try {
                const qrResponse = await axios.post('https://7f7c-103-87-49-95.ngrok-free.app/qr');
                setQrCode(qrResponse.data.qr);
                settext('Please Scan Qr Code to Connect with API')
                setLoading(false);
                console.log('QR Code fetched successfully:', qrResponse.data.qr);
            } catch (error) {
                setQrCode(unlinked);
                settext('Failed to get Qr Code Please Contact Devloper')
                console.error('Error fetching QR Code:', error);
            }
        };

        // Poll the server every 5 seconds for updates
        const interval = setInterval(getStatus, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);

    }, []);

    return (
        <div style={{marginTop:'14.5%', marginLeft:'42%'}}>
            <h1>WhatsApp Bot</h1>
            {loading ? (
                <p>Loading QR code...</p>
            ) : qrCode ? (
                <div>
                    <p>{`${text}:`}</p>
                    <img style={{width:'200px', height:'200px'}} src={qrCode} alt="QR Code" />
                </div>
            ) : (
                <p>Failed to load QR code.</p>
            )}
        </div>
    );
};

export default LoginWhatsapp;
