import { describe, expect, it } from "vitest";
import { mergeMeWithUsage, normalizeUsageState } from "./usage-state";

describe("normalizeUsageState", () => {
  it("preserves numeric zero values", () => {
    const normalized = normalizeUsageState({
      generationsUsed: 0,
      freeGenerationsLimit: 2,
      remainingFreeGenerations: 0,
      accessStatus: "free"
    });

    expect(normalized).toEqual({
      generationsUsed: 0,
      freeGenerationsLimit: 2,
      remainingFreeGenerations: 0,
      accessStatus: "free",
      message: undefined,
      paywallUrl: undefined
    });
  });

  it("reads nested usage, paywall, and access fields", () => {
    const normalized = normalizeUsageState({
      usage: { generationsUsed: 2, freeGenerationsLimit: 2, freeGenerationsRemaining: 0, accessStatus: "free_limit_reached" },
      paywall: { message: "limit reached", url: "https://paywall.example" },
      access: { status: "blocked" }
    });

    expect(normalized).toMatchObject({
      generationsUsed: 2,
      freeGenerationsLimit: 2,
      remainingFreeGenerations: 0,
      accessStatus: "free_limit_reached",
      message: "limit reached",
      paywallUrl: "https://paywall.example"
    });
  });

  it("falls back to derived remaining when counts are provided but remaining is absent", () => {
    const normalized = normalizeUsageState({ generationsUsed: 2, freeGenerationsLimit: 2 });
    expect(normalized.remainingFreeGenerations).toBe(0);
  });

  it("keeps values undefined when backend usage fields are absent", () => {
    const normalized = normalizeUsageState({ message: "ok" });
    expect(normalized.generationsUsed).toBeUndefined();
    expect(normalized.freeGenerationsLimit).toBeUndefined();
    expect(normalized.remainingFreeGenerations).toBeUndefined();
  });
});

describe("mergeMeWithUsage", () => {
  it("updates tracker-related fields without inventing missing values", () => {
    const merged = mergeMeWithUsage(
      { generationsUsed: 0, freeGenerationsLimit: 2, remainingFreeGenerations: 2, accessStatus: "free" },
      normalizeUsageState({ generationsUsed: 2, freeGenerationsLimit: 2, remainingFreeGenerations: 0, accessStatus: "blocked", message: "blocked" })
    );

    expect(merged).toMatchObject({
      generationsUsed: 2,
      freeGenerationsLimit: 2,
      remainingFreeGenerations: 0,
      accessStatus: "blocked",
      message: "blocked"
    });
  });
});
