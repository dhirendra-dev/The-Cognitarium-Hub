import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const project = resolve(process.cwd());
const readSource = (relativePath: string) => readFileSync(resolve(project, relativePath), "utf8");

describe("responsive layout contracts", () => {
  it("keeps the primary shell responsive across navigation and page layouts", () => {
    const shell = readSource("client/src/components/DashboardLayout.tsx");
    const dashboard = readSource("client/src/pages/Dashboard.tsx");
    const community = readSource("client/src/pages/CommunityHub.tsx");
    expect(shell).toMatch(/md:|lg:/);
    expect(dashboard).toMatch(/sm:|md:|lg:/);
    expect(community).toMatch(/sm:|md:|lg:/);
    expect(shell).toMatch(/overflow|w-full|max-w|grid/);
  });
});
