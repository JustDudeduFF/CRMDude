import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginWhatsapp = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await axios.get('https://99dd-103-87-49-95.ngrok-free.app/qr');
                console.log('QR Response:', response.data); // Log entire response
                setQrCode(response.data.qr); // Set the QR code if available
            } catch (error) {
                console.error('Error fetching QR code:', error);
                setQrCode(null);
            } finally {
                setLoading(false);
            }
        };
    
        fetchQrCode(); // Initial fetch

        const intervalId = setInterval(fetchQrCode, 20000); // Fetch every 20 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return (
        <div style={{marginTop:'4.5%'}}>
            <h1>WhatsApp Bot</h1>
            {loading ? (
                <p>Loading QR code...</p>
            ) : qrCode ? (
                <div>
                    <p>Scan this QR code with WhatsApp to connect:</p>
                    <img src={qrCode} alt="QR Code" />
                </div>
            ) : (
                <p>Failed to load QR code.</p>
            )}
        </div>
    );
};

export default LoginWhatsapp;
