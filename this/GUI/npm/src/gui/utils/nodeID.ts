// src/gui/utils/nodeID.ts
// Utility to ensure a unique node ID for each component in DOM. 
// using crypto.randomUUID if available 
// otherwise falling back to Math.random.
export function ensureNodeId(type: string, providedId?: string): string {
  if (providedId) return providedId;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${type}-${crypto.randomUUID()}`;
  }
  return `${type}-${Math.random().toString(36).slice(2)}`;
}