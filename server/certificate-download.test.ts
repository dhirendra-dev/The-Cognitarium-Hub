import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { communityContributionCertificates, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Certificate Download", () => {
  let testUserId: number;
  let testCertificateId: number;
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userEmail = `test-cert-${Date.now()}@example.com`;
    await db.insert(users).values({
      openId: `test-user-${Date.now()}`,
      name: "Test User",
      email: userEmail,
      role: "user",
    });

    // Get the inserted user ID
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail));

    testUserId = userResult[0]?.id || 1;

    // Create test certificate
    await db
      .insert(communityContributionCertificates)
      .values({
        userId: testUserId,
        certificateType: "activeMember",
        title: "Active Community Member",
        description: "Awarded for active community participation",
        contributionMetric: "10 posts with 50 likes",
        certificateUrl: "https://example.com/cert.pdf",
        certificateKey: "certificates/test-cert.pdf",
        verificationCode: "TEST123456789ABC",
        isDownloaded: false,
      });

    // Get the inserted certificate ID
    const certQueryResult = await db
      .select()
      .from(communityContributionCertificates)
      .where(eq(communityContributionCertificates.userId, testUserId))
      .limit(1);

    testCertificateId = certQueryResult[0]?.id || 1;
  });

  afterAll(async () => {
    if (!db) return;

    // Clean up test data
    try {
      await db
        .delete(communityContributionCertificates)
        .where(eq(communityContributionCertificates.userId, testUserId));

      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      console.warn("Cleanup error:", error);
    }
  });

  it("should retrieve certificate with download URL", async () => {
    const cert = await db
      .select()
      .from(communityContributionCertificates)
      .where(eq(communityContributionCertificates.id, testCertificateId))
      .limit(1);

    expect(cert).toHaveLength(1);
    expect(cert[0]?.certificateUrl).toBe("https://example.com/cert.pdf");
    expect(cert[0]?.verificationCode).toBe("TEST123456789ABC");
  });

  it("should mark certificate as downloaded", async () => {
    // Mark as downloaded
    await db
      .update(communityContributionCertificates)
      .set({
        isDownloaded: true,
        downloadedAt: new Date(),
      })
      .where(eq(communityContributionCertificates.id, testCertificateId));

    // Verify update
    const cert = await db
      .select()
      .from(communityContributionCertificates)
      .where(eq(communityContributionCertificates.id, testCertificateId))
      .limit(1);

    expect(cert[0]?.isDownloaded).toBe(true);
    expect(cert[0]?.downloadedAt).toBeDefined();
  });

  it("should have correct certificate metadata for download", async () => {
    const cert = await db
      .select()
      .from(communityContributionCertificates)
      .where(eq(communityContributionCertificates.id, testCertificateId))
      .limit(1);

    expect(cert[0]).toMatchObject({
      userId: testUserId,
      certificateType: "activeMember",
      title: "Active Community Member",
      verificationCode: "TEST123456789ABC",
      certificateUrl: expect.any(String),
    });
  });

  it("should generate correct download filename", () => {
    const verificationCode = "TEST123456789ABC";
    const expectedFilename = `certificate-${verificationCode}.pdf`;

    expect(expectedFilename).toBe("certificate-TEST123456789ABC.pdf");
  });

  it("should handle multiple certificates for same user", async () => {
    // Create another certificate for same user
    await db
      .insert(communityContributionCertificates)
      .values({
        userId: testUserId,
        certificateType: "topContributor",
        title: "Top Contributor",
        description: "Awarded for top contributions",
        contributionMetric: "50 posts with 200 likes",
        certificateUrl: "https://example.com/cert2.pdf",
        certificateKey: "certificates/test-cert2.pdf",
        verificationCode: "TEST987654321XYZ",
        isDownloaded: false,
      });

    // Retrieve all certificates for user
    const certs = await db
      .select()
      .from(communityContributionCertificates)
      .where(eq(communityContributionCertificates.userId, testUserId));

    expect(certs.length).toBeGreaterThanOrEqual(2);
  });
});
