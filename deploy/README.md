# Frontend deployment

This Terraform configuration deploys the Vite frontend as a DigitalOcean App Platform static site. App Platform builds the repository on pushes to the configured branch and serves the generated `dist` directory through its CDN.

Run Terraform from `deploy/terraform`. Configure the following values using a `*.tfvars` file (kept out of version control) or `TF_VAR_*` environment variables:

- `do_token`: DigitalOcean API token (`TF_VAR_do_token`)
- `api_base_url`: public GAS backoffice API URL (`TF_VAR_api_base_url`)

The GitHub owner, repository, branch, region, and DigitalOcean project can be overridden with their corresponding Terraform variables. The default project name is `GAS`; set `project_name = ""` to skip associating the app with a project.

`VITE_API_BASE_URL` is a build-time value because Vite embeds it into the static bundle. It is public configuration and must not contain secrets.

Terraform manages DigitalOcean resources only. The GitHub repository and branch identify the deployment source; this configuration does not manage GitHub resources or require a GitHub provider or token.
