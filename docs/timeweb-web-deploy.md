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

- Stage uses the existing Docker Nginx stack. Deploy the backend `stage` workflow containing the new web vhost, certificate setup, and OAuth redirect before the first Stage web deploy. `stage-web.runich-app.ru` now has an A record pointing to `129.101.119.34`; `stage.runich-app.ru` remains the API.
- Production uses the host Nginx that already fronts the API. The first web deploy installs a separate `runich-app.ru` vhost and requests a Let's Encrypt certificate when one is not present. Deploy the backend `master` workflow update before testing Production OAuth redirects. The host needs Nginx, systemd, and Certbot. The installer stops if another Nginx vhost already claims `runich-app.ru`, so that route can be reviewed before it is changed.
- Before enabling the Production workflow, install the root-owned helper once on the Production server: `sudo install -o root -g root -m 0755 install-production-vhost.sh /usr/local/sbin/runich-install-production-vhost`. Grant the Production deploy account non-interactive sudo for exactly `/usr/local/sbin/runich-install-production-vhost`; the workflow calls this fixed, root-owned path.
- `runich-app.ru` already points to `72.56.9.5`. The Stage web A record has been added as `stage-web.runich-app.ru → 129.101.119.34` (TTL 600).

No CDN is configured. GitHub Actions deploys both web environments directly to Timeweb.
