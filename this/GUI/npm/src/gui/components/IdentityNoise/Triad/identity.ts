// identity.ts — derive identityRoot = hash(secret + namespace)
// by suiGn
import { keccak_256 } from "js-sha3";
export interface IdentityInput {
  secret: string;
  namespace: string; // "username@hostname:port"
}

export interface IdentityResult {
  namespace: string;
  identityRoot: string;
}

/**
 * Derives identityRoot using keccak256(secret + namespace)
 */
export function deriveIdentity({ secret, namespace }: IdentityInput): IdentityResult {
  const combined = secret + namespace;
  const hash = keccak_256(combined);
  const identityRoot = "0x" + hash;
  // Log to browser console
  if (typeof window !== "undefined") {
    console.log("ME Identity Derived:");
    console.log("secret:", secret);
    console.log("namespace:", namespace);
    const masked = "••••••••••••••••••••••••••••••••" + identityRoot.slice(-4);
    console.log("identityRoot:", masked);
  }

  return { namespace, identityRoot };
}