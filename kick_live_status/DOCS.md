# Kick Live Status

Monitor Kick.com streamers and expose their live status as sensors in Home Assistant.

## How it works

This add-on polls the Kick.com API at a configurable interval and creates a `binary_sensor` entity for each monitored channel. The sensor turns **ON** when the streamer is live and **OFF** when they're offline.

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `client_id` | Your Kick.com app Client ID | (required) |
| `client_secret` | Your Kick.com app Client Secret | (required) |
| `channels` | List of Kick channel slugs to monitor | `[]` |
| `scan_interval` | Polling interval in seconds (10–300) | `30` |

### Getting your Kick API credentials

1. Go to [kick.com/settings/developer](https://kick.com/settings/developer)
2. Create a new app (or use an existing one)
3. Copy the **Client ID** and **Client Secret**

## Entities

For each channel in your list, the add-on creates:

**`binary_sensor.kick_<channel_slug>`**

| Attribute | Description |
|-----------|-------------|
| `stream_title` | Current stream title |
| `viewer_count` | Number of current viewers |
| `category` | Stream category (e.g. "Grand Theft Auto V") |
| `thumbnail` | Stream thumbnail URL |
| `started_at` | Stream start time (ISO 8601) |
| `channel_url` | Direct link to the Kick channel |

## Example automations

```yaml
# Send a notification when a streamer goes live
automation:
  - alias: "Kick streamer went live"
    trigger:
      - platform: state
        entity_id: binary_sensor.kick_<your_channel>
        to: "on"
    action:
      - service: notify.mobile_app
        data:
          title: >
            🟢 {{ state_attr(trigger.entity_id, 'friendly_name') }} is LIVE!
          message: >
            {{ state_attr(trigger.entity_id, 'stream_title') }}
```

