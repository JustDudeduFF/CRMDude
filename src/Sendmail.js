// sendMail.js
const nodemailer = require('nodemailer');

// Function to send an email
const sendMail = async ({ from, to, subject, text, html, attachments }) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password', // Replace with your password or app password
      },
    });

    // Set up mail options
    const mailOptions = {
      from: from || 'your-email@gmail.com', // Default sender if not provided
      to,
      subject,
      text,
      html,
      attachments,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendMail;
