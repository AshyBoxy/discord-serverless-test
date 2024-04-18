#!/usr/bin/env bash
if ! command -v curl &> /dev/null ; then echo "curl not installed" ; exit 1 ; fi
if ! command -v jq &> /dev/null ; then echo "jq not installed" ; exit 1 ; fi
if [ -z "$DISCORD_TOKEN" ] ; then echo 'set $DISCORD_TOKEN' ; exit 1 ; fi

function d_curl() {
    curl -sS -H "Authorization: Bot $DISCORD_TOKEN" -H "Content-Type: application/json" "https://discord.com/api/v10/$1" "${@:2}"
}

our_id="$(d_curl applications/@me | jq -r '.id')"

for i in ./commands/* ; do
    d_curl "applications/$our_id/commands" -X POST -d @$i | jq
done
