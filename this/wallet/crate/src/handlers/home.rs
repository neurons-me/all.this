use actix_web::{web, HttpResponse, Responder};
use tera::{Tera, Context};
use crate::core::eth::{ALLOW_METHODS, get_supported_networks};
/// `GET /` — Home page rendered with Tera (extends layout.html)
pub async fn home(tmpl: web::Data<Tera>) -> impl Responder {
    let mut methods: Vec<&'static str> = ALLOW_METHODS.iter().copied().collect();
    methods.sort_unstable();
    let networks = get_supported_networks();
    let base = std::env::var("PUBLIC_BASE").unwrap_or_else(|_| "http://localhost:7878".to_string());
    let mut ctx = Context::new();
    ctx.insert("title", "This.Wallet API");
    ctx.insert("methods", &methods);
    ctx.insert("networks", &networks);
    ctx.insert("base", &base);
    match tmpl.render("pages/home.html", &ctx) {
        Ok(html) => HttpResponse::Ok().content_type("text/html; charset=utf-8").body(html),
        Err(e) => HttpResponse::InternalServerError().body(format!("template error: {}", e)),
    }
}