#!/bin/sh
set -eu

# Only reload for QAVIO's own successfully renewed certificate.
case "${RENEWED_LINEAGE:-}" in
  /etc/letsencrypt/live/qavio.longh.org|/etc/letsencrypt/live/qavio.site)
    /usr/sbin/nginx -t
    /usr/bin/systemctl reload nginx
    ;;
esac
