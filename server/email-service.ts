import nodemailer from "nodemailer";

// Configure your email service here
// For development, you can use a service like Mailtrap or Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendCredentialsEmail(
  email: string,
  name: string,
  password: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e3a8a;">Welcome to The Cognitarium Hub! 🎓</h2>
            
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Your account has been successfully created! You can now access all the study materials, practice tests, and learning tools.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e3a8a;">Your Login Credentials</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
            </div>
            
            <p style="background-color: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>⚠️ Important:</strong> We recommend changing your password after your first login for security.
            </p>
            
            <div style="margin: 30px 0;">
              <a href="${process.env.VITE_FRONTEND_URL || "https://hslcprep-fefyutzm.manus.space"}/login" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Login Now
              </a>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Happy studying! 📚</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              © 2026 The Cognitarium Hub. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Welcome to The Cognitarium Hub - Your Account is Ready!",
      html: htmlContent,
      text: `Welcome to The Cognitarium Hub!\n\nYour account has been created.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease login at: ${process.env.VITE_FRONTEND_URL || "https://hslcprep-fefyutzm.manus.space"}/login`,
    });

    console.log(`[Email] Credentials sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send credentials to ${email}:`, error);
    return false;
  }
}

export async function sendAdminNotificationEmail(
  name: string,
  email: string,
  phone: string | null
): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cognitariumhub.com";
    
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e3a8a;">New Account Created 👤</h2>
            
            <p>A new user has successfully created an account and is now active on the platform.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e3a8a;">User Details</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
              <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>This is an automated notification from The Cognitarium Hub.</p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject: `New Account Created - ${name}`,
      html: htmlContent,
      text: `New user account created:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}`,
    });

    console.log(`[Email] Admin notification sent for user ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send admin notification:`, error);
    return false;
  }
}
