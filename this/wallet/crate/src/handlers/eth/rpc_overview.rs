use actix_web::{HttpResponse, web};
use tera::{Tera, Context};
use crate::core::eth::ALLOW_METHODS;
use crate::core::eth::networks::get_supported_networks;
pub async fn rpc_overview(
    tmpl: web::Data<Tera>,
    chains: web::Data<Vec<String>>,
    base: web::Data<String>,
) -> HttpResponse {
    // Collect and sort allowed methods
    let mut methods: Vec<&str> = ALLOW_METHODS.iter().copied().collect();
    methods.sort();
    let nets = get_supported_networks();
    let mut ctx = Context::new();
    ctx.insert("title", "JSON-RPC Overview — This.Wallet API");
    ctx.insert("methods", &methods);
    ctx.insert("chains", &**chains);
    ctx.insert("base", &**base);
    ctx.insert("nets", &nets);
    match tmpl.render("pages/eth/RPC_Overview.html", &ctx) {
        Ok(html) => HttpResponse::Ok().content_type("text/html").body(html),
        Err(_) => HttpResponse::InternalServerError().body("Template error"),
    }
}