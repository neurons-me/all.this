import React from "react";

export type MatchFaceStatus = "idle" | "checking" | "match" | "no_match" | "not_enrolled" | "error";

// Keep this intentionally simple and transport-only.
// The server decides how to interpret the payload (template, blendshapes, etc.).
export type MatchFaceResult = {
  ok: boolean;
  match?: {
    username: string;
    identityHash?: string;
    score?: number;
  };
  error?: string;
};

export function normalizeBlockchain(raw: string): string {
  return String(raw || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

export function useFaceMatch(params: {
  blockchain: string;
  /** Optional: only used for debugging / scoping on the server if you want it */
  username?: string;
  /** Any serializable payload from FaceRecognition (face template, blendshapes, etc.) */
  payload: any | null;
  /** Set true to run automatically when payload changes */
  auto?: boolean;
  debounceMs?: number;
}): {
  status: MatchFaceStatus;
  result: MatchFaceResult | null;
  match: () => Promise<void>;
  reset: () => void;
} {
  const {
    blockchain,
    username,
    payload,
    auto = false,
    debounceMs = 250,
  } = params;

  const blockchainHost = React.useMemo(() => normalizeBlockchain(blockchain), [blockchain]);
  const blockchainBaseUrl = React.useMemo(
    () => (blockchainHost ? `http://${blockchainHost}` : ""),
    [blockchainHost]
  );

  const [status, setStatus] = React.useState<MatchFaceStatus>("idle");
  const [result, setResult] = React.useState<MatchFaceResult | null>(null);

  const reset = React.useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  const match = React.useCallback(async () => {
    if (!blockchainBaseUrl) {
      setStatus("error");
      setResult({ ok: false, error: "BLOCKCHAIN_REQUIRED" });
      return;
    }
    if (!payload) {
      setStatus("error");
      setResult({ ok: false, error: "FACE_PAYLOAD_REQUIRED" });
      return;
    }

    setStatus("checking");
    setResult(null);

    try {
      // Hardcoded route (same as /users/:username pattern).
      // You can later swap this to your unified ME operator surface.
      const resp = await fetch(`${blockchainBaseUrl}/faces/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username || "", template: payload }),
      });

      const json = (await resp.json().catch(() => null)) as MatchFaceResult | null;

      if (!resp.ok) {
        // If the ledger returns 404, we want to reflect it in the UI as a concrete state
        // so the face widget can show a "404"/"not enrolled" label.
        if (resp.status === 404) {
          setStatus("not_enrolled");
          setResult(json || { ok: false, error: "HTTP_404" });
          return;
        }

        setStatus("error");
        setResult(json || { ok: false, error: `HTTP_${resp.status}` });
        return;
      }

      // Support both response shapes:
      // A) { ok, match: { username, ... } }
      // B) { ok, match: boolean, score?, best? }
      const hasObjectMatch = Boolean((json as any)?.ok && (json as any)?.match && typeof (json as any).match === 'object');
      const hasBooleanMatch = Boolean((json as any)?.ok && typeof (json as any)?.match === 'boolean');

      if (hasObjectMatch) {
        setStatus("match");
        setResult(json);
        return;
      }

      if (hasBooleanMatch) {
        const m = Boolean((json as any).match);
        setStatus(m ? "match" : "no_match");
        setResult(json);
        return;
      }

      // Fallback
      setStatus("no_match");
      setResult(json || { ok: true });
    } catch (e: any) {
      setStatus("error");
      setResult({ ok: false, error: e?.message || "MATCH_FAILED" });
    }
  }, [blockchainBaseUrl, payload, username]);

  // Optional auto-run
  React.useEffect(() => {
    if (!auto) return;
    if (!payload) return;
    if (!blockchainBaseUrl) return;

    const h = window.setTimeout(() => {
      match();
    }, debounceMs);

    return () => window.clearTimeout(h);
  }, [auto, payload, blockchainBaseUrl, debounceMs, match]);

  return { status, result, match, reset };
}
