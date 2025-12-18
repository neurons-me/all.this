use actix_web::{HttpResponse, Responder};
use serde_json::json;
use std::env;
use crate::core::eth::ALLOW_METHODS;
use crate::core::eth::env_u32;
/// `GET /meta` — returns basic metadata for the proxy (allow-list, chains, limits).
pub async fn meta() -> impl Responder {
    let mut methods: Vec<&'static str> = ALLOW_METHODS.iter().copied().collect();
    methods.sort_unstable();
    let chains = vec!["mainnet", "sepolia", "goerli", "bnb"];
    let rate = env_u32("RATE_LIMIT_PER_MINUTE", 120);

    HttpResponse::Ok().json(json!({
        "methods": methods,
        "chains": chains,
        "rate_limit_per_minute": rate
    }))
}