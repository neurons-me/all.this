use actix_web::{web, HttpRequest, HttpResponse, Responder};
use tera::{Tera, Context};
use crate::core::eth::networks::get_supported_networks;
/// `GET /eth-playground` — Renders the JSON-RPC playground.
/// Accepts optional `?method=...` to prefill the request body and the page header.
pub async fn eth_playground(req: HttpRequest, tmpl: web::Data<Tera>) -> impl Responder {
    // Read ?method= from the query string (robust to missing/invalid cases)
    let method_from_qs = web::Query::<std::collections::HashMap<String, String>>::from_query(req.query_string())
        .ok()
        .and_then(|m| m.get("method").cloned());
    // Read ?chain= from the query string
    let chain_from_qs = web::Query::<std::collections::HashMap<String, String>>::from_query(req.query_string())
        .ok()
        .and_then(|m| m.get("chain").cloned());
    // Title reflects the selected method when present
    let page_title = match &method_from_qs {
        Some(m) if !m.is_empty() => format!("{} — Playground | This.Wallet", m),
        _ => "Playground — This.Wallet".to_string(),
    };
    // Dynamically fetch supported chains
    let chains = get_supported_networks();
    let base = std::env::var("PUBLIC_BASE").unwrap_or_else(|_| "http://localhost:7878".to_string());
    let mut context = Context::new();
    context.insert("title", &page_title);
    context.insert("chains", &chains);
    context.insert("base", &base);
    if let Some(m) = method_from_qs { context.insert("method", &m); }
    if let Some(c) = chain_from_qs { context.insert("selected_chain", &c); }
    match tmpl.render("pages/eth/eth-playground-json-rpc.html", &context) {
        Ok(html) => HttpResponse::Ok().content_type("text/html; charset=utf-8").body(html),
        Err(e) => HttpResponse::InternalServerError().body(format!("template error: {}", e)),
    }
}
