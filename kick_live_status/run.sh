#!/usr/bin/with-contenv bashio

export KICK_CLIENT_ID=$(bashio::config 'client_id')
export KICK_CLIENT_SECRET=$(bashio::config 'client_secret')
export KICK_CHANNELS=$(bashio::config 'channels')
export KICK_SCAN_INTERVAL=$(bashio::config 'scan_interval')

bashio::log.info "Starting Kick Live Status add-on..."
bashio::log.info "Monitoring channels: ${KICK_CHANNELS}"
bashio::log.info "Scan interval: ${KICK_SCAN_INTERVAL}s"

exec node /app/index.js
