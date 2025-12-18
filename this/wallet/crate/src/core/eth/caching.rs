//! Lightweight in-memory caches for the proxy.
//!
//! Currently we keep a tiny cache for `eth_chainId` responses because that
//! value is stable and often requested by clients during startup. Caching it
//! reduces latency and load on upstreams.
use once_cell::sync::Lazy;
use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

/// Cache map: chain -> (raw_json_response, expires_at)
pub static CHAINID_CACHE: Lazy<Mutex<HashMap<String, (String, Instant)>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
/// Try to read a cached `eth_chainId` response for `chain`.
/// Returns `Some(json_text)` if present and not expired; otherwise `None`.
/// Performs a quick purge of expired entries on access.
pub fn get_chainid_cached(chain: &str) -> Option<String> {
    // Opportunistic cleanup to keep the tiny cache fresh without a background task.
    purge_expired();

    let now = Instant::now();
    let guard = CHAINID_CACHE.lock().ok()?;
    guard.get(chain).and_then(|(txt, until)| {
        if &now < until { Some(txt.clone()) } else { None }
    })
}

/// Store a `eth_chainId` JSON response text for `chain` with a TTL in seconds.
/// If `ttl_secs == 0`, the value is not stored.
pub fn set_chainid_cached(chain: &str, json_text: String, ttl_secs: u64) {
    if ttl_secs == 0 { return; }
    let until = Instant::now() + Duration::from_secs(ttl_secs);
    if let Ok(mut guard) = CHAINID_CACHE.lock() {
        guard.insert(chain.to_string(), (json_text, until));
    }
}

/// Optional: purge expired entries (rarely needed because map is tiny).
pub fn purge_expired() {
    let now = Instant::now();
    if let Ok(mut guard) = CHAINID_CACHE.lock() {
        guard.retain(|_, (_, until)| &now < until);
    }
}