/// Router: centralizes all routes for the Actix server.
/// Any new endpoints should be added here to keep `main.rs` and `server.rs` clean.
use actix_web::web;
use crate::handlers;
use crate::handlers::health::health;
use crate::handlers::bitcoin::bitcoin_home::bitcoin_home;
use crate::handlers::stellar::stellar_home::stellar_home;
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        .route("/health", web::get().to(health))
        .route("/meta", web::get().to(handlers::eth::meta::meta))
        .route("/meta/evm-networks", web::get().to(handlers::eth::networks::evm_networks))
        .route("/meta/upstreams", web::get().to(handlers::eth::dev_upstream::meta_upstreams))
        .route("/", web::get().to(handlers::home::home))
        //ethereum
        .route("/ethereum", web::get().to(handlers::eth::ethereum::ethereum))
        .route("/json-rpc-overview", web::get().to(handlers::eth::rpc_overview::rpc_overview))
        .route("/dev/eth-upstreams", web::get().to(handlers::eth::dev_upstream::dev_upstreams_page))
        .route("/eth-playground", web::get().to(handlers::eth::eth_playground::eth_playground))
        .route("/eth/endpoints", web::get().to(handlers::eth::endpoints::endpoints_page))
        .route("/evm-networks-page", web::get().to(handlers::eth::networks::evm_networks_page))
        //bitcoin
        .route("/bitcoin", web::get().to(bitcoin_home))
        //stellar
        .route("/stellar", web::get().to(stellar_home))
        .service(
            web::resource("/rpc")
                .route(
                    web::route()
                        .guard(actix_web::guard::Options())
                        .to(handlers::eth::rpc::rpc_options))
                .route(web::post().to(handlers::eth::rpc::rpc)),
        );
}