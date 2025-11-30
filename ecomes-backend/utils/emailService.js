const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello ${username},</p>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

const sendPasswordResetOTPEmail = async (email, otp, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>Hello ${username},</p>
        <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this reset, please ignore this email and contact support.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Security ID: ${Date.now()}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending password reset OTP:", error);
    return false;
  }
};

const sendEmailChangeOTPEmail = async (email, otp, username, newEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Change Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Change Verification</h2>
        <p>Hello ${username},</p>
        <p>You requested to change your email address to: <strong>${newEmail}</strong></p>
        <p>Use the OTP below to verify this change:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this change, please contact support immediately.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Security notification: This will change your account's primary email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email change OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email change OTP:", error);
    return false;
  }
};

const sendNewEmailConfirmationOTP = async (email, otp, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirm Your New Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Email Confirmation</h2>
        <p>Hello ${username},</p>
        <p>Welcome! You're almost done changing your email address.</p>
        <p>Use the OTP below to confirm this email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this change, please contact support immediately.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This email address will become your new login email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ New email confirmation OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending new email confirmation OTP:", error);
    return false;
  }
};

// Keep the existing notification email function
const sendEmailChangeNotificationEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Address Changed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Address Updated</h2>
        <p>Hello ${username},</p>
        <p>This is to notify you that your email address has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #666;">
            <strong>Security Note:</strong> All active sessions have been terminated for security.
          </p>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated security notification.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email change notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email change notification:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendEmailChangeOTPEmail,
  sendNewEmailConfirmationOTP,
  sendEmailChangeNotificationEmail,
};
