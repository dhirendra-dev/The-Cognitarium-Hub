import { describe, expect, it } from "vitest";
import { enhanceImage, generateImage } from "./image-generation";

describe("Manus image generation wrapper", () => {
  it("rejects prompts that are too short before calling the image service", async () => {
    const result = await generateImage("diagram");
    expect(result.success).toBe(false);
    expect(result.error).toContain("detailed");
  });

  it("rejects short enhancement instructions before calling the image service", async () => {
    const result = await enhanceImage("https://example.com/image.png", "fix");
    expect(result.success).toBe(false);
    expect(result.error).toContain("detailed");
  });
});
