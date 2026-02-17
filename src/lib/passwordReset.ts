import { sendEmail } from "../../lib/email";

// Email service configuration
const CLOUDFLARE_API_URL = process.env.CLOUDFLARE_API_URL;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@meamart.com";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendResetCodeEmail(
  email: string,
  displayName: string,
  code: string
): Promise<boolean> {
  try {
    const subject = "Password Reset Code";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
            .code { font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #667eea; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <p>You requested a password reset. Here is your verification code:</p>
              <div class="code">${code}</div>
              <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
              <p>Do not share this code with anyone.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Meamart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Code: ${code}
      
      This code will expire in 15 minutes. If you did not request this, please ignore this email.
      Do not share this code with anyone.
    `;

    // Use the sendEmail utility which will handle different providers
    return await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Failed to send reset code email:", error);
    return false;
  }
}

export async function sendPasswordResetConfirmationEmail(
  email: string,
  displayName: string
): Promise<boolean> {
  try {
    const subject = "Your Password Has Been Reset";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .success { color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hi ${displayName},</p>
              <p class="success">✓ Your password has been successfully reset.</p>
              <p>You can now log in to your account with your new password.</p>
              <p>If you did not perform this action, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Meamart. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Your password has been successfully reset.
      You can now log in to your account with your new password.
    `;

    return await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Failed to send password reset confirmation email:", error);
    return false;
  }
}
