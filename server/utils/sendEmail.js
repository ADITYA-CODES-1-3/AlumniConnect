const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Cloud Server Optimizations
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
      socketTimeout: 10000,     // 10 seconds
      debug: true,              // Show debug output
      logger: true              // Log information to console
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
    console.error(" Email NOT sent. Error details:");
    console.error(error);
  }
};

module.exports = sendEmail;