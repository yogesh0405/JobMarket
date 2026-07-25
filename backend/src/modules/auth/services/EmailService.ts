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

  /**
   * Send a professional transactional email to the employer about a new job application
   */
  static async sendJobApplicationEmail(
    employerEmail: string,
    employerName: string,
    jobTitle: string,
    jobCompany: string,
    candidateName: string,
    candidateEmail: string,
    candidatePhone: string,
    candidateTrade: string,
    candidateLocation: string,
    resumeUrl: string | null
  ): Promise<boolean> {
    const url = 'https://api.brevo.com/v3/smtp/email';
    const currentYear = new Date().getFullYear();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Job Application - CSN-JobMarket</title>
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
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">New Job Application Received!</p>
                    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                      Hello <strong>${employerName}</strong>,
                      <br/><br/>
                      A candidate has just applied for your job posting: <strong style="color:#2563eb;">${jobTitle}</strong> at <strong>${jobCompany}</strong>.
                    </p>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
                    </table>

                    <!-- Candidate Profile Section -->
                    <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">Applicant Profile Details</p>

                    <table width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                      <tr>
                        <td width="35%" style="font-size:14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Full Name:</td>
                        <td width="65%" style="font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;"><strong>${candidateName}</strong></td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Email Address:</td>
                        <td style="font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;"><a href="mailto:${candidateEmail}" style="color:#2563eb;text-decoration:none;">${candidateEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Phone Number:</td>
                        <td style="font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;"><a href="tel:${candidatePhone}" style="color:#0f172a;text-decoration:none;">${candidatePhone}</a></td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">ITI Specialization:</td>
                        <td style="font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${candidateTrade || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#64748b;font-weight:600;">Location:</td>
                        <td style="font-size:14px;color:#0f172a;">${candidateLocation || 'N/A'}</td>
                      </tr>
                    </table>

                    ${resumeUrl ? `
                    <!-- Resume CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;text-align:center;">
                      <tr>
                        <td align="center">
                          <a href="${resumeUrl}" target="_blank" style="background-color:#2563eb;color:#ffffff;display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;box-shadow:0 4px 12px rgba(37,99,235,0.2);">
                            📄 &nbsp;View Candidate Resume / Portfolio
                          </a>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <!-- CTA to Admin / Dashboard -->
                    <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.6;text-align:center;">
                      Log into your dashboard to review this candidate and schedule interviews.
                    </p>

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
          email: employerEmail,
          name: employerName
        }
      ],
      subject: `New Application: ${candidateName} applied for ${jobTitle}`,
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

      logger.info(`Job application email dispatched to ${employerEmail} via Brevo`);
      return true;
    } catch (error) {
      logger.error('Failed to send job application email', error);
      return false;
    }
  }

  /**
   * Send a professional transactional email to the candidate when an interview is scheduled
   */
  static async sendInterviewScheduledEmail(
    workerEmail: string,
    workerName: string,
    jobTitle: string,
    companyName: string,
    interviewDate: string,
    interviewTime: string,
    venueAddress: string,
    mapsLink?: string
  ): Promise<boolean> {
    const url = 'https://api.brevo.com/v3/smtp/email';
    const currentYear = new Date().getFullYear();

    const mapsHtml = mapsLink
      ? `<p style="margin:16px 0 0;font-size:15px;color:#64748b;">
          <a href="${mapsLink}" target="_blank" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View Location on Google Maps</a>
         </p>`
      : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Interview Scheduled - CSN-JobMarket</title>
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
                  <td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);height:6px;"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 48px 32px;">

                    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">Interview Scheduled</p>
                    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                      Hi <strong style="color:#0f172a;">${workerName}</strong>, your application for the <strong style="color:#1e3a8a;">${jobTitle}</strong> position at <strong style="color:#0f172a;">${companyName}</strong> has been shortlisted, and the employer has scheduled an interview with you.
                    </p>

                    <!-- Details Table -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #e2e8f0;">
                      <tr>
                        <td style="padding-bottom:12px;font-size:14px;color:#64748b;width:120px;font-weight:600;">Date:</td>
                        <td style="padding-bottom:12px;font-size:14px;color:#0f172a;font-weight:700;">${interviewDate}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:12px;font-size:14px;color:#64748b;width:120px;font-weight:600;">Time:</td>
                        <td style="padding-bottom:12px;font-size:14px;color:#0f172a;font-weight:700;">${interviewTime}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#64748b;width:120px;font-weight:600;vertical-align:top;">Venue / Address:</td>
                        <td style="font-size:14px;color:#0f172a;line-height:1.5;">
                          ${venueAddress.replace(/\n/g, '<br />')}
                          ${mapsHtml}
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
                      Please make sure to arrive on time. If you have any questions or need to reschedule, please contact the recruiter directly.
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
      to: [{ email: workerEmail, name: workerName }],
      subject: `Interview Scheduled for ${jobTitle} at ${companyName}`,
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
        logger.error(`Brevo Email API Error (Interview): ${JSON.stringify(errorData)}`);
        return false;
      }

      logger.info(`Interview scheduled email dispatched to ${workerEmail} via Brevo`);
      return true;
    } catch (error) {
      logger.error('Failed to send interview scheduled email', error);
      return false;
    }
  }

  /**
   * Send a custom email from the employer to the candidate
   */
  static async sendCustomEmployerEmail(
    workerEmail: string,
    workerName: string,
    subject: string,
    message: string,
    companyName: string
  ): Promise<boolean> {
    const url = 'https://api.brevo.com/v3/smtp/email';
    const currentYear = new Date().getFullYear();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Message from Recruiter - CSN-JobMarket</title>
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
                  <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);height:6px;"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 48px 32px;">

                    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">Message from Recruiter</p>
                    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                      Hi <strong style="color:#0f172a;">${workerName}</strong>, the recruiter from <strong style="color:#1e3a8a;">${companyName}</strong> has sent you a message regarding your application:
                    </p>

                    <!-- Message Box -->
                    <div style="background-color:#f8fafc;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #e2e8f0;font-size:15px;color:#0f172a;line-height:1.6;white-space:pre-wrap;">${message}</div>

                    <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
                      You can reply directly to the recruiter or reach out via their contact details.
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
        name: companyName,
        email: 'yogeshdand04@gmail.com'
      },
      replyTo: {
        name: companyName,
        email: 'yogeshdand04@gmail.com'
      },
      to: [{ email: workerEmail, name: workerName }],
      subject: subject || `Message from ${companyName} regarding your application`,
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
        logger.error(`Brevo Email API Error (Custom): ${JSON.stringify(errorData)}`);
        return false;
      }

      logger.info(`Custom employer email dispatched to ${workerEmail} via Brevo`);
      return true;
    } catch (error) {
      logger.error('Failed to send custom employer email', error);
      return false;
    }
  }

  static async sendSupportTicketNotification(
    toEmail: string,
    toName: string,
    ticketNumber: string,
    subject: string,
    status: string,
    type: 'created' | 'reply' | 'status_changed' | 'resolved' | 'closed',
    summary?: string
  ): Promise<boolean> {
    const url = 'https://api.brevo.com/v3/smtp/email';
    const currentYear = new Date().getFullYear();
    const supportLink = `http://localhost:5174/#/contact`;

    let title = '';
    let intro = '';
    let details = '';

    if (type === 'created') {
      title = 'Support Ticket Created';
      intro = `Your support ticket has been successfully created. We will get back to you within 24 hours.`;
      details = `<strong>Ticket Number:</strong> ${ticketNumber}<br/><strong>Subject:</strong> ${subject}<br/><strong>Expected Response Time:</strong> Within 24 Hours`;
    } else if (type === 'reply') {
      title = 'New Support Reply';
      intro = `There is a new reply on your support ticket.`;
      details = `<strong>Ticket Number:</strong> ${ticketNumber}<br/><strong>Latest Message:</strong> ${summary || ''}`;
    } else if (type === 'status_changed') {
      title = 'Ticket Status Updated';
      intro = `Your support ticket status has been updated.`;
      details = `<strong>Ticket Number:</strong> ${ticketNumber}<br/><strong>New Status:</strong> ${status}`;
    } else if (type === 'resolved') {
      title = 'Support Ticket Resolved';
      intro = `Your support ticket has been marked as resolved.`;
      details = `<strong>Ticket Number:</strong> ${ticketNumber}<br/><strong>Resolution Summary:</strong> ${summary || ''}`;
    } else if (type === 'closed') {
      title = 'Support Ticket Closed';
      intro = `Your support ticket has been closed.`;
      details = `<strong>Ticket Number:</strong> ${ticketNumber}`;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} - JobMarket Support</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="background-color:#1e3a8a;border-radius:12px;padding:10px 20px;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px;">CSN-JobMarket Support</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;padding:32px;">
              <h2 style="color:#1e3a8a;margin-top:0;">${title}</h2>
              <p style="color:#334155;font-size:16px;line-height:1.5;">Dear ${toName},</p>
              <p style="color:#334155;font-size:16px;line-height:1.5;">${intro}</p>
              <div style="background-color:#f8fafc;border-left:4px solid #3b82f6;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;color:#1e293b;font-size:14px;line-height:1.6;">
                ${details}
              </div>
              <p style="text-align:center;margin:30px 0;">
                <a href="${supportLink}" style="background-color:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;box-shadow:0 4px 6px rgba(37,99,235,0.2);">View Support Ticket</a>
              </p>
              <p style="color:#64748b;font-size:12px;text-align:center;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:20px;">
                © ${currentYear} CSN-JobMarket. All rights reserved.<br/>
                If you did not submit this request, please contact our support team immediately.
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
        name: 'JobMarket Support',
        email: 'yogeshdand04@gmail.com'
      },
      replyTo: {
        name: 'JobMarket Support',
        email: 'yogeshdand04@gmail.com'
      },
      to: [{ email: toEmail, name: toName }],
      subject: `[${ticketNumber}] ${title}: ${subject}`,
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
        logger.error(`Brevo Email API Error (Support): ${JSON.stringify(errorData)}`);
        return false;
      }

      logger.info(`Support email notification sent to ${toEmail} for ticket ${ticketNumber}`);
      return true;
    } catch (error) {
      logger.error('Failed to send support ticket email', error);
      return false;
    }
  }
}
