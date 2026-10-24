# Timeweb web deployment

The web workflows build `dist/` from the exact commit and publish it over pinned SSH:

- A push to `stage` deploys Stage to `https://stage-web.runich-app.ru`.
- A push to `master` deploys Production to `https://runich-app.ru`.

Both builds use the existing export scripts, so Stage calls `https://stage.runich-app.ru` and Production calls `https://api.runich-app.ru`.

## GitHub environments and secrets

Create the `stage` and `production` environments in the frontend repository and add:

| Environment  | Secret                     | Value                                               |
| ------------ | -------------------------- | --------------------------------------------------- |
| `stage`      | `STAGE_DEPLOY_HOST`        | `129.101.119.34`                                    |
| `stage`      | `STAGE_DEPLOY_SSH_KEY`     | Private key for `runich-deploy` on the Stage server |
| `stage`      | `STAGE_DEPLOY_KNOWN_HOSTS` | Pinned SSH host key for the Stage server            |
| `production` | `DEPLOY_HOST`              | `72.56.9.5`                                         |
| `production` | `DEPLOY_USER`              | Production SSH deployment account                   |
| `production` | `DEPLOY_SSH_KEY`           | Private key for the Production deployment account   |
| `production` | `DEPLOY_KNOWN_HOSTS`       | Pinned SSH host key for the Production server       |

Values are scoped to the frontend repository. Existing backend repository secrets do not automatically carry over.

## Server prerequisites

- Stage and Production use the same pinned Docker Nginx image and the same backend template at `deploy/nginx/runich.conf.template`. The backend Compose deployment owns both API and web virtual hosts, TLS, HTTP/2 and HTTP/3; the client web workflow only switches the deployed static release. Allow inbound UDP 443 in the Timeweb firewall.
- `stage-web.runich-app.ru` points to `129.101.119.34`; `stage.runich-app.ru` is the Stage API. Production web and API use `runich-app.ru` and `api.runich-app.ru`.
- Before the first Production Docker Nginx deployment, install the backend's root-owned `scripts/production-nginx-cutover.sh` helper at `/usr/local/sbin/runich-production-nginx-cutover`. Grant the Production deploy account non-interactive sudo for exactly that helper; it disables the old host Nginx and Certbot renewal timer after the container configuration and existing certificates have been validated.
- For the first Production cutover, deploy the web release first, then deploy the backend. The web workflow can publish and verify the static release while the old host Nginx is still serving it; it starts enforcing the shared Docker Nginx and HTTP/3 checks once that service is running. The backend workflow requires the web release and both certificates before it disables host Nginx.
- `runich-app.ru` already points to `72.56.9.5`. The Stage web A record has been added as `stage-web.runich-app.ru → 129.101.119.34` (TTL 600).

No CDN is configured. GitHub Actions deploys both web environments directly to Timeweb.
