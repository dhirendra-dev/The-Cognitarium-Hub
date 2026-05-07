import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  initializeCertificateCriteria,
  getCertificateCriteria,
  getUserContributionStats,
  createCertificate,
  getUserCertificates,
  getCertificateById,
  markCertificateAsDownloaded,
  userHasCertificateType,
} from "./db";
import { certificateEligibilityCriteria, communityContributionCertificates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Certificate Feature Tests", () => {
  let db: any;
  const testUserId = 9999;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      try {
        await db.delete(communityContributionCertificates).where(
          eq(communityContributionCertificates.userId, testUserId)
        );
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    }
  });

  it("should initialize certificate criteria", async () => {
    await initializeCertificateCriteria();
    
    // Verify criteria were created
    const criteria = await db.select().from(certificateEligibilityCriteria);
    expect(criteria.length).toBeGreaterThan(0);
    expect(criteria.length).toBe(8); // 8 certificate types
  });

  it("should retrieve certificate criteria by type", async () => {
    const criteria = await getCertificateCriteria("activeMember");
    
    expect(criteria).toBeDefined();
    expect(criteria?.certificateType).toBe("activeMember");
    expect(criteria?.minPostCount).toBe(5);
    expect(criteria?.minLikesReceived).toBe(10);
    expect(criteria?.minRepliesCount).toBe(3);
  });

  it("should retrieve all 8 certificate types", async () => {
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
      const criteria = await getCertificateCriteria(certType);
      expect(criteria).toBeDefined();
      expect(criteria?.certificateType).toBe(certType);
    }
  });

  it("should calculate user contribution stats correctly", async () => {
    // This test uses existing data from the database
    const stats = await getUserContributionStats(4320001); // John Doe
    
    expect(stats).toBeDefined();
    expect(stats?.postCount).toBeGreaterThanOrEqual(0);
    expect(stats?.totalLikesReceived).toBeGreaterThanOrEqual(0);
    expect(stats?.replyCount).toBeGreaterThanOrEqual(0);
  });

  it("should create a certificate and save to database", async () => {
    const certificateData = {
      userId: testUserId,
      certificateType: "activeMember" as const,
      title: "Test Active Community Member Certificate",
      description: "Test certificate for verification",
      contributionMetric: "5 posts with 10 likes",
      certificateUrl: "https://example.com/test-certificate.pdf",
      certificateKey: "test-key-12345",
      verificationCode: "test-verification-code-12345",
    };

    const result = await createCertificate(certificateData);
    
    expect(result).toBeDefined();
    expect(result[0]?.insertId).toBeGreaterThan(0);
  });

  it("should retrieve user certificates", async () => {
    const certificates = await getUserCertificates(testUserId);
    
    expect(Array.isArray(certificates)).toBe(true);
    if (certificates.length > 0) {
      expect(certificates[0]?.userId).toBe(testUserId);
      expect(certificates[0]?.certificateType).toBeDefined();
    }
  });

  it("should retrieve certificate by ID", async () => {
    // First create a certificate
    const certificateData = {
      userId: testUserId,
      certificateType: "topContributor" as const,
      title: "Test Top Contributor Certificate",
      description: "Test certificate",
      contributionMetric: "20 posts with 100 likes",
      certificateUrl: "https://example.com/test-certificate-2.pdf",
      certificateKey: "test-key-67890",
      verificationCode: "test-verification-code-67890",
    };

    const createResult = await createCertificate(certificateData);
    const certId = createResult[0]?.insertId;

    if (certId) {
      const cert = await getCertificateById(certId);
      
      expect(cert).toBeDefined();
      expect(cert?.id).toBe(certId);
      expect(cert?.userId).toBe(testUserId);
      expect(cert?.certificateType).toBe("topContributor");
    }
  });

  it("should mark certificate as downloaded", async () => {
    // Create a certificate first
    const certificateData = {
      userId: testUserId,
      certificateType: "helpfulCommunity" as const,
      title: "Test Helpful Community Certificate",
      description: "Test certificate",
      contributionMetric: "50 helpful replies",
      certificateUrl: "https://example.com/test-certificate-3.pdf",
      certificateKey: "test-key-11111",
      verificationCode: "test-verification-code-11111",
    };

    const createResult = await createCertificate(certificateData);
    const certId = createResult[0]?.insertId;

    if (certId) {
      const result = await markCertificateAsDownloaded(certId);
      
      expect(result).toBeDefined();
      
      // Verify it was marked as downloaded
      const cert = await getCertificateById(certId);
      expect(cert?.isDownloaded).toBe(true);
    }
  });

  it("should check if user has certificate type", async () => {
    // Create a certificate first
    const certificateData = {
      userId: testUserId,
      certificateType: "consistentLearner" as const,
      title: "Test Consistent Learner Certificate",
      description: "Test certificate",
      contributionMetric: "100 study hours",
      certificateUrl: "https://example.com/test-certificate-4.pdf",
      certificateKey: "test-key-22222",
      verificationCode: "test-verification-code-22222",
    };

    await createCertificate(certificateData);

    // Check if user has this certificate type
    const hasConsistentLearner = await userHasCertificateType(testUserId, "consistentLearner");
    expect(hasConsistentLearner).toBe(true);

    // Check if user has a certificate type they don't have
    const hasLeaderboardTop10 = await userHasCertificateType(testUserId, "leaderboardTop10");
    expect(hasLeaderboardTop10).toBe(false);
  });

  it("should verify certificate criteria thresholds", async () => {
    const criteria = await getCertificateCriteria("topContributor");
    
    expect(criteria).toBeDefined();
    expect(criteria?.minPostCount).toBe(20);
    expect(criteria?.minLikesReceived).toBe(100);
    expect(criteria?.minRepliesCount).toBe(15);
  });

  it("should verify consistent learner criteria", async () => {
    const criteria = await getCertificateCriteria("consistentLearner");
    
    expect(criteria).toBeDefined();
    expect(criteria?.minStudyHours).toBe("100.00");
    expect(criteria?.minConsecutiveDays).toBe(30);
  });

  it("should verify leaderboard top 10 criteria", async () => {
    const criteria = await getCertificateCriteria("leaderboardTop10");
    
    expect(criteria).toBeDefined();
    expect(criteria?.minLeaderboardRank).toBe(10);
  });
});
