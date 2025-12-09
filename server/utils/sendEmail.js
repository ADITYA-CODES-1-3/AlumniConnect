const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,            // Port 465 is CRITICAL for Render
      secure: true,         // Must be true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Settings to prevent timeouts on cloud servers
      connectionTimeout: 10000, 
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    console.log(`Attempting to send email to: ${email}`);

    const info = await transporter.sendMail({
      from: `"AlumniConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: text,
    });

    console.log(" Email sent successfully. Message ID: " + info.messageId);
  } catch (error) {
    console.error(" Email NOT sent. Error:", error.message);
    // We do NOT throw the error here so the server doesn't crash
  }
};

module.exports = sendEmail;