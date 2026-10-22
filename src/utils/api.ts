// Backend API client. Base URL is configured via VITE_API_URL (see .env.example).
export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://contextguard-backend-gi7r.onrender.com'
).replace(/\/+$/, '');

export interface AnalyzeResponse {
  analysisId: string;
  expiresAt: string;
  canSubmit: boolean;
  sanitizedPayloadSha256: string;
  overallAction: 'TRANSMIT_SANITIZED' | 'TRANSMIT_AS_IS' | 'HALT_OUTBOUND';
  metrics: {
    totalDetected: number;
    allowedCount: number;
    redactedCount: number;
    blockedCount: number;
    scopedRelevancePct: number;
  };
}

export interface SubmitResponse {
  status: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new ApiError(body?.message || `Request failed (${res.status})`, res.status, body?.error);
  }
  return body as T;
}

export function analyzeRemote(
  payload: {
    rawPrompt: string;
    taskObjective: string;
    destinationId: string;
    decisionOverrides: Record<string, string>;
  },
  signal?: AbortSignal
) {
  return request<AnalyzeResponse>('/api/analyze', { method: 'POST', body: JSON.stringify(payload) }, signal);
}

export function submitApprovedRemote(
  payload: { analysisId: string; destinationId: string; expectedSanitizedPayloadSha256: string },
  signal?: AbortSignal
) {
  return request<SubmitResponse>('/api/submit-approved', { method: 'POST', body: JSON.stringify(payload) }, signal);
}
