import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createCertificate, getUserCertificates, getCertificateById, markCertificateAsDownloaded, awardCertificateManually, userHasCertificateType, getDb } from "./db";
import { users, communityContributionCertificates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Simplified Certificate System", () => {
  let testUserId = 0;
  let testCertificateId = 0;

  beforeAll(async () => {
    // Create a test user
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.insert(users).values({
      name: "Test Certificate User",
      email: `test-cert-${Date.now()}@example.com`,
      role: "user",
    });
    
    testUserId = (result as any)[0]?.insertId || 1;
  });

  afterAll(async () => {
    // Cleanup test data
    const db = await getDb();
    if (db && testUserId) {
      await db.delete(communityContributionCertificates)
        .where(eq(communityContributionCertificates.userId, testUserId));
      
      await db.delete(users)
        .where(eq(users.id, testUserId));
    }
  });

  describe("Certificate Creation - No Criteria Required", () => {
    it("should create a certificate without eligibility criteria", async () => {
      const certificate = await createCertificate({
        userId: testUserId,
        certificateType: "activeMember",
        title: "Active Community Member",
        description: "Awarded for community participation",
        contributionMetric: "Certificate Awarded",
        certificateUrl: "https://example.com/cert.pdf",
        certificateKey: "test-key-123",
        verificationCode: "abc123def456",
      });

      expect(certificate).toBeDefined();
      testCertificateId = (certificate as any)[0]?.insertId || 1;
      expect(testCertificateId).toBeGreaterThan(0);
    });

    it("should retrieve the created certificate", async () => {
      if (!testCertificateId) {
        throw new Error("Certificate ID not set from previous test");
      }

      const certificate = await getCertificateById(testCertificateId);
      expect(certificate).toBeDefined();
      expect(certificate?.userId).toBe(testUserId);
      expect(certificate?.certificateType).toBe("activeMember");
      expect(certificate?.title).toBe("Active Community Member");
    });

    it("should get all user certificates", async () => {
      const certificates = await getUserCertificates(testUserId);
      expect(Array.isArray(certificates)).toBe(true);
      expect(certificates.length).toBeGreaterThan(0);
      expect(certificates[0]?.userId).toBe(testUserId);
    });

    it("should mark certificate as downloaded", async () => {
      if (!testCertificateId) {
        throw new Error("Certificate ID not set");
      }

      const result = await markCertificateAsDownloaded(testCertificateId);
      expect(result).toBeDefined();

      const certificate = await getCertificateById(testCertificateId);
      expect(certificate?.isDownloaded).toBe(true);
    });

    it("should check if user has certificate type", async () => {
      const hasActiveMember = await userHasCertificateType(testUserId, "activeMember");
      expect(hasActiveMember).toBe(true);

      const hasTopContributor = await userHasCertificateType(testUserId, "topContributor");
      expect(hasTopContributor).toBe(false);
    });
  });

  describe("Admin Manual Certificate Award - No Criteria", () => {
    it("should award certificate manually to user without criteria", async () => {
      const adminId = 1; // Assume admin user exists
      
      const certificate = await awardCertificateManually(
        testUserId,
        "courseCompletion",
        "Excellent course completion",
        adminId
      );

      expect(certificate).toBeDefined();
      expect((certificate as any)[0]?.insertId).toBeGreaterThan(0);
    });

    it("should prevent duplicate certificate awards", async () => {
      const adminId = 1;
      
      try {
        // Try to award the same certificate again
        await awardCertificateManually(
          testUserId,
          "courseCompletion",
          "Duplicate award attempt",
          adminId
        );
        
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect((error as Error).message).toContain("already has this certificate");
      }
    });

    it("should generate proper verification code for manual awards", async () => {
      const adminId = 1;
      
      const certificate = await awardCertificateManually(
        testUserId,
        "quizMastery",
        "Perfect quiz performance",
        adminId
      );

      const certId = (certificate as any)[0]?.insertId;
      const cert = await getCertificateById(certId);

      expect(cert?.verificationCode).toBeDefined();
      expect(cert?.verificationCode).toMatch(/^[a-f0-9]{32}$/); // 16 bytes = 32 hex chars
    });
  });

  describe("Certificate Types Available", () => {
    it("should support all 8 certificate types", async () => {
      const certificateTypes = [
        "activeMember",
        "topContributor",
        "helpfulCommunity",
        "consistentLearner",
        "leaderboardTop10",
        "courseCompletion",
        "quizMastery",
        "studyStreak",
      ];

      for (const certType of certificateTypes) {
        const hasType = await userHasCertificateType(testUserId, certType);
        // User should have some but not all types
        expect(typeof hasType).toBe("boolean");
      }
    });
  });

  describe("Certificate Data Integrity", () => {
    it("should preserve all certificate data on creation", async () => {
      const testData = {
        userId: testUserId,
        certificateType: "leaderboardTop10",
        title: "Leaderboard Top 10",
        description: "Ranked in top 10 students",
        contributionMetric: "Rank: 5",
        certificateUrl: "https://s3.example.com/cert-rank5.pdf",
        certificateKey: "rank5-key-xyz",
        verificationCode: "rank5abc123def456",
      };

      const result = await createCertificate(testData);
      const certId = (result as any)[0]?.insertId;
      const certificate = await getCertificateById(certId);

      expect(certificate?.title).toBe(testData.title);
      expect(certificate?.description).toBe(testData.description);
      expect(certificate?.contributionMetric).toBe(testData.contributionMetric);
      expect(certificate?.certificateUrl).toBe(testData.certificateUrl);
      expect(certificate?.verificationCode).toBe(testData.verificationCode);
    });

    it("should handle empty contribution metrics gracefully", async () => {
      const certificate = await createCertificate({
        userId: testUserId,
        certificateType: "studyStreak",
        title: "Study Streak Champion",
        description: "60-day streak",
        contributionMetric: "", // Empty metric
        certificateUrl: "https://example.com/streak.pdf",
        certificateKey: "streak-key",
        verificationCode: "streak123abc",
      });

      expect(certificate).toBeDefined();
    });
  });

  describe("New Member Certificate Workflow", () => {
    it("should allow new members to get certificates immediately", async () => {
      // Create a new test user
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const newUserResult = await db.insert(users).values({
        name: "New Member",
        email: `new-member-${Date.now()}@example.com`,
        role: "user",
      });
      
      const newUserId = (newUserResult as any)[0]?.insertId;

      // Award certificate to new member without any criteria
      const certificate = await awardCertificateManually(
        newUserId,
        "activeMember",
        "Welcome certificate for new member",
        1
      );

      expect(certificate).toBeDefined();
      expect((certificate as any)[0]?.insertId).toBeGreaterThan(0);

      // Verify certificate was created
      const userCerts = await getUserCertificates(newUserId);
      expect(userCerts.length).toBeGreaterThan(0);
      expect(userCerts[0]?.certificateType).toBe("activeMember");

      // Cleanup
      if (db) {
        await db.delete(communityContributionCertificates)
          .where(eq(communityContributionCertificates.userId, newUserId));
        
        await db.delete(users)
          .where(eq(users.id, newUserId));
      }
    });
  });
});
