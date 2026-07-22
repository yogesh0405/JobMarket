import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class EmailService {
  /**
   * Send a production-quality OTP email via Brevo Transactional API
   */
  static async sendOTP(toEmail: string, otpCode: string, toName: string = 'User'): Promise<boolean> {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const currentYear = new Date().getFullYear();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email - CSN-JobMarket</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1e3a8a;border-radius:12px;padding:10px 20px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px;">CSN-JobMarket</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

              <!-- Blue top bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);height:6px;"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 48px 32px;">

                    <!-- Greeting -->
                    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">Verify your email address</p>
                    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                      Hi <strong style="color:#0f172a;">${toName}</strong>, thank you for registering on <strong style="color:#2563eb;">CSN-JobMarket</strong> — India's trusted industrial job network for workers and factories.
                    </p>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
                    </table>

                    <!-- OTP instruction -->
                    <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">Your One-Time Verification Code</p>

                    <!-- OTP Box -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;display:block;text-align:center;">
                      <tr>
                        <td align="center" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #bfdbfe;border-radius:12px;padding:20px 48px;">
                          <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#1e3a8a;font-family:'Courier New',Courier,monospace;">${otpCode}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Validity notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background-color:#fefce8;border:1px solid #fde047;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0;font-size:13px;color:#713f12;">
                            ⏱ &nbsp;This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Security notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                            🔒 &nbsp;<strong>Security Notice:</strong> CSN-JobMarket will never ask for this code via phone or chat. If you did not create an account, please ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
                    </table>

                    <p style="margin:0;font-size:14px;color:#94a3b8;">
                      Need help? Contact us at <a href="mailto:support@csnjobmarket.com" style="color:#2563eb;text-decoration:none;">support@csnjobmarket.com</a>
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                &copy; ${currentYear} CSN-JobMarket. All rights reserved.
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const payload = {
      sender: {
        name: 'CSN-JobMarket',
        email: 'yogeshdand04@gmail.com'
      },
      to: [
        {
          email: toEmail,
          name: toName
        }
      ],
      subject: `${otpCode} is your CSN-JobMarket verification code`,
      htmlContent
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error(`Brevo Email API Error: ${JSON.stringify(errorData)}`);
        return false;
      }

      logger.info(`OTP Email dispatched to ${toEmail} via Brevo`);
      return true;
    } catch (error) {
      logger.error('Failed to send OTP email', error);
      return false;
    }
  }
}
