#!/bin/bash

usage() {
  cat << EOF
usage: $0 CMD

commands
  all
  no-0
EOF
}

cmd="${1}"
shift 1

[[ -z "${cmd}" ]] && \
  usage && exit 1


if [[ "${cmd}" != "no-0" ]]; then
chatterbox -n -f 0_admin_create_user.json             || exit 1
fi
chatterbox -n -f 1_ensure_bucket.json                 || exit 1
chatterbox -n -f 2_bucket_configuration.json          || exit 1
chatterbox -n -f 3_bucket_versioning.json             || exit 1
chatterbox -n -f 4_object_default_retention.json      || exit 1
