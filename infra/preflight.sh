#!/bin/sh
set -eu
if [ -f /data/PG_VERSION ]; then
  version="$(cat /data/PG_VERSION)"
  [ "$version" = "15" ] || { echo "PostgreSQL major incompatible: se requiere 15; no se modifica el volumen."; exit 1; }
elif [ -n "$(ls -A /data)" ]; then
  echo "Volumen no vacío sin PG_VERSION: inspección manual necesaria."; exit 1
fi
echo "Preflight del volumen correcto."

