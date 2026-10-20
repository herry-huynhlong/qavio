#!/bin/sh
set -eu

# Only reload for QAVIO's own successfully renewed certificate.
if [ "${RENEWED_LINEAGE:-}" = "/etc/letsencrypt/live/qavio.longh.org" ]; then
    /usr/sbin/nginx -t
    /usr/bin/systemctl reload nginx
fi
