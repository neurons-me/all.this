use actix_web::{web, HttpResponse, Responder};
use serde_json::json;
use tera::{Tera, Context};
use crate::core::eth::{pick_upstreams, cb_is_down, provider_label};
use crate::core::eth::networks::get_supported_networks;
/// Mask potential secrets in provider URLs while keeping host and general shape visible.
fn mask_upstream_url(u: &str) -> String {
    if let Some(scheme_idx) = u.find("://") {
        let rest = &u[scheme_idx + 3..];
        let host_end = rest.find('/').unwrap_or(rest.len());
        let host = &rest[..host_end];
        let remainder = if host_end < rest.len() { &rest[host_end..] } else { "" };

        let (path, query) = if let Some(qidx) = remainder.find('?') {
            (&remainder[..qidx], &remainder[qidx + 1..])
        } else { (remainder, "") };

        let masked_path = path
            .split('/')
            .map(|seg| if seg.len() >= 20 { "***" } else { seg })
            .collect::<Vec<_>>()
            .join("/");

        let masked_query = if !query.is_empty() {
            let pairs = query.split('&').map(|kv| {
                let mut it = kv.splitn(2, '=');
                let k = it.next().unwrap_or("");
                let v = it.next().unwrap_or("");
                if v.len() >= 20 { format!("{}=***", k) } else { kv.to_string() }
            }).collect::<Vec<_>>();
            format!("?{}", pairs.join("&"))
        } else { String::new() };

        return format!("{}{}{}{}", &u[..scheme_idx+3], host, masked_path, masked_query);
    }

    if let Some(idx) = u.rfind('/') {
        let (base, last) = u.split_at(idx+1);
        if last.len() >= 20 { return format!("{}***", base); }
    }
    u.to_string()
}

/// `GET /dev/upstreams` — Renders a dev-only page that fetches /meta/upstreams
pub async fn dev_upstreams_page(tmpl: web::Data<Tera>) -> impl Responder {
    let chains = get_supported_networks();
    let base = std::env::var("PUBLIC_BASE").unwrap_or_else(|_| "http://localhost:7878".to_string());

    let mut ctx = Context::new();
    ctx.insert("title", "Effective Upstream Nodes (dev) — This.Wallet");
    ctx.insert("chains", &chains);
    ctx.insert("base", &base);

    match tmpl.render("pages/eth/eth_upstream_nodes.html", &ctx) {
        Ok(html) => HttpResponse::Ok().content_type("text/html; charset=utf-8").body(html),
        Err(e) => HttpResponse::InternalServerError().body(format!("template error: {}", e)),
    }
}

/// `GET /meta/upstreams` (dev-only): returns effective upstream URLs per chain with secrets masked.
pub async fn meta_upstreams() -> impl Responder {
    // Only enabled if EXPOSE_UPSTREAMS=1|true
    let expose = std::env::var("EXPOSE_UPSTREAMS").unwrap_or_default();
    let enabled = expose == "1" || expose.eq_ignore_ascii_case("true");
    if !enabled {
        return HttpResponse::Forbidden().json(json!({ "error": "disabled" }));
    }

    let rr_enabled = std::env::var("RR_ENABLED").ok().map(|v| v != "false").unwrap_or(true);
    let chains = get_supported_networks();

    let mut map = serde_json::Map::new();
    for c in &chains {
        let ups = pick_upstreams(c);
        let list: Vec<serde_json::Value> = ups
            .iter()
            .map(|u: &String| {
                let s: &str = u.as_str();
                let masked = mask_upstream_url(s);
                let is_down = cb_is_down(s);
                let ttl_down_secs: u64 = if is_down { 0 } else { 0 }; // placeholder until CB TTL is exposed
                json!({
                    "url": masked,
                    "provider": provider_label(&u),
                    "status": if is_down { "down" } else { "up" },
                    "ttl_down_secs": ttl_down_secs
                })
            })
            .collect();
        map.insert((*c).to_string(), serde_json::Value::Array(list));
    }

    HttpResponse::Ok().json(json!({
        "rr_enabled": rr_enabled,
        "chains": serde_json::Value::Object(map)
    }))
}