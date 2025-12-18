use actix_web::{HttpResponse, Responder};

/// `GET /health` — Simple health check endpoint.
pub async fn health() -> impl Responder {
    HttpResponse::Ok().body("ok")
}