import { careerOutputSchema } from "./schema";
import type { CareerPositioningOutput } from "../types/career-positioning";

export type ParseGenerateResponseResult =
  | { ok: true; output: CareerPositioningOutput }
  | { ok: false; error: "missing_output" | "invalid_output" };

export function parseGenerateResponse(payload: unknown): ParseGenerateResponseResult {
  const record = payload as { output?: unknown } | null;

  if (!record || typeof record !== "object" || !("output" in record)) {
    return { ok: false, error: "missing_output" };
  }

  const parsedOutput = careerOutputSchema.safeParse(record.output);
  if (!parsedOutput.success) {
    return { ok: false, error: "invalid_output" };
  }

  return { ok: true, output: parsedOutput.data };
}
