resource "digitalocean_app" "frontend" {
  spec {
    name   = var.app_name
    region = var.app_region

    static_site {
      name = "frontend"

      github {
        repo           = "${var.github_owner}/${var.github_repo}"
        branch         = var.source_branch
        deploy_on_push = true
      }

      source_dir    = "/"
      build_command = "npm ci && npm run build"
      output_dir    = "dist"

      env {
        key   = "VITE_API_BASE_URL"
        value = var.api_base_url
        type  = "GENERAL"
        scope = "BUILD_TIME"
      }

      env {
        key   = "VITE_OAUTH_CLIENT_ID"
        value = var.oauth_client_id
        type  = "GENERAL"
        scope = "BUILD_TIME"
      }
    }
  }
}

data "digitalocean_project" "main" {
  count = var.project_name == "" ? 0 : 1
  name  = var.project_name
}

resource "digitalocean_project_resources" "frontend" {
  count     = var.project_name == "" ? 0 : 1
  project   = data.digitalocean_project.main[0].id
  resources = [digitalocean_app.frontend.urn]
}
