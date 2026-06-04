# Kick Live Status

A Home Assistant add-on to monitor Kick.com streamers and expose their live status as binary sensors.

## Configuration Variables

Configure these options in the add-on settings:

- **`client_id`** *(Required)*: Your Kick Developer application client ID. Register your application at [Kick Developer Settings](https://kick.com/settings/developer) to get one.
- **`client_secret`** *(Required)*: Your Kick Developer application client secret.
- **`channels`** *(Required)*: A list of channel slug names to monitor.
- **`scan_interval`** *(Optional)*: How often to poll Kick.com API in seconds. Default is `60`. Minimum is `30`.

Create a new application in your Kick settings and paste the generated ID and secret into the add-on configuration.
