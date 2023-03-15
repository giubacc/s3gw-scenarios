#!/bin/bash

usage() {
  cat << EOF
usage: $0 CMD

commands
  all
  nou
EOF
}

cmd="${1}"
shift 1

[[ -z "${cmd}" ]] && \
  usage && exit 1


if [[ "${cmd}" != "nou" ]]; then
chatterbox -n -f admin_create_user.yaml                         || exit 1
fi
chatterbox -n -f ensure_bucket.yaml                             || exit 1
chatterbox -n -f bucket_versioning.yaml                         || exit 1
chatterbox -n -f bucket_object_lock_default_configuration.yaml  || exit 1
chatterbox -n -f object_lock_retention_governance.json          || exit 1
chatterbox -n -f object_lock_retention_compliance.yaml          || exit 1
