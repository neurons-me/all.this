//! Keyed rate limiter for the proxy (per (origin|ip) key).
//!
//! Uses the `governor` crate with a dashmap-backed store and the Quanta clock.
//! Default quota is `RATE_LIMIT_PER_MINUTE` (env, default 120 req/min).
//!
//! Example usage in handlers:
//! ```ignore
//! use crate::core::eth::rate_limit::RL;
//! let key = format!("{origin}|{ip}");
//! if RL.check_key(&key).is_err() {
//!     return HttpResponse::TooManyRequests().json(json!({"error":"rate_limited"}));
//! }
//! ```

use governor::{clock::QuantaClock, state::keyed::DashMapStateStore, Quota, RateLimiter};
use once_cell::sync::Lazy;
use std::num::NonZeroU32;

/// Type alias for convenience in handlers/tests.
pub type Limiter = RateLimiter<String, DashMapStateStore<String>, QuantaClock>;

/// Global keyed rate limiter. Configure per-minute quota via `RATE_LIMIT_PER_MINUTE`.
pub static RL: Lazy<Limiter> = Lazy::new(|| {
    let per_min = read_env_u32("RATE_LIMIT_PER_MINUTE", 120);
    // Ensure non-zero to satisfy NonZeroU32.
    let per_min = per_min.max(1);
    let quota = Quota::per_minute(NonZeroU32::new(per_min).expect("non-zero quota"));
    RateLimiter::keyed(quota)
});

/// Read a u32 env var with default (local helper to avoid cross-module deps).
fn read_env_u32(name: &str, default: u32) -> u32 {
    std::env::var(name)
        .ok()
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(default)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_limiter() {
        // Just ensure the static initializes.
        let _ = &*RL;
    }
}
