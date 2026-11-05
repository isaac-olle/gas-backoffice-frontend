output "app_id" {
  description = "DigitalOcean App Platform app ID."
  value       = digitalocean_app.frontend.id
}

output "live_url" {
  description = "Default public URL for the deployed frontend."
  value       = digitalocean_app.frontend.default_ingress
}
