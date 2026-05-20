import { describe, expect, it } from "vitest";
import { parseGenerateResponse } from "./generate-response";

const validOutput = {
  careerPositioningSummary: "Summary",
  transferableValueMap: [{ experience: "Exp", transferableValue: "Value", whereItApplies: "Where" }],
  experienceReframe: [{ currentFraming: "Current", strongerPositioning: "Stronger", whyItWorks: "Why" }],
  roleAndOpportunityFit: [{ potentialDirection: "Direction", whyItFits: "Fits", howToPositionExperience: "Position", gapOrCaution: "Gap" }],
  talkingPoints: { shortVersion: "Short", thirtySecondVersion: "Thirty", interviewReadyVersion: "Interview" },
  suggestedNextStep: ["Step 1"]
};

describe("parseGenerateResponse", () => {
  it("accepts json.output when valid", () => {
    const parsed = parseGenerateResponse({ output: validOutput });
    expect(parsed).toEqual({ ok: true, output: validOutput });
  });

  it("does not treat json.data as success", () => {
    const parsed = parseGenerateResponse({ data: validOutput });
    expect(parsed).toEqual({ ok: false, error: "missing_output" });
  });

  it("returns missing_output when output is absent", () => {
    const parsed = parseGenerateResponse({ message: "done" });
    expect(parsed).toEqual({ ok: false, error: "missing_output" });
  });

  it("returns invalid_output when output exists but schema fails", () => {
    const parsed = parseGenerateResponse({ output: { ...validOutput, talkingPoints: { shortVersion: "x" } } });
    expect(parsed).toEqual({ ok: false, error: "invalid_output" });
  });
});
