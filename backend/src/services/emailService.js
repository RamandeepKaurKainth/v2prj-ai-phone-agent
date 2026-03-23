const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

if (!process.env.EMAIL_USER) {
  throw new Error("Missing EMAIL_USER");
}

if (!process.env.EMAIL_PASS) {
  throw new Error("Missing EMAIL_PASS");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

transporter.verify((error) => {
  if (error) {
    console.error("Mailer verify failed:", error);
  } else {
    console.log("Mailer is ready");
  }
});

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    if (!email || !resetLink) {
      throw new Error("Email and resetLink are required");
    }

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