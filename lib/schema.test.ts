import { describe, expect, it } from "vitest";
import { careerInputSchema } from "./schema";

const base = {
  outputType: "resume_summary",
  currentLanguage: "This is a sufficiently detailed language sample for meaningful generation output in context.",
  currentWork: "public_health_programs",
  desiredDirection: "similar_field",
  emphasis: ["transferable_skills"],
  professionalContext: "balanced_broadly_accessible"
} as const;

describe("careerInputSchema", () => {
  it("rejects currentLanguage under 50 characters", () => {
    const parsed = careerInputSchema.safeParse({ ...base, currentLanguage: "Too short for useful output." });
    expect(parsed.success).toBe(false);
  });

  it("allows 1 to 3 emphasis choices", () => {
    expect(careerInputSchema.safeParse(base).success).toBe(true);
    expect(careerInputSchema.safeParse({ ...base, emphasis: ["transferable_skills", "strategy_policy_systems", "adaptability_during_change"] }).success).toBe(true);
    expect(careerInputSchema.safeParse({ ...base, emphasis: ["transferable_skills", "strategy_policy_systems", "adaptability_during_change", "program_project_results"] }).success).toBe(false);
  });
});
