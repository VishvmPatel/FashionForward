const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Check if email credentials are configured
    const hasEmailConfig = process.env.SMTP_USER && 
                          process.env.SMTP_PASS && 
                          process.env.SMTP_USER !== 'your-email@gmail.com' &&
                          process.env.SMTP_PASS !== 'your-app-password';

    // Debug logging to help troubleshoot
    console.log('📧 Email service configuration check:');
    console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'not set (will use default: smtp.gmail.com)');
    console.log('   SMTP_PORT:', process.env.SMTP_PORT || 'not set (will use default: 587)');
    console.log('   SMTP_USER:', process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'not set');
    console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '***set***' : 'not set');
    console.log('   Has valid config:', hasEmailConfig);

    if (hasEmailConfig) {
      // Check if using SendGrid (different configuration)
      const isSendGrid = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('sendgrid');
      
      if (isSendGrid) {
        // SendGrid configuration
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SMTP_PASS // SendGrid API key
          }
        });
        console.log('📧 Using SendGrid email service');
      } else {
        // Gmail or other SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          // Additional options for better reliability
          connectionTimeout: 15000, // 15 seconds
          greetingTimeout: 15000,
          socketTimeout: 15000,
          // Disable verification on startup - verify on first send instead
          pool: false,
          maxConnections: 1,
          maxMessages: 3
        });
        console.log('📧 Using SMTP email service (Gmail or other)');
      }

      console.log('✅ Email service configured');
      console.log('💡 Note: Connection will be verified on first email send attempt');
      // Don't verify on startup - verify on first actual email send
      // This avoids timeout issues with cloud providers
    } else {
      // Email not configured - use fallback mode
      this.transporter = null;
      console.log('📧 Email service not configured - using fallback mode (console logging)');
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('💡 Missing: SMTP_USER and/or SMTP_PASS environment variables');
      } else if (process.env.SMTP_USER === 'your-email@gmail.com' || process.env.SMTP_PASS === 'your-app-password') {
        console.log('💡 Warning: Using placeholder values. Please replace with actual credentials.');
      }
    }
  }

  async verifyConnection() {
    if (!this.transporter) return;
    
    try {
      // Try to verify connection with a longer timeout
      await Promise.race([
        this.transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
        )
      ]);
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection verification failed:', error.message);
      console.log('⚠️  This might be due to:');
      console.log('   1. Gmail blocking SMTP from cloud providers');
      console.log('   2. Incorrect app password');
      console.log('   3. Network restrictions');
      console.log('📧 Email service will still attempt to send emails, but verification failed');
      console.log('💡 Emails will be sent when needed - check logs for success/failure');
    }
  }

  async sendPasswordResetOTP(userEmail, otp, userName = 'User') {
    const mailOptions = {
      from: {
        name: 'Fashion Forward',
        address: process.env.SMTP_USER || 'noreply@fashionforward.com'
      },
      to: userEmail,
      subject: 'Your Password Reset OTP - Fashion Forward',
      html: this.generatePasswordResetOTPHTML(userName, otp),
      text: this.generatePasswordResetOTPText(userName, otp)
    };

    // If email service not configured, use fallback
    if (!this.transporter) {
      console.log('🔢 Password Reset OTP (Fallback Mode):', otp);
      return { 
        success: false, 
        error: 'Email service not configured',
        fallbackOTP: otp 
      };
    }

    try {
      // Try to send email with timeout
      const result = await Promise.race([
        this.transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout after 15 seconds')), 15000)
        )
      ]);
      console.log('✅ Password reset OTP sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset OTP:', error.message);
      console.error('   Error details:', error.code || 'Unknown error code');
      
      // Fallback: Log the OTP to console
      console.log('🔢 Password Reset OTP (Fallback - check logs):', otp);
      console.log('   Email:', userEmail);
      
      return { 
        success: false, 
        error: error.message,
        fallbackOTP: otp 
      };
    }
  }

  generatePasswordResetHTML(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Fashion Forward</div>
            <h1 class="title">Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>We received a request to reset your password for your Fashion Forward account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" target="_self">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px; font-family: monospace;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>You can only use this link once</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from Fashion Forward. If you have any questions, please contact our support team.</p>
            <p>© 2024 Fashion Forward. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetOTPHTML(userName, otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Password Reset OTP</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .otp-box {
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Fashion Forward</div>
            <h1 class="title">Your Password Reset OTP</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>We received a request to reset your password for your Fashion Forward account. Use the OTP below to verify your identity:</p>
            
            <div class="otp-box">
              ${otp}
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This OTP will expire in 5 minutes</li>
                <li>You can only use this OTP once</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this OTP with anyone</li>
              </ul>
            </div>
            
            <p>Enter this OTP on the password reset page to continue with resetting your password.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from Fashion Forward. If you have any questions, please contact our support team.</p>
            <p>© 2024 Fashion Forward. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetOTPText(userName, otp) {
    return `
      Your Password Reset OTP - Fashion Forward
      
      Hi ${userName},
      
      We received a request to reset your password for your Fashion Forward account. Use the OTP below to verify your identity:
      
      OTP: ${otp}
      
      Important:
      - This OTP will expire in 5 minutes
      - You can only use this OTP once
      - If you didn't request this, please ignore this email
      - Never share this OTP with anyone
      
      Enter this OTP on the password reset page to continue with resetting your password.
      
      This email was sent from Fashion Forward. If you have any questions, please contact our support team.
      
      © 2024 Fashion Forward. All rights reserved.
    `;
  }

  async sendWelcomeEmail(userEmail, userName) {
    const mailOptions = {
      from: {
        name: 'Fashion Forward',
        address: process.env.SMTP_USER || 'noreply@fashionforward.com'
      },
      to: userEmail,
      subject: 'Welcome to Fashion Forward!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8b5cf6;">Welcome to Fashion Forward!</h1>
          <p>Hi ${userName},</p>
          <p>Thank you for joining Fashion Forward! We're excited to have you as part of our community.</p>
          <p>Start exploring our latest collection and discover amazing fashion pieces just for you.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Start Shopping
            </a>
          </div>
        </div>
      `
    };

    // If email service not configured, skip sending
    if (!this.transporter) {
      console.log('📧 Welcome email skipped (email service not configured)');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();