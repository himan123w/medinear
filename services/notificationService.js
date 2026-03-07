const nodemailer = require('nodemailer');

// Simple notification service that uses nodemailer for email
// and Twilio (if configured) for SMS. If env vars are missing,
// it falls back to logging.

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('NotificationService: SMTP not configured, logging email instead:', { to, subject, text });
      return { logged: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });

    return { sent: true, info };
  } catch (err) {
    console.error('NotificationService.sendEmail error:', err.message);
    return { error: err.message };
  }
};

const sendSMS = async ({ to, body }) => {
  try {
    // If Twilio configured, use it
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
      const Twilio = require('twilio');
      const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const msg = await client.messages.create({ body, from: process.env.TWILIO_FROM, to });
      return { sent: true, sid: msg.sid };
    }

    console.log('NotificationService: TWILIO not configured, logging SMS instead:', { to, body });
    return { logged: true };
  } catch (err) {
    console.error('NotificationService.sendSMS error:', err.message);
    return { error: err.message };
  }
};

module.exports = {
  sendEmail,
  sendSMS
};
