import { describe, it, expect } from "vitest";
import {
  createContactSubmission,
  getAllContactSubmissions,
  getPendingContactSubmissions,
  updateContactSubmissionStatus,
  getContactSubmissionById,
} from "./db";

describe("Contact Submissions", () => {
  it("should create a contact submission", async () => {
    const result = await createContactSubmission({
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210",
      status: "pending",
    });

    expect(result).toBeDefined();
  });

  it("should get all contact submissions", async () => {
    // Create a test submission
    await createContactSubmission({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 9876543211",
      status: "pending",
    });

    const submissions = await getAllContactSubmissions();
    expect(Array.isArray(submissions)).toBe(true);
    expect(submissions.length).toBeGreaterThan(0);
  });

  it("should get pending contact submissions", async () => {
    // Create a pending submission
    await createContactSubmission({
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+91 9876543212",
      status: "pending",
    });

    const pending = await getPendingContactSubmissions();
    expect(Array.isArray(pending)).toBe(true);
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every((s) => s.status === "pending")).toBe(true);
  });

  it("should update contact submission status", async () => {
    // Create a submission
    const result = await createContactSubmission({
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "+91 9876543213",
      status: "pending",
    });

    // Get the ID from the result
    const submissions = await getAllContactSubmissions();
    const submission = submissions.find((s) => s.name === "Alice Brown");

    if (submission) {
      // Update status
      await updateContactSubmissionStatus(
        submission.id,
        "processed",
        1,
        "Account created"
      );

      // Verify update
      const updated = await getContactSubmissionById(submission.id);
      expect(updated?.status).toBe("processed");
      expect(updated?.notes).toBe("Account created");
    }
  });

  it("should get contact submission by ID", async () => {
    // Create a submission
    await createContactSubmission({
      name: "Charlie Davis",
      email: "charlie@example.com",
      phone: "+91 9876543214",
      status: "pending",
    });

    // Get all and find our submission
    const submissions = await getAllContactSubmissions();
    const submission = submissions.find((s) => s.name === "Charlie Davis");

    if (submission) {
      // Get by ID
      const retrieved = await getContactSubmissionById(submission.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Charlie Davis");
      expect(retrieved?.email).toBe("charlie@example.com");
    }
  });
});
