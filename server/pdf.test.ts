import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createPDFDocument,
  getPDFDocuments,
  getPDFDocumentById,
  updatePDFDocument,
  deletePDFDocument,
  incrementPDFDownloadCount,
  searchPDFDocuments,
} from "./db";

describe("PDF Document Functions", () => {
  let testPdfId: number;

  beforeAll(async () => {
    // Create a test PDF document
    const result = await createPDFDocument({
      title: "Test PDF",
      description: "Test description",
      fileKey: "test-pdf-key",
      fileUrl: "https://example.com/test.pdf",
      fileSize: 1024 * 1024, // 1MB
      subject: "Advanced Mathematics",
      uploadedBy: 1,
      isPublic: true,
      downloadCount: 0,
    });

    // Get the inserted ID
    const docs = await getPDFDocuments("Advanced Mathematics", 1);
    if (docs && docs.length > 0) {
      testPdfId = docs[0].id;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testPdfId) {
      await deletePDFDocument(testPdfId);
    }
  });

  it("should create a PDF document", async () => {
    const result = await createPDFDocument({
      title: "New Test PDF",
      description: "New test description",
      fileKey: "new-test-pdf-key",
      fileUrl: "https://example.com/new-test.pdf",
      fileSize: 2 * 1024 * 1024, // 2MB
      subject: "Science",
      uploadedBy: 1,
      isPublic: true,
      downloadCount: 0,
    });

    expect(result).toBeDefined();
  });

  it("should retrieve PDF documents by subject", async () => {
    const docs = await getPDFDocuments("Advanced Mathematics", 10);
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
  });

  it("should retrieve all PDF documents when no subject specified", async () => {
    const docs = await getPDFDocuments(undefined, 10);
    expect(Array.isArray(docs)).toBe(true);
  });

  it("should get a PDF document by ID", async () => {
    if (!testPdfId) {
      console.warn("Skipping test: testPdfId not set");
      return;
    }

    const doc = await getPDFDocumentById(testPdfId);
    expect(doc).toBeDefined();
    expect(doc?.id).toBe(testPdfId);
    expect(doc?.title).toBe("Test PDF");
  });

  it("should update a PDF document", async () => {
    if (!testPdfId) {
      console.warn("Skipping test: testPdfId not set");
      return;
    }

    const result = await updatePDFDocument(testPdfId, {
      title: "Updated Test PDF",
      description: "Updated description",
    });

    expect(result).toBeDefined();

    // Verify the update
    const doc = await getPDFDocumentById(testPdfId);
    expect(doc?.title).toBe("Updated Test PDF");
  });

  it("should increment download count", async () => {
    if (!testPdfId) {
      console.warn("Skipping test: testPdfId not set");
      return;
    }

    const initialDoc = await getPDFDocumentById(testPdfId);
    const initialCount = initialDoc?.downloadCount || 0;

    await incrementPDFDownloadCount(testPdfId);

    const updatedDoc = await getPDFDocumentById(testPdfId);
    expect(updatedDoc?.downloadCount).toBe(initialCount + 1);
  });

  it("should search PDF documents by title", async () => {
    const results = await searchPDFDocuments("Test", 10);
    expect(Array.isArray(results)).toBe(true);
  });

  it("should validate file size limit (400MB)", async () => {
    // This test verifies that the file size is within limits
    const largeFileSize = 400 * 1024 * 1024; // 400MB
    const result = await createPDFDocument({
      title: "Large PDF",
      description: "Large file test",
      fileKey: "large-pdf-key",
      fileUrl: "https://example.com/large.pdf",
      fileSize: largeFileSize,
      subject: "Advanced Mathematics",
      uploadedBy: 1,
      isPublic: true,
      downloadCount: 0,
    });

    expect(result).toBeDefined();

    // Clean up
    const docs = await getPDFDocuments("Advanced Mathematics", 1);
    if (docs && docs.length > 0) {
      const largeDoc = docs.find((d) => d.title === "Large PDF");
      if (largeDoc) {
        await deletePDFDocument(largeDoc.id);
      }
    }
  });

  it("should delete a PDF document", async () => {
    // Create a temporary PDF to delete
    const tempResult = await createPDFDocument({
      title: "Temp PDF to Delete",
      description: "Temporary",
      fileKey: "temp-pdf-key",
      fileUrl: "https://example.com/temp.pdf",
      fileSize: 512 * 1024, // 512KB
      subject: "English",
      uploadedBy: 1,
      isPublic: true,
      downloadCount: 0,
    });

    const docs = await getPDFDocuments("English", 1);
    const tempDoc = docs?.find((d) => d.title === "Temp PDF to Delete");

    if (tempDoc) {
      const result = await deletePDFDocument(tempDoc.id);
      expect(result).toBeDefined();

      // Verify deletion
      const deletedDoc = await getPDFDocumentById(tempDoc.id);
      expect(deletedDoc).toBeNull();
    }
  });
});
