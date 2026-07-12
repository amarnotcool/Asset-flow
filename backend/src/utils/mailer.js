import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail SMTP
// Uses port 587 with STARTTLS (more firewall-friendly than port 465)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log('✅ Email service connected successfully'))
  .catch((err) => console.error('❌ Email service error:', err.message));

/**
 * Send an OTP email for password reset
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 * @param {string} userName - User's name for personalization
 */
export const sendOtpEmail = async (to, otp, userName = 'User') => {
  const mailOptions = {
    from: `"AssetFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'AssetFlow – Password Reset OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #10b981; color: white; font-weight: bold; font-size: 18px; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; margin-bottom: 12px;">AF</div>
          <h2 style="color: #1e293b; margin: 0;">Password Reset Request</h2>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Hi <strong>${userName}</strong>,<br/><br/>
          We received a request to reset your AssetFlow account password. Use the OTP below to proceed:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #1e293b; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px;">
            ${otp}
          </div>
        </div>
        <p style="color: #64748b; font-size: 13px; text-align: center;">
          This code expires in <strong>10 minutes</strong>.<br/>
          If you didn't request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          AssetFlow Enterprise Asset Management
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
