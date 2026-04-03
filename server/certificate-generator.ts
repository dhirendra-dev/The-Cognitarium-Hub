import { PDFDocument, PDFPage, rgb, degrees } from "pdf-lib";
import { storagePut } from "./storage";

export interface CertificateData {
  userName: string;
  certificateType: string;
  title: string;
  description: string;
  contributionMetric: string;
  issuedDate: Date;
  verificationCode: string;
  logoUrl?: string;
}

/**
 * Generate a beautiful, professional PDF certificate
 * Includes custom branding, watermark, and professional design
 */
export async function generateCertificate(data: CertificateData): Promise<{
  pdfBytes: Uint8Array;
  fileName: string;
}> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1200, 900]); // Landscape orientation
  const { width, height } = page.getSize();

  // Define colors - Professional gradient theme
  const primaryColor = rgb(0.1, 0.3, 0.6); // Deep blue
  const accentColor = rgb(0.9, 0.7, 0.2); // Gold
  const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
  const lightColor = rgb(0.95, 0.95, 0.95); // Light gray

  // Embed fonts
  const boldFont = await pdfDoc.embedFont("Helvetica-Bold");
  const regularFont = await pdfDoc.embedFont("Helvetica");

  // Draw decorative border
  drawBorder(page, width, height, primaryColor, accentColor);

  // Draw watermark (subtle background)
  drawWatermark(page, width, height, regularFont);

  // Draw header section with gradient effect
  page.drawRectangle({
    x: 0,
    y: height - 150,
    width: width,
    height: 150,
    color: primaryColor,
  });

  // Add decorative gold line
  page.drawRectangle({
    x: 0,
    y: height - 160,
    width: width,
    height: 10,
    color: accentColor,
  });

  // Draw certificate title
  page.drawText("CERTIFICATE OF ACHIEVEMENT", {
    x: 50,
    y: height - 90,
    size: 48,
    font: boldFont,
    color: rgb(1, 1, 1), // White
    maxWidth: width - 100,
  });

  // Draw subtitle
  page.drawText("Community Contribution Recognition", {
    x: 50,
    y: height - 130,
    size: 16,
    font: regularFont,
    color: accentColor,
  });

  // Main content area
  const contentStartY = height - 250;

  // "This is to certify that" text
  page.drawText("This is to certify that", {
    x: 100,
    y: contentStartY,
    size: 18,
    font: regularFont,
    color: textColor,
  });

  // Student name in large, decorative font
  const nameWidth = boldFont.widthOfTextAtSize(data.userName, 44);
  page.drawText(data.userName, {
    x: (width - nameWidth) / 2,
    y: contentStartY - 80,
    size: 44,
    font: boldFont,
    color: primaryColor,
    maxWidth: width - 200,
  });

  // Decorative line under name
  page.drawRectangle({
    x: (width - 400) / 2,
    y: contentStartY - 100,
    width: 400,
    height: 2,
    color: accentColor,
  });

  // Certificate details
  const detailsY = contentStartY - 180;

  page.drawText("has been recognized as a", {
    x: 100,
    y: detailsY,
    size: 16,
    font: regularFont,
    color: textColor,
  });

  // Certificate type/title
  const titleWidth = boldFont.widthOfTextAtSize(data.title, 24);
  page.drawText(data.title, {
    x: (width - titleWidth) / 2,
    y: detailsY - 40,
    size: 24,
    font: boldFont,
    color: accentColor,
    maxWidth: width - 200,
  });

  // Description
  const descriptionY = detailsY - 100;
  page.drawText("For their outstanding contribution to the community:", {
    x: 100,
    y: descriptionY,
    size: 14,
    font: regularFont,
    color: textColor,
  });

  // Contribution metric in a highlighted box
  page.drawRectangle({
    x: 100,
    y: descriptionY - 60,
    width: width - 200,
    height: 50,
    color: lightColor,
    borderColor: accentColor,
    borderWidth: 2,
  });

  page.drawText(data.contributionMetric, {
    x: 120,
    y: descriptionY - 35,
    size: 14,
    font: boldFont,
    color: primaryColor,
    maxWidth: width - 240,
  });

  // Footer section
  const footerY = 150;

  // Issued date and verification code
  page.drawText(`Issued on: ${formatDate(data.issuedDate)}`, {
    x: 100,
    y: footerY,
    size: 12,
    font: regularFont,
    color: textColor,
  });

  page.drawText(`Verification Code: ${data.verificationCode}`, {
    x: 100,
    y: footerY - 30,
    size: 12,
    font: regularFont,
    color: textColor,
  });

  // Signature lines
  const signatureY = footerY - 100;
  const signatureLineWidth = 150;
  const signatureLineY = signatureY - 50;

  // Director signature
  page.drawRectangle({
    x: 100,
    y: signatureLineY,
    width: signatureLineWidth,
    height: 1,
    color: textColor,
  });

  page.drawText("Director", {
    x: 100,
    y: signatureLineY - 20,
    size: 12,
    font: regularFont,
    color: textColor,
  });

  page.drawText("Board Exam Preparation", {
    x: 100,
    y: signatureLineY - 40,
    size: 10,
    font: regularFont,
    color: textColor,
  });

  // Seal/Badge placeholder
  page.drawRectangle({
    x: width - 250,
    y: signatureY - 80,
    width: 150,
    height: 150,
    color: lightColor,
    borderColor: accentColor,
    borderWidth: 3,
  });

  page.drawText("OFFICIAL", {
    x: width - 250,
    y: signatureY - 20,
    size: 16,
    font: boldFont,
    color: accentColor,
    maxWidth: 150,
  });

  page.drawText("SEAL", {
    x: width - 250,
    y: signatureY - 50,
    size: 16,
    font: boldFont,
    color: accentColor,
    maxWidth: 150,
  });

  // Save PDF to bytes
  const pdfBytes = await pdfDoc.save();
  const fileName = `certificate-${data.verificationCode}.pdf`;

  return { pdfBytes: new Uint8Array(pdfBytes), fileName };
}

/**
 * Draw a decorative border around the certificate
 */
function drawBorder(
  page: PDFPage,
  width: number,
  height: number,
  primaryColor: any,
  accentColor: any
) {
  const borderMargin = 20;
  const borderWidth = 3;

  // Outer border
  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: width - 2 * borderMargin,
    height: height - 2 * borderMargin,
    color: undefined,
    borderColor: primaryColor,
    borderWidth: borderWidth,
  });

  // Inner decorative border
  const innerMargin = 35;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: width - 2 * innerMargin,
    height: height - 2 * innerMargin,
    color: undefined,
    borderColor: accentColor,
    borderWidth: 1,
  });

  // Corner decorations
  const cornerSize = 30;
  const corners = [
    { x: borderMargin, y: height - borderMargin - cornerSize }, // top-left
    { x: width - borderMargin - cornerSize, y: height - borderMargin - cornerSize }, // top-right
    { x: borderMargin, y: borderMargin }, // bottom-left
    { x: width - borderMargin - cornerSize, y: borderMargin }, // bottom-right
  ];

  corners.forEach((corner) => {
    page.drawRectangle({
      x: corner.x,
      y: corner.y,
      width: cornerSize,
      height: cornerSize,
      color: undefined,
      borderColor: accentColor,
      borderWidth: 2,
    });
  });
}

/**
 * Draw a subtle watermark in the background
 */
function drawWatermark(page: PDFPage, width: number, height: number, font: any) {
  page.drawText("Board Exam Preparation", {
    x: width / 2 - 200,
    y: height / 2 - 30,
    size: 60,
    font: font,
    color: rgb(0.9, 0.9, 0.9), // Very light gray
    opacity: 0.08,
    rotate: degrees(45),
  });
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Upload certificate to S3 and return URL and key
 */
export async function uploadCertificateToS3(
  pdfBytes: Uint8Array,
  fileName: string,
  userId: number
): Promise<{ url: string; key: string }> {
  const fileKey = `certificates/${userId}/${fileName}`;
  const result = await storagePut(fileKey, pdfBytes, "application/pdf");
  return { url: result.url, key: result.key };
}
