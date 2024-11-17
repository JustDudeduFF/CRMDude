import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ref, onValue } from 'firebase/database';
import { db } from '../FirebaseConfig';

const Sendmail = () => {
  const [emailData, setEmailData] = useState({
    from: '',
    to: '',
    subject: '',
    text: '',
    html: '',
  });


  const [templateName, setTemplateName] = useState('');

  const handleChange = (e) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    onValue(ref(db, `MessagingTemplates`), (snapshot) => {
      if(snapshot.exists()){
        const templateName = snapshot.child("3").val().templatePreview;
        setTemplateName(templateName);

      }
    });
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();

    const message = templateName;

    try {
      const response = await axios.post('https://9a30-103-178-60-20.ngrok-free.app/sendmail', emailData);
      const whatsapp = await axios.post('https://9a30-103-178-60-20.ngrok-free.app/send-message?number=919266125445&message='+message);
      alert(whatsapp.status);
      alert(response.data.message);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email.');
    }
  };

  return (
    <div style={{marginLeft:'20px', marginTop:'4.5%'}}>
      <h1>Send Email</h1>
      <form onSubmit={handleSendEmail}>
        <input
          type="email"
          name="from"
          placeholder="From"
          value={emailData.from}
          onChange={handleChange}
        />
        <input
          type="email"
          name="to"
          placeholder="To"
          value={emailData.to}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={emailData.subject}
          onChange={handleChange}
          required
        />
        <textarea
          name="text"
          placeholder="Plain text body"
          value={emailData.text}
          onChange={handleChange}
        ></textarea>
        <textarea
          name="html"
          placeholder="HTML body"
          value={emailData.html}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Send Email</button>
      </form>
    </div>
  );
};

export default Sendmail;
