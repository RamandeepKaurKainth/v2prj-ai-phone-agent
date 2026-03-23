const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4 // IMPORTANT FIX
});

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  console.log("Sending email to:", toEmail);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Reset your AI Phone Agent password",
    html: `
      <h2>Password Reset</h2>
      <p>Click below:</p>
      <a href="${resetLink}">Reset Password</a>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

module.exports = {
  sendPasswordResetEmail
};