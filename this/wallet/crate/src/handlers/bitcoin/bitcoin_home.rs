use actix_web::{web, HttpResponse};
use tera::{Tera, Context};

pub async fn bitcoin_home(tmpl: web::Data<Tera>) -> HttpResponse {
    let mut ctx = Context::new();
    ctx.insert("title", "Bitcoin — This.Wallet");

    match tmpl.render("pages/bitcoin/bitcoin.html", &ctx) {
        Ok(html) => HttpResponse::Ok()
            .content_type("text/html; charset=utf-8")
            .body(html),
        Err(e) => HttpResponse::InternalServerError()
            .content_type("text/plain; charset=utf-8")
            .body(format!("Template render error on bitcoin.html:\n{e:#}")),
    }
}