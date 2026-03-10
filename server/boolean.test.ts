import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the ai module to avoid actual API calls in tests
vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      groups: [
        {
          group: "Software Engineer",
          terms: [
            "Software Engineer",
            "Software Developer",
            "Software Development Engineer",
            "SDE",
            "Software Programmer",
            "Application Developer",
          ],
        },
        {
          group: "Software Engineer (Variants)",
          terms: [
            "Software Dev",
            "SW Engineer",
            "Programmer",
            "Coder",
            "Software Architect",
            "Full Stack Developer",
          ],
        },
        {
          group: "Software Engineer (Seniority Levels)",
          terms: [
            "Junior Software Engineer",
            "Senior Software Engineer",
            "Staff Engineer",
            "Principal Engineer",
            "Lead Developer",
            "Engineering Manager",
          ],
        },
      ],
    },
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("boolean.generateGroups", () => {
  it("returns keyword groups for a valid job title input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.boolean.generateGroups({
      keyword: "Software Engineer",
      type: "jobTitle",
    });

    expect(result).toBeDefined();
    expect(result.groups).toBeDefined();
    expect(Array.isArray(result.groups)).toBe(true);
    expect(result.groups.length).toBeGreaterThan(0);

    // Check structure of each group
    for (const group of result.groups) {
      expect(group).toHaveProperty("group");
      expect(group).toHaveProperty("terms");
      expect(typeof group.group).toBe("string");
      expect(Array.isArray(group.terms)).toBe(true);
      expect(group.terms.length).toBeGreaterThan(0);
      for (const term of group.terms) {
        expect(typeof term).toBe("string");
      }
    }
  });

  it("returns keyword groups for a keyword type input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.boolean.generateGroups({
      keyword: "React",
      type: "keyword",
    });

    expect(result).toBeDefined();
    expect(result.groups).toBeDefined();
    expect(result.groups.length).toBeGreaterThan(0);
  });

  it("rejects input that is too short", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.boolean.generateGroups({
        keyword: "a",
        type: "jobTitle",
      })
    ).rejects.toThrow();
  });

  it("rejects input that is too long", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const longString = "a".repeat(101);
    await expect(
      caller.boolean.generateGroups({
        keyword: longString,
        type: "jobTitle",
      })
    ).rejects.toThrow();
  });

  it("defaults type to jobTitle when not specified", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.boolean.generateGroups({
      keyword: "Data Scientist",
    });

    expect(result).toBeDefined();
    expect(result.groups).toBeDefined();
    expect(result.groups.length).toBeGreaterThan(0);
  });

  it("returns groups with the correct structure including group name and terms array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.boolean.generateGroups({
      keyword: "Software Engineer",
      type: "jobTitle",
    });

    // First group should be the exact match
    const firstGroup = result.groups[0];
    expect(firstGroup.group).toBe("Software Engineer");
    expect(firstGroup.terms).toContain("Software Engineer");
  });
});
