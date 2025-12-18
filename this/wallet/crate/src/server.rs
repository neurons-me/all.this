/// Actix server bootstrap: builds CORS, sets up middleware, and attaches routes.
/// Keep this file focused on server config; add new routes in `router.rs`.
use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger};
use actix_files::Files;
use actix_web::web;
use tera::Tera;
use num_cpus::get;
use crate::router::configure_routes;
/// Launches the Actix HTTP server with permissive CORS and logger middleware.
pub async fn run_server(bind: &str) -> std::io::Result<()> {
    // Initialize Tera templates from the filesystem (dev-friendly)
    let tera = Tera::new("src/templates/**/*")
        .expect("failed to initialize Tera with pattern src/templates/**/*");
    let tera = web::Data::new(tera);
    // Shared app data for handlers (chains list and public base URL)
    let chains: Vec<String> = vec![
        "mainnet".to_string(),
        "sepolia".to_string(),
        "goerli".to_string(),
        "bnb".to_string(),
    ];
    let base: String = std::env::var("PUBLIC_BASE").unwrap_or_else(|_| "http://localhost:7878".to_string());
    HttpServer::new(move || {
        App::new()
            .app_data(tera.clone())
            .app_data(web::Data::new(chains.clone()))
            .app_data(web::Data::new(base.clone()))
            .service(Files::new("/static", "src/static").prefer_utf8(true))
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .configure(configure_routes)
    })
    .bind(bind)?
    // Use at least 2 workers, scale automatically with CPU count.
    .workers(get().max(2))
    .run()
    .await
}