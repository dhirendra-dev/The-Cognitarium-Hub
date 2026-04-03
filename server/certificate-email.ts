import { notifyOwner } from "./_core/notification";

interface CertificateEmailData {
  studentName: string;
  studentEmail: string;
  certificateType: string;
  certificateTitle: string;
  certificateUrl: string;
  verificationCode: string;
  contributionMetric: string;
}

/**
 * Send certificate earned notification to student
 */
export async function sendCertificateEarnedEmail(data: CertificateEmailData): Promise<boolean> {
  try {
    // Notify the platform owner about the certificate
    const notificationSuccess = await notifyOwner({
      title: `🎓 New Certificate Earned: ${data.certificateType}`,
      content: `${data.studentName} (${data.studentEmail}) has earned the "${data.certificateTitle}" certificate!\n\nMetric: ${data.contributionMetric}\nVerification Code: ${data.verificationCode}`,
    });

    return notificationSuccess;
  } catch (error) {
    console.error("Failed to send certificate notification:", error);
    return false;
  }
}

/**
 * Generate certificate email HTML
 */
export function generateCertificateEmailHTML(data: CertificateEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 28px;
          }
          .emoji {
            font-size: 40px;
            margin-bottom: 10px;
          }
          .content {
            margin: 20px 0;
          }
          .content p {
            margin: 15px 0;
            font-size: 16px;
          }
          .certificate-info {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .certificate-info h3 {
            color: #3b82f6;
            margin-top: 0;
          }
          .metric {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #f59e0b;
          }
          .download-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .download-button:hover {
            background-color: #2563eb;
          }
          .verification {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
          .badge {
            display: inline-block;
            background-color: #dbeafe;
            color: #1e40af;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎓</div>
            <h1>Congratulations!</h1>
            <p>You've Earned a Certificate</p>
          </div>

          <div class="content">
            <p>Hi <strong>${data.studentName}</strong>,</p>
            
            <p>We're thrilled to announce that you've earned a new certificate for your outstanding contributions to our learning community!</p>

            <div class="certificate-info">
              <h3>Certificate Details</h3>
              <p><strong>Certificate Type:</strong> ${data.certificateTitle}</p>
              <p><strong>Category:</strong> <span class="badge">${data.certificateType}</span></p>
            </div>

            <div class="metric">
              <strong>Your Achievement:</strong><br>
              ${data.contributionMetric}
            </div>

            <p>This certificate recognizes your dedication and valuable contributions to our community. It's a testament to your commitment to learning and helping others grow.</p>

            <div style="text-align: center;">
              <a href="${data.certificateUrl}" class="download-button">📥 Download Your Certificate</a>
            </div>

            <p>You can download your certificate anytime using the link above. Share it on your social media profiles to showcase your achievement!</p>

            <div class="verification">
              <strong>Verification Code:</strong><br>
              ${data.verificationCode}
            </div>

            <p>Keep up the excellent work! Continue contributing to the community and earning more certificates.</p>
          </div>

          <div class="footer">
            <p>Board Exam Preparation Hub</p>
            <p>Empowering students through community learning</p>
            <p style="margin-top: 15px; color: #9ca3af;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate plain text certificate email
 */
export function generateCertificateEmailText(data: CertificateEmailData): string {
  return `
Congratulations, ${data.studentName}!

You've earned a new certificate for your outstanding contributions to our learning community!

CERTIFICATE DETAILS:
- Certificate Type: ${data.certificateTitle}
- Category: ${data.certificateType}
- Your Achievement: ${data.contributionMetric}

Download your certificate here: ${data.certificateUrl}

Verification Code: ${data.verificationCode}

This certificate recognizes your dedication and valuable contributions to our community. Share it on your social media profiles to showcase your achievement!

Keep up the excellent work and continue earning more certificates!

---
Board Exam Preparation Hub
Empowering students through community learning
  `;
}
