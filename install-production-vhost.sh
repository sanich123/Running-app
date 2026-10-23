#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo 'This installer must run as root.' >&2
  exit 1
fi

command -v nginx >/dev/null || { echo 'Host Nginx is required.' >&2; exit 1; }
command -v systemctl >/dev/null || { echo 'systemd is required to reload host Nginx.' >&2; exit 1; }
nginx -t

SOURCE_CONFIG=/opt/runich-web-production/nginx.host.production.conf
CONF_DIR=/etc/nginx/conf.d
HOST_CONFIG="$CONF_DIR/runich-web-production.conf"
ACME_CONFIG="$CONF_DIR/runich-web-production-acme.conf"
WEBROOT=/var/www/runich-app-acme
CERT=/etc/letsencrypt/live/runich-app.ru/fullchain.pem
KEY=/etc/letsencrypt/live/runich-app.ru/privkey.pem
WEB_ROOT=/opt/runich-web-production

[ -s "$SOURCE_CONFIG" ] || { echo "Missing host Nginx config: $SOURCE_CONFIG" >&2; exit 1; }
[ -s "$WEB_ROOT/current/index.html" ] || { echo "Production web export is missing: $WEB_ROOT/current/index.html" >&2; exit 1; }
[ -d "$CONF_DIR" ] || { echo "Host Nginx include directory not found: $CONF_DIR" >&2; exit 1; }

if [ -e "$HOST_CONFIG" ] && ! grep -q '^# Managed by Runich web deploy workflow\.$' "$HOST_CONFIG"; then
  echo "Refusing to replace unmanaged Nginx config: $HOST_CONFIG" >&2
  exit 1
fi
if [ ! -e "$HOST_CONFIG" ] && nginx -T 2>/dev/null | grep -E 'server_name[[:space:]]+[^;]*([[:space:]]|^)runich-app\.ru([[:space:];])' >/dev/null; then
  echo 'An existing host Nginx virtual host already names runich-app.ru; review and merge the static root route first.' >&2
  exit 1
fi

if [ ! -s "$CERT" ] || [ ! -s "$KEY" ]; then
  command -v certbot >/dev/null || { echo 'Certbot is required to issue the runich-app.ru certificate.' >&2; exit 1; }
  if [ -e "$ACME_CONFIG" ] && ! grep -q '^# Managed by Runich web deploy workflow\.$' "$ACME_CONFIG"; then
    echo "Refusing to replace unmanaged Nginx config: $ACME_CONFIG" >&2
    exit 1
  fi
  install -d -m 0755 "$WEBROOT/.well-known/acme-challenge"
  acme_installed=false
  cleanup_acme() {
    if [ "$acme_installed" = true ]; then
      rm -f "$ACME_CONFIG"
      if nginx -t; then systemctl reload nginx; fi
    fi
  }
  trap cleanup_acme EXIT
  cat > "$ACME_CONFIG" <<'NGINX'
# Managed by Runich web deploy workflow.
server {
    listen 80;
    server_name runich-app.ru;
    location ^~ /.well-known/acme-challenge/ { root /var/www/runich-app-acme; }
    location / { return 404; }
}
NGINX
  chmod 0644 "$ACME_CONFIG"
  acme_installed=true
  nginx -t
  systemctl reload nginx
  certbot certonly --webroot --webroot-path "$WEBROOT" \
    --domain runich-app.ru --cert-name runich-app.ru \
    --non-interactive --agree-tos --register-unsafely-without-email
  rm -f "$ACME_CONFIG"
  acme_installed=false
  trap - EXIT
fi

backup=''
if [ -e "$HOST_CONFIG" ]; then
  backup="$(mktemp "$CONF_DIR/runich-web-production.backup.XXXXXX")"
  cp -p "$HOST_CONFIG" "$backup"
fi
restore_config() {
  if [ -n "$backup" ]; then
    cp -p "$backup" "$HOST_CONFIG"
    rm -f "$backup"
  else
    rm -f "$HOST_CONFIG"
  fi
}

install -m 0644 "$SOURCE_CONFIG" "$HOST_CONFIG"
if ! nginx -t; then
  restore_config
  exit 1
fi
if ! systemctl reload nginx; then
  restore_config
  nginx -t && systemctl reload nginx || true
  exit 1
fi
[ -z "$backup" ] || rm -f "$backup"
echo 'Host Nginx now serves the Production web from /opt/runich-web-production/current.'
