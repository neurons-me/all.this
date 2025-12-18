//! Core modules root.
//!
//! This crate groups blockchain-specific runtime bits under `core/*`.
//! For now we have `eth` with HTTP client, rate limiter, caching,
//! env helpers, and upstream selection/CB.
pub mod eth; // Ethereum-specific core utilities
// Re-export ETH items at `crate::core::*` for convenience, so callers can do
// `use crate::core::{HTTP, RL, pick_upstreams, env_u64, supported_chains_vec};`
pub use eth::*;