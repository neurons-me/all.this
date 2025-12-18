use once_cell::sync::Lazy;
use reqwest::Client;
use std::time::Duration;

/// Shared HTTP client for all upstream RPC requests.
/// Uses short timeouts to ensure quick failover.
pub static HTTP: Lazy<Client> = Lazy::new(|| {
    Client::builder()
        .timeout(Duration::from_secs(6))
        .build()
        .expect("Failed to build reqwest client")
});