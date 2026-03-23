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

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    console.log("sendPasswordResetEmail called");
    console.log("Recipient:", email);
    console.log("Reset link:", resetLink);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("sendPasswordResetEmail error:", error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};