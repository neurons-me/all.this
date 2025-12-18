//! Upstream selection, round-robin rotation and circuit-breaker for EVM chains.
//!
//! Exposes:
//! - `pick_upstreams(chain)` -> ordered Vec<String>
//! - `rotate_round_robin(chain, &mut ups)` -> rotate list in-place
//! - `cb_is_down(url)` / `cb_mark_down(url, cooldown_secs)` -> simple CB state
//! - `provider_label(url)` -> best-effort provider name from hostname

use once_cell::sync::Lazy;
use std::{
    collections::{HashMap, HashSet},
    env,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Mutex,
    },
    time::{Duration, Instant},
};

/// Round-robin counters per chain.
static RR_MAINNET: AtomicUsize = AtomicUsize::new(0);
static RR_GOERLI: AtomicUsize = AtomicUsize::new(0);
static RR_SEPOLIA: AtomicUsize = AtomicUsize::new(0);
static RR_BNB: AtomicUsize = AtomicUsize::new(0);

/// Circuit breaker memory: url -> down_until (Instant).
static CB: Lazy<Mutex<HashMap<String, Instant>>> = Lazy::new(|| Mutex::new(HashMap::new()));

/// Build the ordered list of upstream RPC endpoints for a given chain.
/// Order matters (we will try in this order, possibly rotated by RR).
/// Defaults include public endpoints; INFURA/ALCHEMY/ANKR are appended if keys exist.
/// You can prepend public endpoints at runtime via `PUBLIC_RPCS_<CHAIN>`.
pub fn pick_upstreams(chain: &str) -> Vec<String> {
    let infura = env::var("INFURA_KEY").ok();
    let alchemy = env::var("ALCHEMY_KEY").ok();
    let ankr = env::var("ANKR_KEY").ok();

    let mut v = Vec::new();
    match chain {
        "mainnet" | "eth" => {
            // Prefer key-auth endpoints first, then trusted public mirrors
            if let Some(k) = &ankr {
                v.push(format!("https://rpc.ankr.com/eth/{k}"));
            }
            v.push("https://ethereum.publicnode.com".to_string());
            if let Some(k) = &infura {
                v.push(format!("https://mainnet.infura.io/v3/{k}"));
            }
            if let Some(k) = &alchemy {
                v.push(format!("https://eth-mainnet.g.alchemy.com/v2/{k}"));
            }
        }
        "goerli" => {
            if let Some(k) = &ankr {
                v.push(format!("https://rpc.ankr.com/eth_goerli/{k}"));
            }
            if let Some(k) = &infura {
                v.push(format!("https://goerli.infura.io/v3/{k}"));
            }
            if let Some(k) = &alchemy {
                v.push(format!("https://eth-goerli.g.alchemy.com/v2/{k}"));
            }
        }
        "sepolia" => {
            if let Some(k) = &ankr {
                v.push(format!("https://rpc.ankr.com/eth_sepolia/{k}"));
            }
            v.push("https://ethereum-sepolia.publicnode.com".to_string());
            if let Some(k) = &infura {
                v.push(format!("https://sepolia.infura.io/v3/{k}"));
            }
            if let Some(k) = &alchemy {
                v.push(format!("https://eth-sepolia.g.alchemy.com/v2/{k}"));
            }
        }
        "bsc" | "bnb" => {
            v.push("https://bsc-dataseed.binance.org/".to_string());
            v.push("https://bsc.publicnode.com".to_string());
        }
        other => {
            eprintln!("[this.wallet] unsupported chain requested: {other}");
        }
    }

    // Allow augmenting public endpoints via env (comma-separated).
    // Example: PUBLIC_RPCS_MAINNET="https://rpc.flashbots.net,https://cloudflare-eth.com"
    if let Ok(extra) = env::var(format!("PUBLIC_RPCS_{}", chain.to_uppercase())) {
        for u in extra.split(',').map(|s| s.trim()).filter(|s| !s.is_empty()) {
            // Insert at the beginning so env-defined endpoints are tried first
            v.insert(0, u.to_string());
        }
    }

    // Deduplicate while preserving order. Normalize by trimming a trailing '/'
    // so `https://host` and `https://host/` are considered the same.
    let mut seen: HashSet<String> = HashSet::new();
    v.retain(|url| {
        let key = url.trim_end_matches('/').to_string();
        if seen.contains(&key) { return false; }
        seen.insert(key);
        true
    });

    v
}

/// Rotate the upstream list using a chain-specific round-robin counter.
/// This balances load across otherwise-equal endpoints.
pub fn rotate_round_robin(chain: &str, ups: &mut Vec<String>) {
    if ups.is_empty() {
        return;
    }
    let idx = match chain {
        "mainnet" | "eth" => RR_MAINNET.fetch_add(1, Ordering::Relaxed),
        "goerli" => RR_GOERLI.fetch_add(1, Ordering::Relaxed),
        "sepolia" => RR_SEPOLIA.fetch_add(1, Ordering::Relaxed),
        "bsc" | "bnb" => RR_BNB.fetch_add(1, Ordering::Relaxed),
        _ => 0,
    } % ups.len();
    ups.rotate_left(idx);
}

/// Check whether an upstream is currently "down" per the circuit breaker.
pub fn cb_is_down(url: &str) -> bool {
    let now = Instant::now();
    let guard = CB.lock().expect("CB mutex poisoned");
    if let Some(&until) = guard.get(url) {
        return now < until;
    }
    false
}

/// Mark an upstream as "down" for a cooldown period (seconds).
pub fn cb_mark_down(url: &str, cooldown_secs: u64) {
    if cooldown_secs == 0 { return; }
    let until = Instant::now() + Duration::from_secs(cooldown_secs);
    if let Ok(mut guard) = CB.lock() {
        guard.insert(url.to_string(), until);
    }
}

/// Guess a human-friendly provider name from an upstream URL hostname.
/// This is best-effort and meant only for UI/telemetry labeling.
pub fn provider_label(url: &str) -> &'static str {
    let lower = url.to_ascii_lowercase();
    if lower.contains("infura.io") {
        "Infura"
    } else if lower.contains("alchemy.com") {
        "Alchemy"
    } else if lower.contains("ankr.com") {
        "Ankr"
    } else if lower.contains("publicnode.com") {
        "PublicNode"
    } else if lower.contains("binance.org") || lower.contains("bsc-dataseed") {
        "Binance"
    } else if lower.contains("flashbots.net") {
        "Flashbots"
    } else if lower.contains("cloudflare-eth.com") || lower.contains("cloudflare") {
        "Cloudflare"
    } else {
        "Other"
    }
}