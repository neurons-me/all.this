//! Handlers for exposing supported EVM networks.
//!
//! This module returns the dynamic list of EVM networks that the API can
//! currently serve, based on environment configuration plus built-in defaults.
//!
//! Typical usage:
//!   GET /evm-networks  ->  { "networks": ["mainnet","sepolia", ...] }
use actix_web::{HttpResponse, Responder};
use actix_web::web;
use tera::Tera;
use serde_json::json;
// Pull the discovery logic from the core EVM module.
use crate::core::eth::networks::get_supported_networks;
/// `GET /evm-networks` — returns a JSON array with currently supported EVM networks.
///
/// The list is computed as:
/// 1) Defaults (e.g., mainnet, sepolia, goerli, bnb, polygon)
/// 2) + any networks discovered via env vars like `PUBLIC_RPCS_<CHAIN>=...`
/// 3) Filtered to only those for which we have at least one upstream RPC.
///
/// Example response:
/// {
///   "networks": ["bnb", "goerli", "mainnet", "polygon", "sepolia"]
/// }
pub async fn evm_networks() -> impl Responder {
    let networks = get_supported_networks();
    HttpResponse::Ok()
        .content_type("application/json")
        .json(json!({ "networks": networks }))
}

/// `GET /evm-networks-page` — Renders a page with supported EVM networks.
pub async fn evm_networks_page(tmpl: web::Data<Tera>) -> impl Responder {
    let networks = get_supported_networks();
    let mut ctx = tera::Context::new();
    ctx.insert("title", "Supported EVM Networks — This.Wallet");
    ctx.insert("networks", &networks);
    match tmpl.render("pages/eth/evm_networks.html", &ctx) {
        Ok(html) => HttpResponse::Ok().content_type("text/html; charset=utf-8").body(html),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("template error: {}", e)),
    }
}