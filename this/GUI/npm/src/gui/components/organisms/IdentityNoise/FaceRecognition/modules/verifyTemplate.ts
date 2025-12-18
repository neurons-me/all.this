export type VerifyStatusTone = 'info' | 'warn' | 'error' | 'success' | 'neutral';

export type VerifyStatus = {
  /** Local busy flag (client is doing an async verify request). */
  busy?: boolean;
  /** HTTP status from the verify endpoint (if applicable). */
  httpStatus?: number | null;
  /** Human-friendly message (optional). */
  message?: string | null;
};

export type VerifyTemplateArgs<TPayload = any> = {
  /** Endpoint to call for verification. Default should be handled by caller. */
  verifyUrl: string;
  /** Payload to send to the server. Usually contains { template, version, includeBlendshapes }. */
  payload: TPayload;
  /** Optional AbortSignal for cancellation. */
  signal?: AbortSignal;
  /** Optional hook for status updates (e.g., HUD badge). */
  onStatus?: (next: VerifyStatus | null) => void;
  /** Optional hook called with parsed JSON on success. */
  onSuccess?: (data: any) => void;
  /** Optional hook called with an Error on failure. */
  onError?: (err: Error) => void;
  /** Optional custom fetch implementation (useful for testing). */
  fetcher?: typeof fetch;
  /** Optional: treat 404 as a domain-level "not enrolled" condition (common in face flows). Default: true. */
  treat404AsNotFound?: boolean;
};

export type VerifyTemplateResult<T = any> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number | null; error: Error };

export type VerifyTemplateRequestArgs<TPayload = any> = VerifyTemplateArgs<TPayload>;

/**
 * verifyTemplate
 *
 * Small helper for POSTing a verification payload and normalizing errors.
 *
 * Notes:
 * - By default, we DO NOT treat a 404 as a "network error"; it's often an expected
 *   domain response (e.g. face not enrolled). The server may still return 404,
 *   but this function turns it into a clear Error message rather than a noisy stack.
 * - You can disable that behavior with `treat404AsNotFound: false`.
 */
export async function verifyTemplate<T = any, TPayload = any>(
  args: VerifyTemplateArgs<TPayload>
): Promise<VerifyTemplateResult<T>> {
  const {
    verifyUrl,
    payload,
    signal,
    onStatus,
    onSuccess,
    onError,
    fetcher = fetch,
    treat404AsNotFound = true,
  } = args;

  onStatus?.({ busy: true, httpStatus: 102, message: 'Verifying…' });

  try {
    const resp = await fetcher(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    const status = resp?.status ?? null;

    if (!resp.ok) {
      // Try to capture any response body for diagnostics (keep it short).
      let txt = '';
      try {
        txt = await resp.text();
      } catch {
        txt = '';
      }

      if (treat404AsNotFound && status === 404) {
        const err = new Error('404 (Not Found)');
        onStatus?.({ busy: false, httpStatus: 404, message: '404 (Not Found)' });
        onError?.(err);
        return { ok: false, status: 404, error: err };
      }

      const msg = `HTTP ${status ?? 'ERR'}${txt ? `: ${txt}` : ''}`;
      const err = new Error(msg);
      onStatus?.({ busy: false, httpStatus: status, message: msg });
      onError?.(err);
      return { ok: false, status, error: err };
    }

    // Success path
    let data: any = null;
    try {
      data = await resp.json();
    } catch {
      // If server returns empty body, treat as success with null data.
      data = null;
    }

    onStatus?.({ busy: false, httpStatus: 200, message: (data as any)?.match ? 'Match' : 'No match' });
    onSuccess?.(data);

    return { ok: true, status: status ?? 200, data: data as T };
  } catch (e: any) {
    // Aborts should not be reported as errors (usually).
    if (e?.name === 'AbortError') {
      const err = new Error('Request cancelled');
      onStatus?.({ busy: false, httpStatus: null, message: 'Cancelled' });
      return { ok: false, status: null, error: err };
    }

    const err = e instanceof Error ? e : new Error(String(e?.message || e || 'Verification failed'));
    onStatus?.({ busy: false, httpStatus: null, message: err.message });
    onError?.(err);
    return { ok: false, status: null, error: err };
  }
}

/**
 * verifyTemplateRequest
 *
 * Backwards-compatible alias for older imports.
 */
export async function verifyTemplateRequest<T = any, TPayload = any>(
  args: VerifyTemplateArgs<TPayload>
): Promise<VerifyTemplateResult<T>> {
  return verifyTemplate<T, TPayload>(args);
}

export default verifyTemplate;
