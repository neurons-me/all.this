use actix_web::{web, HttpResponse, Responder};
use tera::{Tera, Context};
use crate::core::eth::{ALLOW_METHODS};
use crate::core::eth::networks::get_supported_networks;
/// GET /eth/endpoints — página con los endpoints por red
pub async fn endpoints_page(
    tmpl: web::Data<Tera>,
    chains: web::Data<Vec<String>>,
    base: web::Data<String>,
) -> impl Responder {
    // Métodos permitidos para el sidebar
    let mut methods: Vec<&'static str> = ALLOW_METHODS.iter().copied().collect();
    methods.sort_unstable();
    // Redes soportadas (también para sidebar y para el listado de esta página)
    let nets = get_supported_networks();
    // Contexto Tera
    let mut ctx = Context::new();
    ctx.insert("title", "ETH Endpoints — This.Wallet");
    ctx.insert("methods", &methods);
    ctx.insert("nets", &nets);
    ctx.insert("chains", &**chains);
    ctx.insert("base", &**base);
    // Valores “seguros” para includes que marcan activo
    ctx.insert("chain", &"");
    ctx.insert("method_selected", &"");
    match tmpl.render("pages/eth/eth_endpoints.html", &ctx) {
        Ok(html) => HttpResponse::Ok()
            .content_type("text/html; charset=utf-8")
            .body(html),
        Err(e) => HttpResponse::InternalServerError()
            .content_type("text/plain; charset=utf-8")
            .body(format!("Template render error on eth_endpoints.html:\n{e:#}")),
    }
}