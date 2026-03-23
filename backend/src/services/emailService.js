const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Mailer verify failed:", error);
  } else {
    console.log("Mailer is ready");
  }
});

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    console.log("sendPasswordResetEmail called");
    console.log("Recipient:", email);
    console.log("Reset link:", resetLink);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

    const info = await transporter.sendMail({
      from: `"AI Phone Agent" <${process.env.EMAIL_USER}>`,
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