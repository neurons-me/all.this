use actix_web::HttpRequest;
/// Try to get the real client IP, honoring common proxy headers.
pub fn client_ip(req: &HttpRequest) -> String {
    // Prefer X-Forwarded-For first IP; fallback to X-Real-IP; else Actix connection info.
    if let Some(v) = req.headers().get("x-forwarded-for").and_then(|h| h.to_str().ok()) {
        if let Some(first) = v.split(',').next() {
            return first.trim().to_string();
        }
    }
    if let Some(v) = req.headers().get("x-real-ip").and_then(|h| h.to_str().ok()) {
        return v.trim().to_string();
    }
    req.connection_info().realip_remote_addr().unwrap_or("anonymous").to_string()
}