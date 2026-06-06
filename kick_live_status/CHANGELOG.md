# Changelog

## 1.2.9

### Added

- Added custom AppArmor security profile to improve Home Assistant security rating to 6

## 1.2.8

### Added

- Added `max_backoff` configuration variable to customize maximum exponential backoff time

## 1.2.7

### Changed

- Upgraded base Docker image from Node 22 to Node 26

## 1.2.6

### Changed

- Upgraded base Docker image from Node 20 to Node 22 LTS

## 1.2.5

### Changed

- Default scan interval increased from 30s to 60s
- Minimum configurable scan interval raised from 10s to 30s

### Added

- Exponential backoff on consecutive poll failures (doubles each failure, max 12 hours)
- Automatic recovery to base interval on successful poll

## 1.2.4

### Fixed

- Reduced log noise by only logging on state transitions (live↔offline)
- Removed stream title from log output to prevent Home Assistant log spam

## 1.2.3

### Changed

- Removed image proxy and reverted to using category thumbnail for entity_picture

## 1.2.2

### Added

- Image proxy for category thumbnails

## 1.2.1

### Changed

- Use category thumbnail for entity_picture when channel is live

## 1.2.0

### Fixed

- Switched to node:20-alpine base image
- Read /data/options.json directly instead of relying on s6-overlay

## 1.1.0

### Added

- Configuration schema with default options
- build.yaml for multi-architecture support

## 1.0.0

### Added

- Initial release
- Monitor Kick.com streamers and expose live status as Home Assistant binary sensors
- OAuth2 client credentials authentication
- Configurable scan interval and channel list
