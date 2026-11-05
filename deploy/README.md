# Frontend deployment

This Terraform configuration deploys the Vite frontend as a DigitalOcean App Platform static site. App Platform builds the repository on pushes to the configured branch and serves the generated `dist` directory through its CDN.

Run Terraform from `deploy/terraform`. Configure the following values using a `*.tfvars` file (kept out of version control) or `TF_VAR_*` environment variables:

- `do_token`: DigitalOcean API token (`TF_VAR_do_token`)
- `api_base_url`: public GAS backoffice API URL (`TF_VAR_api_base_url`)
- `oauth_client_id`: public OAuth client ID (`TF_VAR_oauth_client_id`)

The GitHub owner, repository, branch, region, and DigitalOcean project can be overridden with their corresponding Terraform variables. The default project name is `GAS`; set `project_name = ""` to skip associating the app with a project.

The two `VITE_*` settings are build-time values because Vite embeds them into the static bundle. They are public configuration and must not contain secrets.
