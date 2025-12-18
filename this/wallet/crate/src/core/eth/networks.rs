use std::collections::BTreeSet;
use std::env;
// Pull upstream selection logic from the same module tree.
// We only "support" a network if pick_upstreams(chain) returns at least one URL.
use super::upstreams::pick_upstreams;
/// Default EVM networks we ship preconfigured.
/// These are *not* a closed allow-list; they are simply defaults that work out-of-the-box.
const DEFAULT_NETWORKS: &[&str] = &["mainnet", "sepolia", "goerli", "bnb", "polygon"];
/// Return a sorted, de-duplicated list of *configured* networks.
///
/// This function is dynamic:
/// - Starts from DEFAULT_NETWORKS.
/// - Adds any networks discovered via env vars like `PUBLIC_RPCS_<CHAIN>=...`.
/// - Keeps only those for which `pick_upstreams(chain)` returns a non-empty list.
///
/// Example:
///   PUBLIC_RPCS_POLYGON=https://polygon-rpc.com
/// will cause "polygon" to appear here (if `pick_upstreams("polygon")` exposes it or
/// `pick_upstreams` is extended to read the env at runtime).
pub fn get_supported_networks() -> Vec<String> {
    let mut set: BTreeSet<String> = BTreeSet::new();
     // 1) Add defaults
    for &n in DEFAULT_NETWORKS {
        set.insert(n.to_string());
    }
    // 2) Add networks discovered via PUBLIC_RPCS_* environment variables
    for (key, val) in env::vars() {
        if !key.starts_with("PUBLIC_RPCS_") {
            continue;
        }
        if val.trim().is_empty() {
            continue;
        }
        // Suffix after PUBLIC_RPCS_
        if let Some(suffix) = key.strip_prefix("PUBLIC_RPCS_") {
            let chain = suffix.to_lowercase();
            set.insert(chain);
        }
    }

    // 3) Keep only networks that actually have upstreams configured
    let mut out: Vec<String> = set
        .into_iter()
        .filter(|chain| !pick_upstreams(chain).is_empty())
        .collect();

    // 4) Final sort for deterministic UI (BTreeSet already sorts, but we might have filtered)
    out.sort();
    out
}

/// Convenience: check if a chain is currently supported (i.e., has at least one upstream).
pub fn is_supported_network(chain: &str) -> bool {
    !pick_upstreams(chain).is_empty()
}