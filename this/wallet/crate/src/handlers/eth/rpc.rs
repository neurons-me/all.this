//! JSON-RPC handler module for Ethereum (proxy to upstream nodes).
use actix_web::{web, HttpRequest, HttpResponse, Responder};
use actix_web::http::StatusCode as HttpStatus;
use reqwest::StatusCode as ReqStatus;
use serde_json::{json, Value};
use std::env;

use crate::core::eth::ALLOW_METHODS;
use crate::core::eth::{
    HTTP, RL,
    pick_upstreams, rotate_round_robin, cb_is_down, cb_mark_down,
    env_u64,
    get_chainid_cached, set_chainid_cached,
};
use crate::utils::net::client_ip;

#[derive(serde::Deserialize)]
pub struct RpcQuery {
    pub chain: Option<String>,
}

/// Handler for preflight OPTIONS requests (CORS).
pub async fn rpc_options(_req: HttpRequest) -> impl Responder {
    HttpResponse::Ok()
        .append_header(("Access-Control-Allow-Origin", "*"))
        .append_header(("Access-Control-Allow-Methods", "POST, OPTIONS"))
        .append_header(("Access-Control-Allow-Headers", "Content-Type"))
        .finish()
}

/// Handler for POST JSON-RPC requests: forwards to configured upstream nodes.
pub async fn rpc(
    req: HttpRequest,
    q: web::Query<RpcQuery>,
    payload: web::Json<Value>,
) -> impl Responder {
    // ── Rate limit per (origin|ip)
    let origin = req
        .headers()
        .get("origin")
        .and_then(|h| h.to_str().ok())
        .unwrap_or_default()
        .to_string();
    let ip = client_ip(&req);
    let rl_key = format!("{origin}|{ip}");
    if RL.check_key(&rl_key).is_err() {
        return HttpResponse::TooManyRequests().json(json!({ "error": "rate_limited" }));
    }

    let body = payload.into_inner();

    // ── Basic JSON-RPC validation (MVP: single request only)
    if body.is_array() {
        return HttpResponse::BadRequest().json(json!({ "error": "batch_not_supported" }));
    }
    let method = match body.get("method").and_then(|m| m.as_str()) {
        Some(m) => m,
        None => return HttpResponse::BadRequest().json(json!({ "error": "missing_method" })),
    };
    if !ALLOW_METHODS.contains(method) {
        return HttpResponse::BadRequest().json(json!({
            "error": "method_not_allowed",
            "method": method
        }));
    }

    let chain = q.chain.as_deref().unwrap_or("mainnet");

    // ── Tiny cache for eth_chainId
    if method == "eth_chainId" {
        if let Some(cached) = get_chainid_cached(chain) {
            return HttpResponse::Ok().content_type("application/json").body(cached);
        }
    }

    // ── Upstream selection + optional round-robin rotation
    let mut upstreams = pick_upstreams(chain);
    if upstreams.is_empty() {
        return HttpResponse::InternalServerError().json(json!({
            "error": "no_upstreams_configured",
            "chain": chain
        }));
    }
    let rr_enabled = env::var("RR_ENABLED").ok().map(|v| v != "false").unwrap_or(true);
    if rr_enabled {
        rotate_round_robin(chain, &mut upstreams);
    }

    // ── Circuit breaker loop across upstreams
    let cb_cooldown = env_u64("CB_COOLDOWN_SECS", 45);
    for url in upstreams {
        if cb_is_down(&url) { continue; }

        let resp = HTTP
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await;

        match resp {
            Ok(r) => {
                let status = r.status();
                if status == ReqStatus::OK || status == ReqStatus::BAD_REQUEST {
                    let text = r.text().await.unwrap_or_else(|_| "{}".into());

                    // Cache chainId responses
                    if method == "eth_chainId" {
                        let ttl = env_u64("CACHE_CHAINID_TTL", 30);
                        if ttl > 0 { set_chainid_cached(chain, text.clone(), ttl); }
                    }

                    let http_status = HttpStatus::from_u16(status.as_u16()).unwrap_or(HttpStatus::OK);
                    return HttpResponse::build(http_status)
                        .content_type("application/json")
                        .body(text);
                } else {
                    // Non-OK from upstream → mark down and try next
                    cb_mark_down(&url, cb_cooldown);
                    continue;
                }
            }
            Err(_) => {
                // Network/timeout error → mark down and try next
                cb_mark_down(&url, cb_cooldown);
                continue;
            }
        }
    }

    HttpResponse::BadGateway().json(json!({ "error": "all_upstreams_failed", "chain": chain }))
}