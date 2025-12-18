

use actix_web::{HttpResponse, http::StatusCode};
use serde_json::json;

/// Build a JSON response with an explicit HTTP status.
pub fn json_response(status: StatusCode, body: serde_json::Value) -> HttpResponse {
    HttpResponse::build(status)
        .content_type("application/json")
        .body(body.to_string())
}

/// Convenience helper to return a JSON error payload with the given status.
pub fn error_response(status: StatusCode, message: &str) -> HttpResponse {
    json_response(status, json!({ "error": message }))
}