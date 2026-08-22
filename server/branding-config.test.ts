import { describe, expect, it } from "vitest";

describe("official branding configuration", () => {
  it("exposes the Cognitarium Hub title and logo values", () => {
    expect(process.env.VITE_APP_TITLE).toBe("The Cognitarium Hub");
    expect(process.env.VITE_APP_LOGO).toBe("/manus-storage/cognitarium-hub-logo_2e4f180f.svg");
  });
});
