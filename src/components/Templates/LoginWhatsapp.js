import React, { useState, useEffect } from 'react';

const LoginWhatsapp = () => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await fetch('https://99dd-103-87-49-95.ngrok-free.app/qr');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('QR Response:', data);
                setQrCode(data.qr);
            } catch (error) {
                console.error('Error fetching QR code:', error);
                setQrCode(null);
            } finally {
                setLoading(false);
            }
        };
    
        fetchQrCode();

        const intervalId = setInterval(fetchQrCode, 20000);

        return () => clearInterval(intervalId);
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
