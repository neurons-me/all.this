use actix_web::{web, HttpResponse, Responder};
use tera::{Context, Tera};

/// `GET /stellar` — Renders a simple Stellar landing page (Coming Soon).
pub async fn stellar_home(tmpl: web::Data<Tera>) -> impl Responder {
    let mut ctx = Context::new();
    ctx.insert("title", "Stellar — This.Wallet");

    // Base URL used by layout/header for absolute links if needed
    let base = std::env::var("PUBLIC_BASE").unwrap_or_else(|_| "http://localhost:7878".to_string());
    ctx.insert("base", &base);

    match tmpl.render("pages/stellar/stellar.html", &ctx) {
        Ok(html) => HttpResponse::Ok()
            .content_type("text/html; charset=utf-8")
            .body(html),
        Err(e) => HttpResponse::InternalServerError()
            .content_type("text/plain; charset=utf-8")
            .body(format!("template error: {e}")),
    }
}