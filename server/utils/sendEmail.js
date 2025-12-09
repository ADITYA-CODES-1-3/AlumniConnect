const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com", // Brevo's SMTP Server
      port: 587,                    // Standard Secure Port
      secure: false,                // True for 465, false for other ports
      auth: {
        user: process.env.BREVO_USER, // Your Brevo Login Email
        pass: process.env.BREVO_PASS, // Your Brevo SMTP Key
      },
    });

    console.log(`Attempting to send email to: ${email}`);

    const info = await transporter.sendMail({
      from: `"AlumniConnect Admin" <${process.env.BREVO_USER}>`, // Must match your verified sender email
      to: email,
      subject: subject,
      text: text,
    });

    console.log("✅ Email sent successfully via Brevo. ID: " + info.messageId);
  } catch (error) {
    console.error("❌ Email NOT sent. Error:", error);
  }
};

module.exports = sendEmail;