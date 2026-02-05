/*
 * This.GUI — Components registry
 * High-level UI compositions built from molecules and atoms.
 * Exported here so consumers can import from a single namespace.
 */
import Blockchain from '@/gui/components/Blockchain/blockchain';
import IdentityNoise from '@/gui/components/IdentityNoise/IdentityNoise';
// IMPORTANT:
// - Keep this registry explicit.
// - Do not `export *` from here.
// - Add new high-level compositions intentionally.
const Components = {
  Blockchain,
  IdentityNoise,
} as const;
export { Components };
export default Components;
