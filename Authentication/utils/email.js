/*
 * Email sending helpers.
 *
 * If MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASS are configured in .env,
 * real emails are sent via Nodemailer SMTP (e.g. Mailtrap for dev).
 * Otherwise everything is logged to the console — perfect for local
 * testing without a mail server.
 */
const nodemailer = require("nodemailer");

const transporter = process.env.MAIL_HOST
  ? nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 2525),
      auth:
        process.env.MAIL_USER && process.env.MAIL_PASS
          ? {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            }
          : undefined,
    })
  : null;

const logEmail = (subject, to, body) => {
  console.log("\n==============================");
  console.log(`EMAIL (dev console mode): ${subject}`);
  console.log("To:", to);
  console.log(body);
  console.log("==============================\n");
};

const send = async (subject, to, body) => {
  if (transporter) {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "auth-api@example.com",
      to,
      subject,
      text: body,
      html: body.replace(
        /(https?:\/\/[^\s]+)/,
        '<a href="$1">$1</a>'
      ),
    });
    return;
  }
  logEmail(subject, to, body);
};

const appUrl = () =>
  `http://localhost:${process.env.PORT || 3000}`;

const sendVerificationEmail = (email, token) => {
  const link = `${appUrl()}/api/auth/verify-email?token=${token}`;
  return send(
    "Verify your email address",
    email,
    `Welcome! Please verify your email address by opening this link (valid for 15 minutes):\n\n${link}`
  );
};

const sendPasswordResetEmail = (email, token) => {
  const link = `${appUrl()}/api/auth/reset-password?token=${token}`;
  return send(
    "Reset your password",
    email,
    `A password reset was requested for your account. Open this link to choose a new password (valid for 15 minutes):\n\n${link}\n\nIf you did not request this, ignore this email.`
  );
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
