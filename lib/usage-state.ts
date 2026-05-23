import type { BackendMeResponse } from "@/types/career-positioning";

export type NormalizedUsageState = {
  generationsUsed?: number;
  freeGenerationsLimit?: number;
  remainingFreeGenerations?: number;
  accessStatus?: string;
  message?: string;
  paywallUrl?: string;
};

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord | undefined => (value && typeof value === "object" ? (value as AnyRecord) : undefined);
const asNumber = (value: unknown): number | undefined => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const asString = (value: unknown): string | undefined => (typeof value === "string" && value.length > 0 ? value : undefined);

export function normalizeUsageState(payload: unknown): NormalizedUsageState {
  const root = asRecord(payload);
  const usage = asRecord(root?.usage);
  const paywall = asRecord(root?.paywall);
  const access = asRecord(root?.access);

  const generationsUsed = asNumber(root?.generationsUsed) ?? asNumber(usage?.generationsUsed);
  const freeGenerationsLimit = asNumber(root?.freeGenerationsLimit) ?? asNumber(usage?.freeGenerationsLimit);

  const remainingFreeGenerations =
    asNumber(root?.remainingFreeGenerations) ??
    asNumber(root?.freeGenerationsRemaining) ??
    asNumber(usage?.remainingFreeGenerations) ??
    asNumber(usage?.freeGenerationsRemaining) ??
    (typeof generationsUsed === "number" && typeof freeGenerationsLimit === "number" ? Math.max(freeGenerationsLimit - generationsUsed, 0) : undefined);

  const accessStatus =
    asString(root?.accessStatus) ??
    asString(root?.status) ??
    asString(root?.accessState) ??
    asString(usage?.accessStatus) ??
    asString(access?.accessStatus) ??
    asString(access?.status);

  const message = asString(root?.message) ?? asString(access?.message) ?? asString(paywall?.message) ?? asString(root?.reason);
  const paywallUrl = asString(root?.paywallUrl) ?? asString(paywall?.paywallUrl) ?? asString(paywall?.url);

  return { generationsUsed, freeGenerationsLimit, remainingFreeGenerations, accessStatus, message, paywallUrl };
}

export function mergeMeWithUsage(me: BackendMeResponse | null, usage: NormalizedUsageState): BackendMeResponse | null {
  return {
    ...(me ?? {}),
    ...(usage.generationsUsed !== undefined ? { generationsUsed: usage.generationsUsed } : {}),
    ...(usage.freeGenerationsLimit !== undefined ? { freeGenerationsLimit: usage.freeGenerationsLimit } : {}),
    ...(usage.remainingFreeGenerations !== undefined ? { remainingFreeGenerations: usage.remainingFreeGenerations } : {}),
    ...(usage.accessStatus !== undefined ? { accessStatus: usage.accessStatus } : {}),
    ...(usage.message !== undefined ? { message: usage.message } : {}),
    ...(usage.paywallUrl !== undefined ? { paywallUrl: usage.paywallUrl } : {})
  };
}
