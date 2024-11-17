const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Send email endpoint
app.post('/sendmail', async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sigmafibernet.71@gmail.com', // Replace with your email
        pass: 'ljofvkmshapwfaio', // Replace with your password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: 'Sigma Business Solutions <sigmafibernet.71@gmail.com>', // Custom sender name
      to: to, // Receiver's email
      subject: subject,
      text: text,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    res.status(200).json({ message: 'Email sent successfully!', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.', error });
  }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
