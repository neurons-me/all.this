//! this-wallet — Minimal JSON-RPC proxy for EVM chains
//!
//! Goals (MVP):
//! - Do NOT expose provider API keys to the browser.
//! - Route JSON-RPC traffic to multiple upstreams with fallback:
//!   public RPCs → Infura (if INFURA_KEY) → Alchemy (if ALCHEMY_KEY).
//! - Keep it robust and cheap: round-robin, circuit breaker, small caches.
//! - Basic safety: CORS (allow-all for MVP), rate limit, and method allow-list.
//!
//! Tunables via environment variables (see README or the table below):
//! - BIND=0.0.0.0:7878
//! - INFURA_KEY=xxxxx
//! - ALCHEMY_KEY=xxxxx
//! - PUBLIC_RPCS_MAINNET=https://rpc.flashbots.net,https://cloudflare-eth.com
//! - PUBLIC_RPCS_GOERLI=...
//! - PUBLIC_RPCS_SEPOLIA=...
//! - PUBLIC_RPCS_BNB=...
//! - RATE_LIMIT_PER_MINUTE=120
//! - RR_ENABLED=true|false        (default: true)
//! - CB_COOLDOWN_SECS=45          (seconds, default: 45)
//! - CACHE_CHAINID_TTL=30         (seconds, default: 30; 0 disables)
//!
//! Endpoints:
//! - POST   /rpc     (JSON-RPC proxy)
//! - OPTIONS /rpc    (CORS preflight OK)
//! - GET    /health  (healthcheck)
//!
//! NOTE on CORS: `Cors::permissive()` sets `Access-Control-Allow-Origin: *`.
//! Do NOT enable credentials with '*' (browsers will reject). For MVP we do not
//! need cookies/credentials; if you later need them, switch to reflecting the
//! Origin header and enable `supports_credentials()` accordingly.
use std::env;
pub mod utils;
mod core; // runtime/shared bits (HTTP client, RL, caching, upstreams, env helpers)
mod server;
mod router;
mod handlers;
/// ─────────────────────────────────────────────────────────────────────────────
/// Bootstrap
/// ─────────────────────────────────────────────────────────────────────────────
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load .env when present (local dev)
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
    let bind = env::var("BIND").unwrap_or_else(|_| "0.0.0.0:7878".to_string());
    println!("[this.wallet] RPC proxy listening at http://{bind}/rpc");

    server::run_server(&bind).await
}