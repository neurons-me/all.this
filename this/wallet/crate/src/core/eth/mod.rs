// Core ETH module: centralizes submodules and convenient re-exports.
pub mod env;           // env helpers (env_u32, env_u64)
pub mod http_client;   // shared reqwest Client (HTTP)
pub mod rate_limit;    // global keyed rate limiter (RL)
pub mod caching;       // small caches (CHAINID_CACHE helpers)
pub mod upstreams;     // upstream selection / RR / circuit breaker
pub mod allow_methods;
pub mod networks;       // supported networks discovery

// Convenience re-exports so other modules can `use crate::core::eth::...` directly
pub use env::{env_u32, env_u64};
pub use http_client::HTTP;
pub use rate_limit::RL;
pub use caching::{get_chainid_cached, set_chainid_cached};
pub use upstreams::{pick_upstreams, rotate_round_robin, cb_is_down, cb_mark_down, provider_label};
pub use allow_methods::ALLOW_METHODS;
pub use networks::{get_supported_networks, is_supported_network};